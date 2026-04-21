// Diagnostic Call CTA — opens Cal.com booking in new tab.
// Set VITE_CAL_URL in .env to override the placeholder URL.

type Props = {
  label: string;
  route: 'diagnostic_call' | 'webinar' | 'nurture_only' | 'waitlist';
};

// Fallback placeholder. Replace via VITE_CAL_URL env var once Marton sets up Cal.com.
const DEFAULT_CAL_URL = 'https://cal.com/marton-gaspar/diagnostic-call';

function getBookingUrl(route: Props['route']): string {
  const configured = import.meta.env.VITE_CAL_URL as string | undefined;
  const base = configured && configured.trim().length > 0 ? configured : DEFAULT_CAL_URL;

  // Attach UTM for routing attribution
  const url = new URL(base);
  url.searchParams.set('utm_source', 'aiimpactsystem');
  url.searchParams.set('utm_medium', 'scorecard');
  url.searchParams.set('utm_campaign', route);
  return url.toString();
}

export default function DiagnosticCallCTA({ label, route }: Props) {
  if (route === 'waitlist') {
    return (
      <a
        href="mailto:marton@aiimpactsystem.com?subject=Compounding%20Roundtable%20Waitlist"
        className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-semibold px-7 py-4 rounded-lg text-base transition-colors"
      >
        {label}
      </a>
    );
  }

  if (route === 'webinar' || route === 'nurture_only') {
    return (
      <a
        href="#subscribe"
        className="inline-flex items-center gap-2 bg-dark-800 border border-accent-500 text-accent-400 hover:bg-accent-500 hover:text-white font-semibold px-7 py-4 rounded-lg text-base transition-colors"
      >
        {label}
      </a>
    );
  }

  // diagnostic_call
  return (
    <a
      href={getBookingUrl(route)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-7 py-4 rounded-lg text-base transition-colors"
    >
      {label}
    </a>
  );
}
