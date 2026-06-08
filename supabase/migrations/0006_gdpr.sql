-- supabase/migrations/0006_gdpr.sql
--
-- GDPR/privacy: a real erasure path + automatic retention + PII tagging.
--  * delete_party: host-reachable hard delete (the data-subject erasure mechanism);
--    PIN-gated like the other host RPCs. Cascades pin_attempts.
--  * Retention: a daily pg_cron job deletes parties 90 days after the event date, so
--    minors' PII does not live forever.
--  * Tag the table as holding personal + special-category (health) data of minors.

-- Erasure: delete a party by id. PIN-gated (with the same throttle) when a PIN is set;
-- a PIN-less party is deletable by any link-holder, consistent with the open no-signup model.
create or replace function public.delete_party(p_id text, p_pin text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_pin_hash text;
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
  delete from public.parties where id = p_id;  -- cascades pin_attempts
end;
$$;

grant execute on function public.delete_party(text, text) to anon;

-- Retention: drop parties 90 days after their event date (data.event.startsAt).
-- pg_cron jobs run as the scheduling superuser, so the DELETE bypasses RLS as intended.
create extension if not exists pg_cron;

select cron.schedule(
  'monete-retention',
  '0 3 * * *',
  $$ delete from public.parties
     where (data->'event'->>'startsAt')::timestamptz < now() - interval '90 days' $$
);

-- PII tagging: make the personal-data posture explicit for audits and future migrations.
comment on table public.parties is
  'RSVP events. data jsonb holds PERSONAL DATA of third parties incl. MINORS: child names, date of birth, parent label, and SPECIAL-CATEGORY health data (allergies). Lawful basis: legitimate interest in providing the RSVP service; minimized (no accounts/emails). Erasure: delete_party RPC. Retention: 90 days after event via cron job monete-retention.';
comment on column public.parties.data is 'Personal data incl. special category (health: allergies) and minors. See table comment.';
comment on column public.parties.pin_hash is 'Host edit-PIN hash (sha256, salted). Not personal data of guests.';
