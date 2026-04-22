-- AI Impact Scorecard — soft-delete support (DB-08)
-- Adds `deleted_at` so operator workflows can hide test/spam/duplicate rows without
-- losing audit trail. Art. 17 erasure still hard-deletes via /api/scorecard-erase —
-- this column is for operational retention only, never for compliance deletion.

alter table public.scorecard_responses
  add column if not exists deleted_at timestamptz;

create index if not exists idx_scorecard_deleted_at
  on public.scorecard_responses (deleted_at)
  where deleted_at is not null;

-- Operator dashboard view excludes soft-deleted rows.
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
where deleted_at is null
order by created_at desc
limit 200;

grant select on public.scorecard_leads_recent to service_role;
