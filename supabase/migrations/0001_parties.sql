-- supabase/migrations/0001_parties.sql
create table if not exists public.parties (
  id text primary key,
  version integer not null default 1,
  schema_version integer not null default 1,
  pin_hash text,
  active boolean not null default true,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.parties enable row level security;

-- Open posture, same as the sibling apps: anon may read active parties and
-- insert new ones. Config updates go through optimistic CAS; rsvp writes go
-- through the append_rsvp RPC below.
create policy parties_select on public.parties for select using (active);
create policy parties_insert on public.parties for insert with check (true);
create policy parties_update on public.parties for update using (active) with check (true);

-- Atomic append of one family rsvp. SECURITY DEFINER so it runs regardless of
-- the row-level update policy nuances; Postgres serializes the row update so
-- concurrent families never clobber each other or the config.
create or replace function public.append_rsvp(p_id text, p_rsvp jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  update public.parties
  set data = jsonb_set(data, '{rsvps}', coalesce(data->'rsvps', '[]'::jsonb) || p_rsvp),
      updated_at = now()
  where id = p_id and active;
$$;

grant execute on function public.append_rsvp(text, jsonb) to anon;

-- Stale-client write guard: reject a config update whose blob carries a lower
-- _schemaVersion than what is already stored. Raises PT426 (PostgREST → HTTP 426).
create or replace function public.guard_party_schema()
returns trigger language plpgsql as $$
begin
  if (new.data->>'_schemaVersion')::int < (old.data->>'_schemaVersion')::int then
    raise exception 'client schema is stale' using errcode = 'PT426';
  end if;
  return new;
end;
$$;

create trigger parties_guard_schema
  before update on public.parties
  for each row execute function public.guard_party_schema();
