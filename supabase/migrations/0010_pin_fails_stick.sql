-- Ruling V6: in plpgsql, `raise exception` aborts the whole statement/transaction, rolling
-- back anything written earlier in the same call — including the monete_pin_fail() insert/
-- update that ran just before it. So every wrong-PIN write (update_party, set_party_pin,
-- delete_party, and the pin-checked rsvp overloads from 0009) never actually recorded its
-- fail, and a brute force never hit the 10/15min throttle. Fix: on a wrong PIN, record the
-- fail and RETURN a distinguishable outcome instead of raising (the PT429 guard raise stays,
-- since a blocked attempt writes nothing new to roll back).
--
-- Ruling V7: monete_pin_ok (the reset) must run only from a successful verify_party_pin.
-- A correct PIN on a read or a write must not reset the counter — only a deliberate PinGate
-- unlock does. Every `perform monete.monete_pin_ok(p_id);` outside verify_party_pin is removed.
--
-- Not a lockdown: every signature the live client calls stays. Prod has zero parties with a
-- PIN, so redefining in place (including changing two return types) is safe.

create or replace function monete.get_party(p_id text, p_pin text)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare v_row monete.parties%rowtype;
begin
  select * into v_row from monete.parties where id = p_id and active;
  if not found then
    return null;
  end if;
  if v_row.pin_hash is null then
    return jsonb_build_object('data', v_row.data - 'editPin', 'version', v_row.version, 'hasPin', false);
  end if;
  if p_pin is null then
    return jsonb_build_object('locked', true, 'hasPin', true);
  end if;
  perform monete.monete_pin_guard(p_id);
  if monete.monete_pin_hash(p_pin, p_id) <> v_row.pin_hash then
    perform monete.monete_pin_fail(p_id);
    return jsonb_build_object('locked', true, 'hasPin', true);
  end if;
  return jsonb_build_object('data', v_row.data - 'editPin', 'version', v_row.version, 'hasPin', true);
end;
$$;

-- 0 is never a real version (they start at 1): the wrong-PIN sentinel.
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
      return 0;
    end if;
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

-- Return type changes void -> boolean (false = wrong pin), so drop first.
drop function if exists monete.set_party_pin(text, text, text);
create function monete.set_party_pin(p_id text, p_new_pin text, p_current_pin text)
returns boolean language plpgsql security definer set search_path to '' as $$
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
      return false;
    end if;
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
  return true;
end;
$$;
grant execute on function monete.set_party_pin(text, text, text) to anon;

drop function if exists monete.delete_party(text, text);
create function monete.delete_party(p_id text, p_pin text)
returns boolean language plpgsql security definer set search_path to '' as $$
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
      return false;
    end if;
  end if;
  delete from monete.parties where id = p_id;  -- cascades pin_attempts
  return true;
end;
$$;
grant execute on function monete.delete_party(text, text) to anon;

-- The three 0009 rsvp overloads: same fix, same return-type change.
drop function if exists monete.append_rsvp(text, jsonb, text);
create function monete.append_rsvp(p_id text, p_rsvp jsonb, p_pin text)
returns boolean language plpgsql security definer set search_path to '' as $$
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
      return false;
    end if;
  end if;
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
  return true;
end;
$$;
grant execute on function monete.append_rsvp(text, jsonb, text) to anon;

drop function if exists monete.update_rsvp(text, text, jsonb, text);
create function monete.update_rsvp(p_id text, p_rsvp_id text, p_rsvp jsonb, p_pin text)
returns boolean language plpgsql security definer set search_path to '' as $$
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
      return false;
    end if;
  end if;
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
  return true;
end;
$$;
grant execute on function monete.update_rsvp(text, text, jsonb, text) to anon;

drop function if exists monete.remove_rsvp(text, text, text);
create function monete.remove_rsvp(p_id text, p_rsvp_id text, p_pin text)
returns boolean language plpgsql security definer set search_path to '' as $$
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
      return false;
    end if;
  end if;
  update monete.parties
  set data = jsonb_set(data, '{rsvps}', (
        select coalesce(jsonb_agg(elem) filter (where elem->>'id' <> p_rsvp_id), '[]'::jsonb)
        from jsonb_array_elements(data->'rsvps') elem)),
      updated_at = now()
  where id = p_id and active;
  return true;
end;
$$;
grant execute on function monete.remove_rsvp(text, text, text) to anon;
