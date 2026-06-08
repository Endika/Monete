-- supabase/migrations/0005_pin_rate_limit.sql
--
-- Throttle online PIN guessing. The edit PIN is 4-6 digits; with the hash no longer
-- shipped, offline cracking is gone, but a link-holder could still brute-force the PIN
-- against the API. Cap it server-side: a per-party failed-attempt counter with a sliding
-- window, checked inside every PIN-verifying RPC.
--
-- Limit: 10 failed attempts / 15 minutes -> PT429 (PostgREST -> HTTP 429).

create table if not exists public.pin_attempts (
  party_id text primary key references public.parties(id) on delete cascade,
  fails int not null default 0,
  window_start timestamptz not null default now()
);

alter table public.pin_attempts enable row level security;
-- No policies + no grants: only the SECURITY DEFINER helpers below touch this table.
revoke all on public.pin_attempts from anon, authenticated;

-- Internal helpers. SECURITY DEFINER but NOT exposed: revoke the default PUBLIC execute
-- so an attacker can't call monete_pin_ok() over PostgREST to reset their own counter.
-- They are only ever called from the (owner-run) PIN RPCs, which can execute them.

create or replace function public.monete_pin_guard(p_id text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_fails int; v_start timestamptz;
begin
  select fails, window_start into v_fails, v_start
  from public.pin_attempts where party_id = p_id;
  if found and now() - v_start <= interval '15 minutes' and v_fails >= 10 then
    raise exception 'too many pin attempts' using errcode = 'PT429';
  end if;
end;
$$;

create or replace function public.monete_pin_fail(p_id text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into public.pin_attempts (party_id, fails, window_start)
  values (p_id, 1, now())
  on conflict (party_id) do update
    set fails = case when now() - pin_attempts.window_start > interval '15 minutes'
                     then 1 else pin_attempts.fails + 1 end,
        window_start = case when now() - pin_attempts.window_start > interval '15 minutes'
                           then now() else pin_attempts.window_start end;
end;
$$;

create or replace function public.monete_pin_ok(p_id text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  delete from public.pin_attempts where party_id = p_id;
end;
$$;

revoke all on function public.monete_pin_guard(text) from public, anon, authenticated;
revoke all on function public.monete_pin_fail(text) from public, anon, authenticated;
revoke all on function public.monete_pin_ok(text) from public, anon, authenticated;
revoke all on function public.monete_pin_hash(text, text) from public, anon, authenticated;

-- Re-define the three PIN-verifying RPCs to guard + record attempts.

create or replace function public.verify_party_pin(p_id text, p_pin text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_pin_hash text;
begin
  select pin_hash into v_pin_hash from public.parties where id = p_id and active;
  if not found then return false; end if;
  if v_pin_hash is null then return true; end if;
  perform public.monete_pin_guard(p_id);
  if public.monete_pin_hash(p_pin, p_id) = v_pin_hash then
    perform public.monete_pin_ok(p_id);
    return true;
  end if;
  perform public.monete_pin_fail(p_id);
  return false;
end;
$$;

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
  if v_pin_hash is not null then
    perform public.monete_pin_guard(p_id);
    if p_pin is null or public.monete_pin_hash(p_pin, p_id) <> v_pin_hash then
      perform public.monete_pin_fail(p_id);
      raise exception 'invalid pin' using errcode = 'PT401';
    end if;
    perform public.monete_pin_ok(p_id);
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

create or replace function public.set_party_pin(p_id text, p_new_pin text, p_current_pin text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_pin_hash text;
begin
  select pin_hash into v_pin_hash from public.parties where id = p_id and active;
  if not found then
    raise exception 'party not found' using errcode = 'PT404';
  end if;
  if v_pin_hash is not null then
    perform public.monete_pin_guard(p_id);
    if p_current_pin is null or public.monete_pin_hash(p_current_pin, p_id) <> v_pin_hash then
      perform public.monete_pin_fail(p_id);
      raise exception 'invalid pin' using errcode = 'PT401';
    end if;
    perform public.monete_pin_ok(p_id);
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
