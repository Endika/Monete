-- Owner decision: if a party has a PIN, nothing is readable or joinable without it,
-- enforced server-side. Additive (safe to apply while the pre-gate client is still live):
-- adds new overloads that gate reads and RSVP writes by PIN; the old signatures stay so
-- the current client keeps working until it is replaced. Task 4 (lockdown) revokes them.

-- Same four branches as monete.update_party's PIN check, but for a read:
-- no active row -> null; no PIN -> the full object; PIN set + p_pin null -> locked,
-- no fail counted; PIN set + p_pin given -> guard, wrong -> fail + locked, right -> ok + full.
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
  perform monete.monete_pin_ok(p_id);
  return jsonb_build_object('data', v_row.data - 'editPin', 'version', v_row.version, 'hasPin', true);
end;
$$;

create or replace function monete.append_rsvp(p_id text, p_rsvp jsonb, p_pin text)
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

create or replace function monete.update_rsvp(p_id text, p_rsvp_id text, p_rsvp jsonb, p_pin text)
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

create or replace function monete.remove_rsvp(p_id text, p_rsvp_id text, p_pin text)
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
  update monete.parties
  set data = jsonb_set(data, '{rsvps}', (
        select coalesce(jsonb_agg(elem) filter (where elem->>'id' <> p_rsvp_id), '[]'::jsonb)
        from jsonb_array_elements(data->'rsvps') elem)),
      updated_at = now()
  where id = p_id and active;
end;
$$;

grant execute on function monete.get_party(text, text) to anon;
grant execute on function monete.append_rsvp(text, jsonb, text) to anon;
grant execute on function monete.update_rsvp(text, text, jsonb, text) to anon;
grant execute on function monete.remove_rsvp(text, text, text) to anon;
