-- AI Impact Scorecard — enum + range CHECK constraints (DB-11)
-- Catches bad writes at the database layer in case the Netlify function or a
-- future n8n script sends malformed values. Mirrors the TypeScript string
-- unions in src/scorecard/questions.ts and scoring.ts.

alter table public.scorecard_responses
  add constraint scorecard_band_check
  check (band in ('Exposed', 'Reactive', 'Directional', 'Compounding'));

alter table public.scorecard_responses
  add constraint scorecard_cta_route_check
  check (cta_route in ('diagnostic_call', 'webinar', 'nurture_only', 'waitlist'));

alter table public.scorecard_responses
  add constraint scorecard_normalised_score_range
  check (normalised_score between 0 and 100);

alter table public.scorecard_responses
  add constraint scorecard_sales_trigger_count_range
  check (sales_trigger_count between 0 and 24);
