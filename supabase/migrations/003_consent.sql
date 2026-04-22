-- AI Impact Scorecard — consent capture (UK GDPR Art. 7 + PECR)
-- Adds an explicit record of when consent was given, which privacy version applied,
-- and whether the user opted into the drip sequence (separate from the transactional report).

alter table public.scorecard_responses
  add column if not exists consent_timestamp timestamptz,
  add column if not exists privacy_version text,
  add column if not exists drip_consent boolean not null default false;

-- Backfill existing rows with a conservative "consent unknown" default so the
-- suppression logic in /api/scorecard-email treats them as drip-opt-out until
-- they re-consent.
update public.scorecard_responses
  set drip_consent = false
  where drip_consent is null;

create index if not exists idx_scorecard_drip_consent
  on public.scorecard_responses (drip_consent);
