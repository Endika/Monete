create or replace function public.update_rsvp(p_id text, p_rsvp_id text, p_rsvp jsonb)
returns void language sql security definer set search_path = '' as $$
  update public.parties
  set data = jsonb_set(data, '{rsvps}', (
        select coalesce(jsonb_agg(
          case when elem->>'id' = p_rsvp_id then p_rsvp else elem end), '[]'::jsonb)
        from jsonb_array_elements(data->'rsvps') elem)),
      updated_at = now()
  where id = p_id and active;
$$;
grant execute on function public.update_rsvp(text, text, jsonb) to anon;

create or replace function public.remove_rsvp(p_id text, p_rsvp_id text)
returns void language sql security definer set search_path = '' as $$
  update public.parties
  set data = jsonb_set(data, '{rsvps}', (
        select coalesce(jsonb_agg(elem) filter (where elem->>'id' <> p_rsvp_id), '[]'::jsonb)
        from jsonb_array_elements(data->'rsvps') elem)),
      updated_at = now()
  where id = p_id and active;
$$;
grant execute on function public.remove_rsvp(text, text) to anon;

-- Bring repo in line with the live DB (v1.0 hardening applied this directly).
alter function public.guard_party_schema() set search_path = '';
