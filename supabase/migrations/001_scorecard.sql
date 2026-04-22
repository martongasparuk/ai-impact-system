-- AI Impact Scorecard — initial schema
-- Run this once on the new scorecard Supabase project.

-- ═══════════════════════════════════════════════
-- Table: scorecard_responses
-- ═══════════════════════════════════════════════
create table if not exists public.scorecard_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Lead contact
  email text not null,
  first_name text,
  company text,

  -- Pre-qualifying context
  role text,
  headcount text,
  ai_spend text,
  urgency text,

  -- Computed scores
  raw_score int not null,
  normalised_score int not null,
  band text not null,
  pillar_identify real not null default 0,
  pillar_map real not null default 0,
  pillar_prioritise real not null default 0,
  pillar_agree real not null default 0,
  pillar_call real not null default 0,
  pillar_tell real not null default 0,
  sales_trigger_count int not null default 0,
  cta_route text not null,

  -- Full answer blob for re-derivation
  answers jsonb not null,

  -- Attribution
  utm_source text,
  utm_campaign text,
  utm_medium text,

  -- Operator workflow
  submitted_at timestamptz,
  email_sent_at timestamptz,
  call_booked_at timestamptz,
  intensive_closed_at timestamptz,
  notes text
);

-- ═══════════════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════════════
create index if not exists idx_scorecard_created_at
  on public.scorecard_responses (created_at desc);

create index if not exists idx_scorecard_band
  on public.scorecard_responses (band);

create index if not exists idx_scorecard_email
  on public.scorecard_responses (email);

create index if not exists idx_scorecard_cta_route
  on public.scorecard_responses (cta_route);

-- ═══════════════════════════════════════════════
-- Row-Level Security
-- ═══════════════════════════════════════════════
alter table public.scorecard_responses enable row level security;

-- No anonymous access. Only service_role (used by the Netlify Function) can write or read.
-- We never expose this table to the browser.
create policy "service_role_all"
  on public.scorecard_responses
  for all
  to service_role
  using (true)
  with check (true);

-- ═══════════════════════════════════════════════
-- Optional: a view for operator dashboards
-- ═══════════════════════════════════════════════
create or replace view public.scorecard_leads_recent as
select
  id,
  created_at,
  email,
  first_name,
  company,
  role,
  headcount,
  ai_spend,
  urgency,
  normalised_score,
  band,
  sales_trigger_count,
  cta_route,
  call_booked_at
from public.scorecard_responses
order by created_at desc
limit 200;

-- grant service_role usage on the view
grant select on public.scorecard_leads_recent to service_role;
