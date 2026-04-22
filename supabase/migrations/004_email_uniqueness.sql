-- AI Impact Scorecard — prevent accidental duplicate submissions
-- Same email submitting on the same calendar day is almost always a double-click
-- or retry, not a genuine retake. The app handles the resulting 23505 as idempotent.
-- Retakes across different days remain allowed so we keep the progression history.
--
-- NB on IMMUTABLE: Postgres won't index `created_at::date` directly because the
-- cast is STABLE (depends on session tz). We wrap in an explicit IMMUTABLE
-- function that forces UTC, which is genuinely tz-independent.

create or replace function public.scorecard_created_day(ts timestamptz)
returns date
language sql
immutable
strict
as $$ select (ts at time zone 'UTC')::date $$;

create unique index if not exists uq_scorecard_email_day
  on public.scorecard_responses (lower(email), public.scorecard_created_day(created_at));
