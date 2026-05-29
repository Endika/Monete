-- Monitoring view: per-event blob weight (egress-relevant). Not exposed to the
-- Data API (revoked from anon/authenticated) — read it from the SQL editor only.
create or replace view public.party_sizes
with (security_invoker = true) as
select
  id,
  data->'event'->>'title'                                 as title,
  jsonb_array_length(coalesce(data->'rsvps', '[]'::jsonb)) as rsvps,
  length(data::text)                                      as bytes,
  pg_size_pretty(length(data::text)::bigint)              as size,
  created_at,
  updated_at
from public.parties;

revoke all on public.party_sizes from anon, authenticated;
