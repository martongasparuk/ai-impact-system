-- Rollback for 003_consent.sql
drop index if exists idx_scorecard_drip_consent;
alter table public.scorecard_responses
  drop column if exists consent_timestamp,
  drop column if exists privacy_version,
  drop column if exists drip_consent;
