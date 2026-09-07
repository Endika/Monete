-- Move Monete out of `public` into its own `monete` schema, so apps-prod keeps
-- one schema per app (EventSplit stays in public, Agora already has `agora`).
-- Tables, view and functions move with ALTER ... SET SCHEMA (preserving OIDs, so
-- the parties_guard_schema trigger and every ACL survive); the function bodies
-- are then re-created because search_path='' forces fully qualified references.

create schema if not exists monete;
grant usage on schema monete to anon;

alter table public.parties set schema monete;
alter table public.pin_attempts set schema monete;
alter view public.party_sizes set schema monete;

alter function public.append_rsvp(text, jsonb) set schema monete;
alter function public.create_party(text, jsonb, text) set schema monete;
alter function public.delete_party(text, text) set schema monete;
alter function public.get_party(text) set schema monete;
alter function public.get_party_version(text) set schema monete;
alter function public.guard_party_schema() set schema monete;
alter function public.monete_pin_fail(text) set schema monete;
alter function public.monete_pin_guard(text) set schema monete;
alter function public.monete_pin_hash(text, text) set schema monete;
alter function public.monete_pin_ok(text) set schema monete;
alter function public.remove_rsvp(text, text) set schema monete;
alter function public.set_party_pin(text, text, text) set schema monete;
alter function public.update_party(text, jsonb, integer, text) set schema monete;
alter function public.update_rsvp(text, text, jsonb) set schema monete;
alter function public.verify_party_pin(text, text) set schema monete;

-- Re-point every body at monete.*

create or replace function monete.monete_pin_hash(p_pin text, p_id text)
returns text language sql immutable set search_path to 'extensions' as $$
  select encode(digest(p_pin || '|' || p_id || '|monete-v1', 'sha256'), 'hex');
$$;

create or replace function monete.monete_pin_guard(p_id text)
returns void language plpgsql security definer set search_path to '' as $$
declare v_fails int; v_start timestamptz;
begin
  select fails, window_start into v_fails, v_start
  from monete.pin_attempts where party_id = p_id;
  if found and now() - v_start <= interval '15 minutes' and v_fails >= 10 then
    raise exception 'too many pin attempts' using errcode = 'PT429';
  end if;
end;
$$;

create or replace function monete.monete_pin_fail(p_id text)
returns void language plpgsql security definer set search_path to '' as $$
begin
  insert into monete.pin_attempts (party_id, fails, window_start)
  values (p_id, 1, now())
  on conflict (party_id) do update
    set fails = case when now() - pin_attempts.window_start > interval '15 minutes'
                     then 1 else pin_attempts.fails + 1 end,
        window_start = case when now() - pin_attempts.window_start > interval '15 minutes'
                           then now() else pin_attempts.window_start end;
end;
$$;

create or replace function monete.monete_pin_ok(p_id text)
returns void language plpgsql security definer set search_path to '' as $$
begin
  delete from monete.pin_attempts where party_id = p_id;
end;
$$;

create or replace function monete.get_party(p_id text)
returns jsonb language sql security definer set search_path to '' as $$
  select jsonb_build_object(
    'data', data - 'editPin',
    'version', version,
    'hasPin', pin_hash is not null
  )
  from monete.parties where id = p_id and active;
$$;

create or replace function monete.get_party_version(p_id text)
returns integer language sql security definer set search_path to '' as $$
  select version from monete.parties where id = p_id and active;
$$;

create or replace function monete.create_party(p_id text, p_data jsonb, p_pin_hash text)
returns integer language plpgsql security definer set search_path to '' as $$
declare v_clean jsonb;
begin
  if p_id !~ '^[a-z0-9]{7}$' then
    raise exception 'invalid party id' using errcode = 'PT400';
  end if;
  v_clean := p_data - 'editPin';
  if length(v_clean::text) > 262144 then
    raise exception 'party too large' using errcode = 'PT413';
  end if;
  insert into monete.parties (id, version, schema_version, pin_hash, active, data)
  values (p_id, 1, coalesce((v_clean->>'_schemaVersion')::int, 1), p_pin_hash, true, v_clean);
  return 1;
end;
$$;

create or replace function monete.update_party(p_id text, p_data jsonb, p_expected_version integer, p_pin text)
returns integer language plpgsql security definer set search_path to '' as $$
declare
  v_pin_hash text;
  v_clean jsonb;
  v_new_version int;
begin
  select pin_hash into v_pin_hash from monete.parties where id = p_id and active;
  if not found then
    raise exception 'party not found' using errcode = 'PT404';
  end if;
  if v_pin_hash is not null then
    perform monete.monete_pin_guard(p_id);
    if p_pin is null or monete.monete_pin_hash(p_pin, p_id) <> v_pin_hash then
      perform monete.monete_pin_fail(p_id);
      raise exception 'invalid pin' using errcode = 'PT401';
    end if;
    perform monete.monete_pin_ok(p_id);
  end if;
  v_clean := p_data - 'editPin';
  if length(v_clean::text) > 262144 then
    raise exception 'party too large' using errcode = 'PT413';
  end if;
  update monete.parties
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

create or replace function monete.set_party_pin(p_id text, p_new_pin text, p_current_pin text)
returns void language plpgsql security definer set search_path to '' as $$
declare v_pin_hash text;
begin
  select pin_hash into v_pin_hash from monete.parties where id = p_id and active;
  if not found then
    raise exception 'party not found' using errcode = 'PT404';
  end if;
  if v_pin_hash is not null then
    perform monete.monete_pin_guard(p_id);
    if p_current_pin is null or monete.monete_pin_hash(p_current_pin, p_id) <> v_pin_hash then
      perform monete.monete_pin_fail(p_id);
      raise exception 'invalid pin' using errcode = 'PT401';
    end if;
    perform monete.monete_pin_ok(p_id);
  end if;
  if p_new_pin is not null and p_new_pin !~ '^\d{4,6}$' then
    raise exception 'invalid pin format' using errcode = 'PT400';
  end if;
  update monete.parties
  set pin_hash = case when p_new_pin is null then null
                      else monete.monete_pin_hash(p_new_pin, p_id) end,
      version = version + 1,
      updated_at = now()
  where id = p_id and active;
end;
$$;

create or replace function monete.verify_party_pin(p_id text, p_pin text)
returns boolean language plpgsql security definer set search_path to '' as $$
declare v_pin_hash text;
begin
  select pin_hash into v_pin_hash from monete.parties where id = p_id and active;
  if not found then return false; end if;
  if v_pin_hash is null then return true; end if;
  perform monete.monete_pin_guard(p_id);
  if monete.monete_pin_hash(p_pin, p_id) = v_pin_hash then
    perform monete.monete_pin_ok(p_id);
    return true;
  end if;
  perform monete.monete_pin_fail(p_id);
  return false;
end;
$$;

create or replace function monete.delete_party(p_id text, p_pin text)
returns void language plpgsql security definer set search_path to '' as $$
declare v_pin_hash text;
begin
  select pin_hash into v_pin_hash from monete.parties where id = p_id and active;
  if not found then
    raise exception 'party not found' using errcode = 'PT404';
  end if;
  if v_pin_hash is not null then
    perform monete.monete_pin_guard(p_id);
    if p_pin is null or monete.monete_pin_hash(p_pin, p_id) <> v_pin_hash then
      perform monete.monete_pin_fail(p_id);
      raise exception 'invalid pin' using errcode = 'PT401';
    end if;
    perform monete.monete_pin_ok(p_id);
  end if;
  delete from monete.parties where id = p_id;  -- cascades pin_attempts
end;
$$;

create or replace function monete.append_rsvp(p_id text, p_rsvp jsonb)
returns void language plpgsql security definer set search_path to '' as $$
begin
  if length(p_rsvp::text) > 8192 then
    raise exception 'rsvp too large' using errcode = 'PT413';
  end if;
  update monete.parties
  set data = jsonb_set(data, '{rsvps}', coalesce(data->'rsvps', '[]'::jsonb) || p_rsvp),
      updated_at = now()
  where id = p_id and active
    and jsonb_array_length(coalesce(data->'rsvps', '[]'::jsonb)) < 300
    and length(data::text) + length(p_rsvp::text) <= 262144;
  if not found then
    if exists (select 1 from monete.parties where id = p_id and active) then
      raise exception 'rsvp limit reached' using errcode = 'PT413';
    else
      raise exception 'party not found' using errcode = 'PT404';
    end if;
  end if;
end;
$$;

create or replace function monete.update_rsvp(p_id text, p_rsvp_id text, p_rsvp jsonb)
returns void language plpgsql security definer set search_path to '' as $$
begin
  if length(p_rsvp::text) > 8192 then
    raise exception 'rsvp too large' using errcode = 'PT413';
  end if;
  update monete.parties
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
    if exists (select 1 from monete.parties where id = p_id and active) then
      raise exception 'party too large' using errcode = 'PT413';
    else
      raise exception 'party not found' using errcode = 'PT404';
    end if;
  end if;
end;
$$;

create or replace function monete.remove_rsvp(p_id text, p_rsvp_id text)
returns void language sql security definer set search_path to '' as $$
  update monete.parties
  set data = jsonb_set(data, '{rsvps}', (
        select coalesce(jsonb_agg(elem) filter (where elem->>'id' <> p_rsvp_id), '[]'::jsonb)
        from jsonb_array_elements(data->'rsvps') elem)),
      updated_at = now()
  where id = p_id and active;
$$;
