// AI Impact Scorecard — result page at /audit/result
// Phase 2 minimal result (score + band + verdict). Phase 3 adds radar chart + email capture + proper design.

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateScorecard, type Answers } from './scoring';
import { generateReport } from './report';
import { pillarOrder } from './questions';

const STORAGE_KEY = 'ais-scorecard-answers-v1';

export default function ResultPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Answers | null>(null);

  useEffect(() => {
    document.title = 'Your AI Strategy Gap Score | AI Impact System';
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        navigate('/audit');
        return;
      }
      const parsed = JSON.parse(raw) as Answers;
      setAnswers(parsed);
    } catch {
      navigate('/audit');
    }
  }, [navigate]);

  const scorecard = useMemo(() => {
    if (!answers) return null;
    return calculateScorecard(answers);
  }, [answers]);

  const report = useMemo(() => {
    if (!scorecard) return null;
    return generateReport(scorecard);
  }, [scorecard]);

  if (!scorecard || !report) {
    return (
      <div className="min-h-screen bg-dark-950 text-gray-400 flex items-center justify-center">
        <p className="text-sm">Loading your result…</p>
      </div>
    );
  }

  const bandColor =
    scorecard.band.name === 'Exposed'
      ? 'text-red-400'
      : scorecard.band.name === 'Reactive'
      ? 'text-orange-400'
      : scorecard.band.name === 'Directional'
      ? 'text-accent-400'
      : 'text-cyan-400';

  return (
    <div className="min-h-screen bg-dark-950 text-gray-200 font-sans antialiased">
      <header className="border-b border-dark-700">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <a href="/" className="text-white font-bold tracking-tight text-lg">
            AI Impact System
          </a>
          <span className="text-xs uppercase tracking-[0.2em] text-gray-500">
            Your Result
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-16 pb-24">
        {/* Score block */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.22em] text-gray-500 font-semibold mb-4">
            Your AI Strategy Gap Score
          </p>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-7xl font-black text-white">
              {scorecard.normalisedScore}
            </span>
            <span className="text-3xl text-gray-600 font-bold">/ 100</span>
          </div>
          <p className={`text-2xl font-bold ${bandColor}`}>{scorecard.band.name}</p>
        </div>

        {/* Pillar bars (temp radar replacement until Phase 3) */}
        <section className="mb-14">
          <p className="text-xs uppercase tracking-[0.22em] text-gray-500 font-semibold mb-5">
            Pillar breakdown
          </p>
          <div className="space-y-3">
            {pillarOrder.map((p) => {
              const score = scorecard.pillarScores[p];
              const pct = (score / 4) * 100;
              const strong = scorecard.strongestPillars.includes(p);
              const weak = scorecard.weakestPillars.includes(p);
              return (
                <div key={p} className="flex items-center gap-4">
                  <span className="w-24 text-sm font-semibold text-white">{p}</span>
                  <div className="flex-1 h-2.5 bg-dark-700 rounded overflow-hidden">
                    <div
                      className={
                        strong
                          ? 'h-full bg-cyan-500'
                          : weak
                          ? 'h-full bg-red-500/70'
                          : 'h-full bg-accent-500'
                      }
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs text-gray-500 font-mono">
                    {score.toFixed(1)} / 4
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Verdict */}
        <section className="mb-10">
          <p className="text-xs uppercase tracking-[0.22em] text-accent-400 font-semibold mb-3">
            The verdict
          </p>
          <p className="text-xl text-white leading-relaxed">{report.verdict}</p>
        </section>

        <section className="mb-10">
          <p className="text-xs uppercase tracking-[0.22em] text-gray-500 font-semibold mb-3">
            What your answers suggest
          </p>
          <p className="text-gray-300 leading-relaxed">
            {report.whatYourAnswersSuggest}
          </p>
        </section>

        <section className="mb-10 p-6 bg-dark-800 border border-dark-600 rounded-lg">
          <p className="text-xs uppercase tracking-[0.22em] text-accent-400 font-semibold mb-3">
            Money on the table
          </p>
          <p className="text-gray-200 leading-relaxed">{report.moneyOnTable}</p>
        </section>

        {/* CTA */}
        <section className="mb-12">
          <p className="text-xs uppercase tracking-[0.22em] text-gray-500 font-semibold mb-3">
            What happens next
          </p>
          <p className="text-gray-300 leading-relaxed mb-6">
            {report.whatHappensNext}
          </p>

          <a
            href="#book-call"
            className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-7 py-4 rounded-lg text-base transition-colors"
          >
            {report.primaryCta.label}
          </a>

          {report.closingNote && (
            <p className="text-sm text-gray-500 mt-6 leading-relaxed italic">
              {report.closingNote}
            </p>
          )}
        </section>

        {/* Start over */}
        <section className="pt-10 border-t border-dark-700 flex items-center justify-between text-sm text-gray-500">
          <span>Score: {scorecard.rawScore}/96 raw · {scorecard.salesTriggerCount} help-flags</span>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              localStorage.removeItem('ais-scorecard-step-v1');
              navigate('/audit');
            }}
            className="underline hover:text-white"
          >
            Retake the audit
          </button>
        </section>
      </main>
    </div>
  );
}
