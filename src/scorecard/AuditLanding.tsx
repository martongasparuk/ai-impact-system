// AI Impact Scorecard — landing page at /audit
// Phase 1: static landing only. CTA links to /audit/start (Phase 2 will build it).

import { useEffect } from 'react';

export default function AuditLanding() {
  useEffect(() => {
    document.title = 'The AI Strategy Gap Audit | AI Impact System';
  }, []);

  return (
    <div className="min-h-screen bg-dark-950 text-gray-200 font-sans antialiased">
      {/* Top bar */}
      <header className="border-b border-dark-700">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <a href="/" className="text-white font-bold tracking-tight text-lg">
            AI Impact System
          </a>
          <span className="text-xs uppercase tracking-[0.2em] text-gray-500">
            Free · 5 min · No sign-up
          </span>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-3xl mx-auto px-6 pt-20 pb-24">
        <p className="text-xs uppercase tracking-[0.22em] text-accent-400 font-semibold mb-8">
          For COOs, CTOs, and Transformation Directors at 50–200 person companies
        </p>

        <h1 className="text-5xl md:text-[56px] font-black text-white leading-[1.05] tracking-tight mb-8">
          What is your AI actually <span className="text-accent-400">doing for you</span>?
        </h1>

        <p className="text-xl text-gray-300 leading-relaxed mb-12">
          Most companies spend money on AI without knowing what it returns. You don't
          need another tool. You need to know where the money is going, what's working,
          and what to kill. Take the 5-minute AI Strategy Gap Audit to find out.
        </p>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center mb-5">
          <a
            href="/audit/start"
            className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-7 py-4 rounded-lg text-base transition-colors"
          >
            Start the Audit
            <span className="text-accent-400" aria-hidden="true">→</span>
          </a>
          <span className="text-sm text-gray-500">
            Takes 5 minutes · 28 questions · Score + gap + one recommendation
          </span>
        </div>

        {/* Risk reversal */}
        <p className="text-sm text-gray-500 mb-20">
          No sign-up required to see your score. Email is optional for the full report.
        </p>

        {/* What you get */}
        <section className="grid sm:grid-cols-3 gap-6 mb-24">
          <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
            <div className="text-accent-400 text-sm font-bold uppercase tracking-wider mb-3">
              01
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Your Score</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              A number out of 100 across the six pillars of real AI strategy. Named,
              not vague.
            </p>
          </div>
          <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
            <div className="text-accent-400 text-sm font-bold uppercase tracking-wider mb-3">
              02
            </div>
            <h3 className="text-white font-bold text-lg mb-2">The Gap</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              The two or three places your AI work is leaking money or credibility.
              The ones your board will notice first.
            </p>
          </div>
          <div className="bg-dark-800 border border-dark-600 rounded-lg p-6">
            <div className="text-accent-400 text-sm font-bold uppercase tracking-wider mb-3">
              03
            </div>
            <h3 className="text-white font-bold text-lg mb-2">One Move</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              The single highest-value action we would take if we had your board
              meeting on Monday.
            </p>
          </div>
        </section>

        {/* Trust strip */}
        <section className="pt-10 border-t border-dark-700">
          <p className="text-xs uppercase tracking-[0.22em] text-gray-500 mb-5 font-semibold">
            Built by
          </p>
          <div className="text-gray-400 leading-relaxed space-y-3">
            <p>
              <strong className="text-white">Marton Gaspar</strong>. 10+ years focused
              on AI. Product, data science, and AI strategy across scale-up and
              enterprise.
            </p>
            <ul className="text-sm text-gray-500 space-y-2 mt-4">
              <li>
                <span className="text-gray-300">IBM Watson partner</span> on chatbots
                for Microsoft, HSBC, and Lloyd's (2016–18).
              </li>
              <li>
                <span className="text-gray-300">HomeX Director of Product</span>:
                shipped 200,000 NLG-generated pages and drove 1M+ organic traffic on a
                $90M Series A scale-up.
              </li>
              <li>
                <span className="text-gray-300">EY Tax and Law</span>, Assistant
                Director: AI strategy with 60+ senior partners, defining a trigger-led
                opportunity model.
              </li>
              <li>
                One of 50 European product coaches trained by{' '}
                <span className="text-gray-300">Marty Cagan / SVPG</span>.
              </li>
              <li>
                Published AI thought leadership with Edelman, Mindshare, IPSoft, OMD,
                and RBS. BBC interview. 20+ top-tier press articles.
              </li>
            </ul>
          </div>
        </section>

        {/* Guarantee line */}
        <section className="mt-16 p-6 bg-dark-800 border border-accent-500/40 rounded-lg">
          <p className="text-white font-bold mb-2">
            The guarantee on the paid work that follows:
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            If the 10-day Strategy Intensive doesn't identify at least £100,000/year
            in impact across your AI programme, full refund. Take the audit first.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-700 mt-20">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} Marton Gaspar · AI Impact System</span>
          <span className="flex flex-wrap gap-x-4 gap-y-1">
            <a href="/privacy.html" className="text-gray-400 hover:text-white">Privacy</a>
            <a href="/terms.html" className="text-gray-400 hover:text-white">Terms</a>
            <a
              href="https://www.linkedin.com/in/martongaspar/"
              className="text-gray-400 hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
