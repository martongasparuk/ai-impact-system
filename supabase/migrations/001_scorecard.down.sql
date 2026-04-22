-- Rollback for 001_scorecard.sql
-- Drops the table, view, and RLS policy. Destructive: loses all lead data.

drop view if exists public.scorecard_leads_recent;
drop policy if exists "service_role_all" on public.scorecard_responses;
drop index if exists idx_scorecard_cta_route;
drop index if exists idx_scorecard_email;
drop index if exists idx_scorecard_band;
drop index if exists idx_scorecard_created_at;
drop table if exists public.scorecard_responses;
