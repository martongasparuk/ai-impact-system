// Email capture, fires after the user has seen their score.
// Posts to /api/scorecard-submit. Captures GDPR Art. 7 consent + PECR drip opt-in.

import { useState } from 'react';
import type { Answers, Scorecard } from './scoring';
import {
  buildSubmissionPayload,
  postSubmission,
  readUtmFromSearch,
  type FieldErrors,
} from './submissionPayload';
import { BRAND_EMAIL } from '../config';

type Props = {
  scorecard: Scorecard;
  answers: Answers;
  onSubmitted?: () => void;
};

type Status = 'idle' | 'submitting' | 'success' | 'error';

const STORAGE_FALLBACK_KEY = 'ais-scorecard-submission-v1';

export default function EmailCaptureForm({ scorecard, answers, onSubmitted }: Props) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [company, setCompany] = useState('');
  const [consent, setConsent] = useState(false);
  const [dripOptIn, setDripOptIn] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setStatus('error');
      setErrorMessage('');
      setFieldErrors({ email: 'Please enter a valid email address.' });
      return;
    }
    if (!consent) {
      setStatus('error');
      setErrorMessage('Please agree to the Privacy Policy to continue.');
      setFieldErrors({});
      return;
    }

    setStatus('submitting');
    setErrorMessage('');
    setFieldErrors({});

    const payload = buildSubmissionPayload({
      email,
      firstName,
      company,
      answers,
      scorecard,
      utm: readUtmFromSearch(window.location.search),
      dripOptIn,
    });

    const result = await postSubmission(payload);

    if (result.kind === 'ok') {
      setStatus('success');
      onSubmitted?.();
      return;
    }

    if (result.kind === 'rate_limited') {
      setStatus('error');
      setErrorMessage('Too many submissions. Try again in a minute.');
      return;
    }

    if (result.kind === 'unconfigured') {
      // Service not configured yet (beta). Store locally, soft-success.
      localStorage.setItem(
        STORAGE_FALLBACK_KEY,
        JSON.stringify({ ...payload, _stored: 'local-fallback-503' }),
      );
      setStatus('success');
      onSubmitted?.();
      return;
    }

    if (result.kind === 'validation') {
      setStatus('error');
      setFieldErrors(result.fieldErrors);
      setErrorMessage(result.message);
      return;
    }

    // Persist so ops can replay; do NOT silently lie to the user.
    localStorage.setItem(
      STORAGE_FALLBACK_KEY,
      JSON.stringify({ ...payload, _stored: 'local-fallback-error', _error: result.message }),
    );
    setStatus('error');
    setErrorMessage(
      result.message || 'We could not reach the server. Please try again in a moment.',
    );
  };

  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="p-6 bg-dark-800 border border-cyan-500/40 rounded-lg"
      >
        <p className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-2">
          On its way
        </p>
        <p className="text-gray-200 leading-relaxed">
          Check your inbox in the next minute for the full report. If it does not
          arrive, check your spam folder and add <em>{BRAND_EMAIL}</em> to
          your contacts.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-dark-800 border border-dark-600 rounded-lg space-y-4"
      noValidate
    >
      <div>
        <p className="text-accent-400 text-sm font-bold uppercase tracking-wider mb-1">
          Get the full report
        </p>
        <p className="text-sm text-gray-400">
          I will email you a one-page summary you can forward to your board or CFO.
          Optional. Your score is already on screen.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="ais-first-name" className="sr-only">First name</label>
          <input
            id="ais-first-name"
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            aria-invalid={fieldErrors.firstName ? true : undefined}
            aria-describedby={fieldErrors.firstName ? 'ais-first-name-err' : undefined}
            className={`w-full px-4 py-3 bg-dark-900 border text-white rounded-md placeholder-gray-500 focus:outline-none ${
              fieldErrors.firstName ? 'border-red-500 focus:border-red-500' : 'border-dark-600 focus:border-accent-500'
            }`}
          />
          {fieldErrors.firstName && (
            <p id="ais-first-name-err" role="alert" className="mt-1 text-xs text-red-400">
              {fieldErrors.firstName}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="ais-company" className="sr-only">Company</label>
          <input
            id="ais-company"
            type="text"
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            autoComplete="organization"
            aria-invalid={fieldErrors.company ? true : undefined}
            aria-describedby={fieldErrors.company ? 'ais-company-err' : undefined}
            className={`w-full px-4 py-3 bg-dark-900 border text-white rounded-md placeholder-gray-500 focus:outline-none ${
              fieldErrors.company ? 'border-red-500 focus:border-red-500' : 'border-dark-600 focus:border-accent-500'
            }`}
          />
          {fieldErrors.company && (
            <p id="ais-company-err" role="alert" className="mt-1 text-xs text-red-400">
              {fieldErrors.company}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="ais-email" className="sr-only">Work email</label>
        <input
          id="ais-email"
          type="email"
          required
          placeholder="Work email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          aria-invalid={fieldErrors.email ? true : undefined}
          aria-describedby={fieldErrors.email ? 'ais-email-err' : 'ais-email-help'}
          className={`w-full px-4 py-3 bg-dark-900 border text-white rounded-md placeholder-gray-500 focus:outline-none ${
            fieldErrors.email ? 'border-red-500 focus:border-red-500' : 'border-dark-600 focus:border-accent-500'
          }`}
        />
        {fieldErrors.email && (
          <p id="ais-email-err" role="alert" className="mt-1 text-xs text-red-400">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="space-y-2 pt-1">
        <label className="flex items-start gap-2 text-xs text-gray-300 leading-relaxed cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
            aria-required="true"
            className="mt-0.5 accent-accent-500"
          />
          <span>
            I agree to the{' '}
            <a href="/privacy.html" className="text-accent-400 hover:underline">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="/terms.html" className="text-accent-400 hover:underline">
              Terms
            </a>
            .
          </span>
        </label>
        <label className="flex items-start gap-2 text-xs text-gray-300 leading-relaxed cursor-pointer">
          <input
            type="checkbox"
            checked={dripOptIn}
            onChange={(e) => setDripOptIn(e.target.checked)}
            className="mt-0.5 accent-accent-500"
          />
          <span>
            Also send me 5 short follow-ups on closing the gap. One-click
            unsubscribe in every email.
          </span>
        </label>
      </div>

      {status === 'error' && errorMessage && (
        <p role="alert" className="text-sm text-red-400">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-dark-700 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-md text-sm transition-colors"
      >
        {status === 'submitting' ? 'Sending...' : 'Email me the full report →'}
      </button>

      <p className="text-xs text-gray-500 leading-relaxed">
        The report is a one-off transactional email. Follow-ups are only sent if
        you tick the box above. Unsubscribe links in every email.
      </p>
    </form>
  );
}
