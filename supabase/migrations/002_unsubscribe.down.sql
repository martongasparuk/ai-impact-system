-- Rollback for 002_unsubscribe.sql
drop index if exists idx_scorecard_unsubscribed_at;
alter table public.scorecard_responses drop column if exists unsubscribed_at;
