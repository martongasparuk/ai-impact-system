-- Revert 006_updated_at.sql

drop trigger if exists trg_scorecard_responses_updated_at on public.scorecard_responses;
drop function if exists public.scorecard_responses_set_updated_at();

alter table public.scorecard_responses
  drop column if exists updated_at;
