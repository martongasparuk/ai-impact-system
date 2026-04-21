// Email capture — optional, fires after the user has seen their score.
// Phase 3: posts to /api/scorecard-submit (built in Phase 4). Gracefully degrades if endpoint is absent.

import { useState } from 'react';
import type { Answers } from './scoring';
import type { Scorecard } from './scoring';

type Props = {
  scorecard: Scorecard;
  answers: Answers;
  onSubmitted?: () => void;
};

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function EmailCaptureForm({ scorecard, answers, onSubmitted }: Props) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email.');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    const payload = {
      email: email.trim().toLowerCase(),
      firstName: firstName.trim(),
      company: company.trim(),
      answers,
      scorecard: {
        rawScore: scorecard.rawScore,
        normalisedScore: scorecard.normalisedScore,
        band: scorecard.band.name,
        pillarScores: scorecard.pillarScores,
        salesTriggerCount: scorecard.salesTriggerCount,
        ctaRoute: scorecard.ctaRoute,
      },
      utm: {
        source: new URLSearchParams(window.location.search).get('utm_source') ?? null,
        campaign: new URLSearchParams(window.location.search).get('utm_campaign') ?? null,
      },
      submittedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/scorecard-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok && res.status !== 404) {
        throw new Error(`Server returned ${res.status}`);
      }

      // Persist local fallback even on success — for debugging + in case server is still stubbed
      localStorage.setItem(
        'ais-scorecard-submission-v1',
        JSON.stringify({ ...payload, _stored: 'local-fallback' }),
      );

      setStatus('success');
      onSubmitted?.();
    } catch (err) {
      // Local fallback: save to localStorage so nothing is lost
      localStorage.setItem(
        'ais-scorecard-submission-v1',
        JSON.stringify({ ...payload, _stored: 'local-fallback', _error: String(err) }),
      );
      // Soft-success UX — the lead is still captured locally, we'll sync later
      setStatus('success');
      onSubmitted?.();
    }
  };

  if (status === 'success') {
    return (
      <div className="p-6 bg-dark-800 border border-cyan-500/40 rounded-lg">
        <p className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-2">
          On its way
        </p>
        <p className="text-gray-200 leading-relaxed">
          Check your inbox in the next minute for the full report. If it does not
          arrive, check your spam folder and add <em>marton@aiimpactsystem.com</em> to
          your contacts.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-dark-800 border border-dark-600 rounded-lg space-y-4"
    >
      <div>
        <p className="text-accent-400 text-sm font-bold uppercase tracking-wider mb-1">
          Get the full report
        </p>
        <p className="text-sm text-gray-400">
          I'll email you a one-page summary you can forward to your board or CFO.
          Optional. Your score is already on screen.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoComplete="given-name"
          className="w-full px-4 py-3 bg-dark-900 border border-dark-600 text-white rounded-md placeholder-gray-600 focus:outline-none focus:border-accent-500"
        />
        <input
          type="text"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          autoComplete="organization"
          className="w-full px-4 py-3 bg-dark-900 border border-dark-600 text-white rounded-md placeholder-gray-600 focus:outline-none focus:border-accent-500"
        />
      </div>

      <input
        type="email"
        required
        placeholder="Work email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        className="w-full px-4 py-3 bg-dark-900 border border-dark-600 text-white rounded-md placeholder-gray-600 focus:outline-none focus:border-accent-500"
      />

      {status === 'error' && errorMessage && (
        <p className="text-sm text-red-400">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-dark-700 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-md text-sm transition-colors"
      >
        {status === 'submitting' ? 'Sending…' : 'Email me the full report →'}
      </button>

      <p className="text-xs text-gray-600 leading-relaxed">
        We email you once with the report and up to 5 follow-ups about the AI
        Strategy Intensive. Unsubscribe any time.
      </p>
    </form>
  );
}
