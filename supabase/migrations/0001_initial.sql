-- ============================================================================
-- inletmove-prod · 0001_initial.sql
-- ----------------------------------------------------------------------------
-- Week 1 schema, ON DISK ONLY (not yet deployed).
-- Apply via Supabase dashboard SQL editor, or `supabase db push` once the
-- inletmove-prod project is provisioned in us-west-1.
--
-- Source of truth: mega prompt §6. Spec v2 §4.4's older `leads` table is
-- superseded; field names track MoverOS naming conventions for the v1.1
-- handoff, with reserved `movros_*` columns added inline.
-- ============================================================================

-- Required extensions
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- 6.1 — Quotes (the lead capture table)
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  -- Form fields
  from_address text not null,
  from_lat numeric(9,6),
  from_lng numeric(9,6),
  from_neighborhood text,
  to_address text not null,
  to_lat numeric(9,6),
  to_lng numeric(9,6),
  to_neighborhood text,
  size text not null check (
    size in ('studio','1bed','2bed','3bed','multigen','senior','single_item')
  ),
  preferred_date date not null,
  preferred_time text check (
    preferred_time in ('morning','afternoon','evening','flexible') or preferred_time is null
  ),
  contact_name text not null,
  contact_email text,
  contact_phone text not null,
  contact_lang text default 'en' check (contact_lang in ('en','zh','pa','hi')),
  notes text,

  -- Photo inventory (shadow AI scoring; not customer-facing in Week 1)
  photo_count int default 0,
  photo_storage_paths text[],
  ai_inventory_items jsonb,
  ai_inventory_score numeric(5,2),
  ai_inventory_run_at timestamptz,
  ai_inventory_model text,

  -- Internal status
  quote_amount_cents int,
  quote_basis text check (quote_basis in ('manual','ai_assisted','ai') or quote_basis is null),
  quote_sent_at timestamptz,
  status text default 'new' not null check (
    status in ('new','quoted','booked','completed','cancelled','spam')
  ),

  -- Source attribution
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  referrer text,
  landing_page text,

  -- ===== RESERVED FOR MOVEROS HANDOFF (v1.1) =====
  movros_customer_id uuid,
  movros_synced_at timestamptz,
  movros_sync_status text check (
    movros_sync_status in ('pending','synced','error') or movros_sync_status is null
  ),
  movros_sync_error text
);

create index if not exists idx_quotes_status_created on public.quotes(status, created_at desc);
create index if not exists idx_quotes_neighborhood on public.quotes(from_neighborhood, to_neighborhood);
create index if not exists idx_quotes_movros_pending
  on public.quotes(movros_synced_at) where movros_synced_at is null;

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_quotes_updated_at on public.quotes;
create trigger trg_quotes_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

-- RLS: anon can only INSERT; service role can SELECT + UPDATE; nobody DELETEs.
alter table public.quotes enable row level security;

drop policy if exists "anon can insert quotes" on public.quotes;
create policy "anon can insert quotes"
  on public.quotes for insert
  to anon
  with check (true);

drop policy if exists "service role can read all" on public.quotes;
create policy "service role can read all"
  on public.quotes for select
  to service_role
  using (true);

drop policy if exists "service role can update" on public.quotes;
create policy "service role can update"
  on public.quotes for update
  to service_role
  using (true);

-- 6.2 — Live booking feed view (masked, public-readable, no PII)
create or replace view public.live_quote_feed as
  select
    id,
    (extract(epoch from (now() - created_at))::int / 60) as minutes_ago,
    from_neighborhood,
    to_neighborhood,
    size,
    case
      when quote_amount_cents is not null then quote_amount_cents
      else null
    end as quote_amount_cents
  from public.quotes
  where created_at > now() - interval '6 hours'
    and status in ('new','quoted','booked')
  order by created_at desc
  limit 5;

-- The view inherits RLS from `quotes`. Grant SELECT to anon for the feed.
grant select on public.live_quote_feed to anon;

-- 6.3 — Neighborhoods (programmatic SEO targets)
create table if not exists public.neighborhoods (
  slug text primary key,
  display_name text not null,
  city text not null,
  region text not null,
  postal_codes text[],
  population int,
  primary_persona text,
  copy_intro text,
  copy_movein_pattern text,
  hero_image_path text,
  faqs jsonb,
  active boolean default true,
  created_at timestamptz default now()
);

-- RLS: anon read, service role write.
alter table public.neighborhoods enable row level security;

drop policy if exists "anon can read active neighborhoods" on public.neighborhoods;
create policy "anon can read active neighborhoods"
  on public.neighborhoods for select
  to anon
  using (active = true);

drop policy if exists "service role can write neighborhoods" on public.neighborhoods;
create policy "service role can write neighborhoods"
  on public.neighborhoods for all
  to service_role
  using (true) with check (true);

-- 6.4 — Audit log
create table if not exists public.audit_log (
  id bigserial primary key,
  created_at timestamptz default now() not null,
  actor text,
  event_type text not null,
  metadata jsonb,
  error text
);

alter table public.audit_log enable row level security;

drop policy if exists "service role full audit_log access" on public.audit_log;
create policy "service role full audit_log access"
  on public.audit_log for all
  to service_role
  using (true) with check (true);

-- 6.5 — Storage buckets (created via dashboard, documented here for clarity)
-- inletmove-photos       (private; signed URLs only) — customer quote photos
-- inletmove-public       (public read)               — hero, Maya, brand assets
