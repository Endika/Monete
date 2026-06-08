-- supabase/migrations/0004_harden_access.sql
--
-- Security hardening (security-bar findings 1-5):
--  * Close direct anon access to public.parties (no bulk dump of minors' PII,
--    no PIN-bypassing direct writes). All access goes through SECURITY DEFINER
--    RPCs below.
--  * Enforce the edit PIN server-side via pgcrypto, using the SAME hash formula
--    as the client (sha256("<pin>|<partyId>|monete-v1")) so existing pin_hash
--    values keep verifying.
--  * Stop exposing the PIN hash to readers (get_party strips it, returns hasPin).
--  * Bound the RSVP RPCs against blob ballooning / egress abuse.
--
-- Caps (keep in sync with the TS in-memory fake): MAX_PARTY_BYTES=262144,
-- MAX_RSVP_BYTES=8192, MAX_RSVPS=300.

create extension if not exists pgcrypto with schema extensions;

-- Server-side mirror of the client EditPin hash. immutable: pin|id|salt -> hex sha256.
-- search_path includes extensions AND public so digest() resolves wherever pgcrypto
-- was installed (Supabase's `extensions` schema on new projects, or `public` on older
-- ones) — otherwise existing pin_hash values would fail to verify and lock hosts out.
-- encode() is in pg_catalog and always resolvable. Callers reference this function
-- fully-qualified (public.monete_pin_hash), so no search_path-hijack surface.
create or replace function public.monete_pin_hash(p_pin text, p_id text)
returns text language sql immutable set search_path = extensions, public as $$
  select encode(digest(p_pin || '|' || p_id || '|monete-v1', 'sha256'), 'hex');
$$;

-- 1 + 2: close direct table access. RLS stays enabled with NO policies => anon and
-- authenticated get nothing directly; everything routes through the RPCs.
drop policy if exists parties_select on public.parties;
drop policy if exists parties_insert on public.parties;
drop policy if exists parties_update on public.parties;
revoke all on public.parties from anon, authenticated;

-- Strip any leaked PIN hash that historic blobs carried in data.editPin.
update public.parties set data = data - 'editPin' where data ? 'editPin';

-- Create a party. Validates id shape, strips editPin, enforces blob cap.
create or replace function public.create_party(p_id text, p_data jsonb, p_pin_hash text)
returns int language plpgsql security definer set search_path = '' as $$
declare v_clean jsonb;
begin
  if p_id !~ '^[a-z0-9]{7}$' then
    raise exception 'invalid party id' using errcode = 'PT400';
  end if;
  v_clean := p_data - 'editPin';
  if length(v_clean::text) > 262144 then
    raise exception 'party too large' using errcode = 'PT413';
  end if;
  insert into public.parties (id, version, schema_version, pin_hash, active, data)
  values (p_id, 1, coalesce((v_clean->>'_schemaVersion')::int, 1), p_pin_hash, true, v_clean);
  return 1;
end;
$$;

-- Read one party by exact id. Never returns pin_hash/editPin; exposes hasPin only.
create or replace function public.get_party(p_id text)
returns jsonb language sql security definer set search_path = '' as $$
  select jsonb_build_object(
    'data', data - 'editPin',
    'version', version,
    'hasPin', pin_hash is not null
  )
  from public.parties where id = p_id and active;
$$;

create or replace function public.get_party_version(p_id text)
returns int language sql security definer set search_path = '' as $$
  select version from public.parties where id = p_id and active;
$$;

-- Host config update: optimistic CAS + server-side PIN check + blob cap.
-- The parties_guard_schema trigger still rejects a stale _schemaVersion.
create or replace function public.update_party(
  p_id text, p_data jsonb, p_expected_version int, p_pin text
) returns int language plpgsql security definer set search_path = '' as $$
declare
  v_pin_hash text;
  v_clean jsonb;
  v_new_version int;
begin
  select pin_hash into v_pin_hash from public.parties where id = p_id and active;
  if not found then
    raise exception 'party not found' using errcode = 'PT404';
  end if;
  if v_pin_hash is not null
     and (p_pin is null or public.monete_pin_hash(p_pin, p_id) <> v_pin_hash) then
    raise exception 'invalid pin' using errcode = 'PT401';
  end if;
  v_clean := p_data - 'editPin';
  if length(v_clean::text) > 262144 then
    raise exception 'party too large' using errcode = 'PT413';
  end if;
  update public.parties
  set data = v_clean,
      version = p_expected_version + 1,
      schema_version = coalesce((v_clean->>'_schemaVersion')::int, schema_version),
      updated_at = now()
  where id = p_id and active and version = p_expected_version
  returning version into v_new_version;
  if v_new_version is null then
    raise exception 'version conflict' using errcode = 'PT409';
  end if;
  return v_new_version;
end;
$$;

-- Set / change / remove the PIN. Changing or removing an existing PIN requires the
-- current PIN; setting the first PIN on a PIN-less party does not (parity with the
-- old client-side flow). Hashing happens here; the plaintext never lands in a blob.
create or replace function public.set_party_pin(p_id text, p_new_pin text, p_current_pin text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_pin_hash text;
begin
  select pin_hash into v_pin_hash from public.parties where id = p_id and active;
  if not found then
    raise exception 'party not found' using errcode = 'PT404';
  end if;
  if v_pin_hash is not null
     and (p_current_pin is null or public.monete_pin_hash(p_current_pin, p_id) <> v_pin_hash) then
    raise exception 'invalid pin' using errcode = 'PT401';
  end if;
  if p_new_pin is not null and p_new_pin !~ '^\d{4,6}$' then
    raise exception 'invalid pin format' using errcode = 'PT400';
  end if;
  update public.parties
  set pin_hash = case when p_new_pin is null then null
                      else public.monete_pin_hash(p_new_pin, p_id) end,
      version = version + 1,
      updated_at = now()
  where id = p_id and active;
end;
$$;

-- UX unlock check. True when there is no PIN or the PIN matches. NULL if not found.
create or replace function public.verify_party_pin(p_id text, p_pin text)
returns boolean language sql security definer set search_path = '' as $$
  select case when pin_hash is null then true
              else pin_hash = public.monete_pin_hash(p_pin, p_id) end
  from public.parties where id = p_id and active;
$$;

-- Guest RSVP submit: atomic append (single statement, row-lock serialized so
-- concurrent families never clobber), bounded by per-rsvp size, rsvp count, and
-- total blob size. append is the only count-growing path, so the total cap lives here.
create or replace function public.append_rsvp(p_id text, p_rsvp jsonb)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if length(p_rsvp::text) > 8192 then
    raise exception 'rsvp too large' using errcode = 'PT413';
  end if;
  update public.parties
  set data = jsonb_set(data, '{rsvps}', coalesce(data->'rsvps', '[]'::jsonb) || p_rsvp),
      updated_at = now()
  where id = p_id and active
    and jsonb_array_length(coalesce(data->'rsvps', '[]'::jsonb)) < 300
    and length(data::text) + length(p_rsvp::text) <= 262144;
  if not found then
    if exists (select 1 from public.parties where id = p_id and active) then
      raise exception 'rsvp limit reached' using errcode = 'PT413';
    else
      raise exception 'party not found' using errcode = 'PT404';
    end if;
  end if;
end;
$$;

-- Edit one rsvp by id: atomic single-statement replace, bounded by per-rsvp size AND
-- total blob size (so repeated edits can't balloon the blob past the cap the way append
-- guards against). The new-array subquery is duplicated in the WHERE size guard to keep
-- this a single atomic statement (row-lock serialized).
create or replace function public.update_rsvp(p_id text, p_rsvp_id text, p_rsvp jsonb)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if length(p_rsvp::text) > 8192 then
    raise exception 'rsvp too large' using errcode = 'PT413';
  end if;
  update public.parties
  set data = jsonb_set(data, '{rsvps}', (
        select coalesce(jsonb_agg(
          case when elem->>'id' = p_rsvp_id then p_rsvp else elem end), '[]'::jsonb)
        from jsonb_array_elements(coalesce(data->'rsvps', '[]'::jsonb)) elem)),
      updated_at = now()
  where id = p_id and active
    and length(jsonb_set(data, '{rsvps}', (
        select coalesce(jsonb_agg(
          case when elem->>'id' = p_rsvp_id then p_rsvp else elem end), '[]'::jsonb)
        from jsonb_array_elements(coalesce(data->'rsvps', '[]'::jsonb)) elem))::text) <= 262144;
  if not found then
    if exists (select 1 from public.parties where id = p_id and active) then
      raise exception 'party too large' using errcode = 'PT413';
    else
      raise exception 'party not found' using errcode = 'PT404';
    end if;
  end if;
end;
$$;

-- remove_rsvp only shrinks the blob; unchanged from 0002 except search_path already set.
create or replace function public.remove_rsvp(p_id text, p_rsvp_id text)
returns void language sql security definer set search_path = '' as $$
  update public.parties
  set data = jsonb_set(data, '{rsvps}', (
        select coalesce(jsonb_agg(elem) filter (where elem->>'id' <> p_rsvp_id), '[]'::jsonb)
        from jsonb_array_elements(data->'rsvps') elem)),
      updated_at = now()
  where id = p_id and active;
$$;

-- All app access is via these RPCs; grant only what the client needs.
grant execute on function public.create_party(text, jsonb, text) to anon;
grant execute on function public.get_party(text) to anon;
grant execute on function public.get_party_version(text) to anon;
grant execute on function public.update_party(text, jsonb, int, text) to anon;
grant execute on function public.set_party_pin(text, text, text) to anon;
grant execute on function public.verify_party_pin(text, text) to anon;
grant execute on function public.append_rsvp(text, jsonb) to anon;
grant execute on function public.update_rsvp(text, text, jsonb) to anon;
grant execute on function public.remove_rsvp(text, text) to anon;
