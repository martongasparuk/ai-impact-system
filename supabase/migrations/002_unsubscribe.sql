-- AI Impact Scorecard — unsubscribe support
-- Adds an unsubscribed_at column so /api/scorecard-unsubscribe can mark leads
-- and /api/scorecard-email can suppress sending before calling Resend.

alter table public.scorecard_responses
  add column if not exists unsubscribed_at timestamptz;

create index if not exists idx_scorecard_unsubscribed_at
  on public.scorecard_responses (unsubscribed_at)
  where unsubscribed_at is not null;
