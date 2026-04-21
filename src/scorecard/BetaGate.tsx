// Beta gate wrapper for the scorecard routes.
// If beta is required and the user doesn't have access, shows a "Coming soon" page with a signal for testers.
// Also sets a noindex meta on all /audit pages during beta so Google doesn't index pre-launch content.

import { useEffect, type ReactNode } from 'react';
import { useBetaFlag } from './useBetaFlag';

type Props = { children: ReactNode };

export default function BetaGate({ children }: Props) {
  const { betaRequired, hasAccess } = useBetaFlag();

  // Add noindex,nofollow meta while beta is active (regardless of user access).
  // Ensures the scorecard isn't indexed before we're ready.
  useEffect(() => {
    if (!betaRequired) return;
    const existing = document.querySelector('meta[name="robots"]');
    if (existing) {
      existing.setAttribute('content', 'noindex, nofollow');
      return;
    }
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, [betaRequired]);

  if (!betaRequired || hasAccess) {
    return (
      <>
        {betaRequired && hasAccess && <BetaBanner />}
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-gray-200 font-sans antialiased flex items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-accent-400 font-semibold mb-6">
          Coming soon
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
          The AI Strategy Gap Audit
        </h1>
        <p className="text-lg text-gray-400 leading-relaxed mb-10">
          Opening in the next few weeks. A free 5-minute audit that tells you where
          your AI money is going, what is working, and what to kill — before your
          next board meeting.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-7 py-4 rounded-lg text-base transition-colors"
        >
          Back to the home page →
        </a>
        <p className="text-xs text-gray-600 mt-10">
          Got a beta invite link? Check you included{' '}
          <code className="text-gray-500">?beta=true</code> at the end of the URL.
        </p>
      </div>
    </div>
  );
}

function BetaBanner() {
  return (
    <div className="bg-accent-500/90 text-white text-center text-xs font-semibold py-2 px-4">
      BETA · You're seeing the pre-launch scorecard. Feedback welcome:{' '}
      <a
        href="mailto:marton.gaspar.uk@gmail.com?subject=Scorecard%20beta%20feedback"
        className="underline"
      >
        email me
      </a>
    </div>
  );
}
