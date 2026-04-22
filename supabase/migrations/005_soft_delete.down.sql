-- Revert 005_soft_delete.sql

-- Restore original view (no deleted_at filter).
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

grant select on public.scorecard_leads_recent to service_role;

drop index if exists idx_scorecard_deleted_at;

alter table public.scorecard_responses
  drop column if exists deleted_at;
