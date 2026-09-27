-- monete_pin_guard read `fails` without locking the row: a burst of concurrent guesses could
-- all read the same (under-cap) count and all pass the guard before any of their failures
-- committed, letting a parallel brute force sail past the 10/15min cap. Fix: upsert the row
-- first (guaranteeing it exists), then `select ... for update` to take a row lock. That
-- serializes concurrent guard checks for the same party for the lifetime of the calling RPC's
-- transaction, so the second-in-line guess always sees the first one's committed fail.
--
-- Ruling V7 still holds — this only closes the race, it does not change what counts: a
-- correct read/write never resets the counter, only a successful verify_party_pin does.

create or replace function monete.monete_pin_guard(p_id text)
returns void language plpgsql security definer set search_path to '' as $$
declare v_fails int; v_start timestamptz;
begin
  insert into monete.pin_attempts (party_id, fails, window_start)
  values (p_id, 0, now())
  on conflict (party_id) do nothing;

  select fails, window_start into v_fails, v_start
  from monete.pin_attempts where party_id = p_id
  for update;

  if now() - v_start <= interval '15 minutes' and v_fails >= 10 then
    raise exception 'too many pin attempts' using errcode = 'PT429';
  end if;
end;
$$;
-- Stays revoked from anon (see 0005) — only the SECURITY DEFINER PIN RPCs call it.

-- The guard's placeholder row (fails=0, inserted the first time anyone is ever checked for
-- this party) must not anchor the window: a `fails = 0` row has to count exactly like no row
-- at all — fails=1, window_start=now() — otherwise the first real failure could inherit a
-- window_start from an arbitrarily earlier, uneventful guard call and shrink its own 15
-- minutes.
create or replace function monete.monete_pin_fail(p_id text)
returns void language plpgsql security definer set search_path to '' as $$
begin
  insert into monete.pin_attempts (party_id, fails, window_start)
  values (p_id, 1, now())
  on conflict (party_id) do update
    set fails = case
                  when pin_attempts.fails = 0 then 1
                  when now() - pin_attempts.window_start > interval '15 minutes' then 1
                  else pin_attempts.fails + 1
                end,
        window_start = case
                  when pin_attempts.fails = 0 then now()
                  when now() - pin_attempts.window_start > interval '15 minutes' then now()
                  else pin_attempts.window_start
                end;
end;
$$;
-- Stays revoked from anon (see 0005).
