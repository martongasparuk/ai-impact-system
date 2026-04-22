// Error boundary for /audit/* routes. A render-time bug should show a
// recoverable screen, not a blank page. Errors are logged to the console so
// Netlify's client log capture can surface them during beta.

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { CONTACT_EMAIL } from '../config';

type Props = { children: ReactNode };
type State = { hasError: boolean; message?: string };

export default class ScorecardErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[scorecard] render error', { error, info });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-dark-950 text-gray-200 font-sans antialiased flex items-center justify-center px-6">
        <div className="max-w-xl text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-red-400 font-semibold mb-6">
            Something broke
          </p>
          <h1 className="text-3xl font-bold text-white leading-tight mb-4">
            The audit hit a snag
          </h1>
          <p className="text-gray-400 leading-relaxed mb-8">
            We logged the error. Refresh the page to try again. If it keeps
            happening, email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent-400 hover:underline">
              {CONTACT_EMAIL}
            </a>{' '}
            and mention which step you were on.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-accent-500 hover:bg-accent-600 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
            >
              Refresh
            </button>
            <a
              href="/audit"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Start over
            </a>
          </div>
        </div>
      </div>
    );
  }
}
