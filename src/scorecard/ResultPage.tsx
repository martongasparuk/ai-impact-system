// AI Impact Scorecard — result page at /audit/result
// Phase 3: radar chart + email capture + Cal.com CTA + proper layout.

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateScorecard, type Answers } from './scoring';
import { generateReport } from './report';
import RadarChart from './RadarChart';
import EmailCaptureForm from './EmailCaptureForm';
import DiagnosticCallCTA from './DiagnosticCallCTA';

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

  if (!scorecard || !report || !answers) {
    return (
      <div className="min-h-screen bg-dark-950 text-gray-400 flex items-center justify-center">
        <p className="text-sm">Loading your result…</p>
      </div>
    );
  }

  const bandAccent =
    scorecard.band.name === 'Exposed'
      ? 'text-red-400 border-red-500/40 bg-red-500/5'
      : scorecard.band.name === 'Reactive'
      ? 'text-orange-400 border-orange-500/40 bg-orange-500/5'
      : scorecard.band.name === 'Directional'
      ? 'text-accent-400 border-accent-500/40 bg-accent-500/5'
      : 'text-cyan-400 border-cyan-500/40 bg-cyan-500/5';

  return (
    <div className="min-h-screen bg-dark-950 text-gray-200 font-sans antialiased">
      <header className="border-b border-dark-700">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <a href="/" className="text-white font-bold tracking-tight text-lg">
            AI Impact System
          </a>
          <span className="text-xs uppercase tracking-[0.2em] text-gray-500">
            Your Result
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-12 pb-24">
        {/* ── Headline row: score + radar ── */}
        <section className="grid lg:grid-cols-2 gap-10 mb-16 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-gray-500 font-semibold mb-4">
              Your AI Strategy Gap Score
            </p>
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-[88px] leading-none font-black text-white">
                {scorecard.normalisedScore}
              </span>
              <span className="text-3xl text-gray-600 font-bold">/ 100</span>
            </div>
            <div
              className={`inline-block px-4 py-2 rounded-md border text-lg font-bold mb-6 ${bandAccent}`}
            >
              {scorecard.band.name}
            </div>
            <p className="text-xl text-white leading-relaxed">{report.verdict}</p>
          </div>

          <div className="flex items-center justify-center">
            <RadarChart
              scores={scorecard.pillarScores}
              strongestPillars={scorecard.strongestPillars}
              weakestPillars={scorecard.weakestPillars}
              size={360}
            />
          </div>
        </section>

        {/* ── What your answers suggest ── */}
        <section className="mb-10 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-gray-500 font-semibold mb-3">
            What your answers suggest
          </p>
          <p className="text-gray-300 leading-relaxed">
            {report.whatYourAnswersSuggest}
          </p>
        </section>

        {/* ── Money on the table ── */}
        <section className="mb-12 p-6 bg-dark-800 border border-dark-600 rounded-lg max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-accent-400 font-semibold mb-3">
            Money on the table
          </p>
          <p className="text-gray-200 leading-relaxed">{report.moneyOnTable}</p>
        </section>

        {/* ── What happens next + CTA ── */}
        <section className="mb-12 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-gray-500 font-semibold mb-3">
            What happens next
          </p>
          <p className="text-gray-300 leading-relaxed mb-6">
            {report.whatHappensNext}
          </p>

          <DiagnosticCallCTA
            label={report.primaryCta.label}
            route={report.primaryCta.action}
          />

          {report.closingNote && (
            <p className="text-sm text-gray-500 mt-6 leading-relaxed italic">
              {report.closingNote}
            </p>
          )}
        </section>

        {/* ── Email capture ── */}
        <section className="mb-12 max-w-3xl">
          <EmailCaptureForm scorecard={scorecard} answers={answers} />
        </section>

        {/* ── Retake / stats ── */}
        <section className="pt-10 border-t border-dark-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-gray-500">
          <span>
            Score: {scorecard.rawScore}/96 raw ·{' '}
            {scorecard.salesTriggerCount} help-flags ·{' '}
            {scorecard.band.name}
          </span>
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
