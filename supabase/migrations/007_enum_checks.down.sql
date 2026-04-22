-- Revert 007_enum_checks.sql

alter table public.scorecard_responses
  drop constraint if exists scorecard_band_check;

alter table public.scorecard_responses
  drop constraint if exists scorecard_cta_route_check;

alter table public.scorecard_responses
  drop constraint if exists scorecard_normalised_score_range;

alter table public.scorecard_responses
  drop constraint if exists scorecard_sales_trigger_count_range;
