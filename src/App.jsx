import React, { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Target,
  Map,
  Filter,
  Handshake,
  Zap,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  XCircle,
  BarChart3,
  Clock,
  TrendingUp,
  Shield,
  ExternalLink,
  Mail,
  Brain,
  Crosshair,
  FileText,
  Menu,
  X,
} from 'lucide-react'
import './App.css'

/* ─── constants ─── */
const REVEAL_THRESHOLD = 0.12
const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL || 'https://calendly.com/martongaspar/30min'
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'marton.gaspar.uk@gmail.com'
const BEEHIIV_EMBED_URL = import.meta.env.VITE_BEEHIIV_EMBED_URL || ''

/* ─── scroll-reveal hook ─── */
function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('revealed')
          obs.unobserve(el)
        }
      },
      { threshold: REVEAL_THRESHOLD }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useReveal()
  return (
    <div
      ref={ref}
      className={`reveal-item ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* ─── reusable CTA button ─── */
function CTAButton({ large, className = '' }) {
  return (
    <a
      href={CALENDLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] ${large ? 'px-8 py-4 text-lg' : 'px-6 py-3 text-base'} ${className}`}
    >
      Book a diagnostic call
      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
    </a>
  )
}

/* ─── NAVBAR ─── */
const NAV_LINKS = [
  { label: 'System', href: '#system' },
  { label: 'Offer', href: '#offer' },
  { label: 'About', href: '#about' },
]

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      aria-label="Primary"
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-dark-950/80 backdrop-blur-lg border-b border-dark-600/30 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
        <a href="#" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-400/10 flex items-center justify-center">
            <Target className="w-4 h-4 text-accent-400" />
          </div>
          <span className="text-white font-bold text-lg">AI IMPACT</span>
        </a>

        {/* desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold rounded-lg px-5 py-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          >
            Book a call
          </a>
        </div>

        {/* mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-gray-400 hover:text-white transition-colors"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-dark-950/95 backdrop-blur-lg border-b border-dark-600/30 px-6 pb-6 pt-2">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-gray-300 hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-center bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-lg px-5 py-3 transition-colors"
          >
            Book a call
          </a>
        </div>
      )}
    </nav>
  )
}

/* ─── HERO ─── */
function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-16">
      {/* bg glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-accent-400/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-400/6 rounded-full blur-[100px]" />
      </div>
      {/* grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full py-24 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* left */}
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent-400/20 bg-accent-400/5 text-accent-500 text-sm font-medium mb-8">
                <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
                AI Strategy for Leaders Under Pressure
              </div>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
                You're being asked what AI is delivering.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-cyan-400">
                  You don't have a clean answer.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="text-lg lg:text-xl text-gray-400 leading-relaxed mb-8 max-w-xl">
                I help companies turn scattered AI work into clear, measurable business impact in 10&nbsp;days.
              </p>
            </Reveal>

            <Reveal delay={250}>
              <ul className="space-y-3 mb-10">
                {[
                  'Identify where AI actually changes cost, speed, or revenue',
                  'Cut low-value work and focus on what matters',
                  'Give leadership a clear answer they can trust',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-accent-400 mt-0.5 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={300}>
              <CTAButton large />
            </Reveal>
          </div>

          {/* right — data viz */}
          <Reveal delay={200}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-400/10 to-cyan-400/10 rounded-2xl blur-xl" />
              <div className="relative bg-dark-800/80 border border-dark-600 rounded-2xl p-6 lg:p-8 backdrop-blur-sm">
                {/* window chrome */}
                <div className="flex items-center gap-3 mb-4 lg:mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <div className="w-3 h-3 rounded-full bg-green-400/60" />
                  <span className="ml-2 text-xs text-gray-500 font-mono">ai-impact-dashboard</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Active AI Initiatives</span>
                    <span className="text-white font-semibold">14</span>
                  </div>
                  <div className="h-px bg-dark-600" />
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Measurable', val: '3', color: 'text-green-400' },
                      { label: 'Unclear', val: '8', color: 'text-yellow-400' },
                      { label: 'No ROI', val: '3', color: 'text-red-400' },
                    ].map((d) => (
                      <div key={d.label} className="bg-dark-700/60 rounded-lg p-3 text-center">
                        <div className={`text-2xl font-bold ${d.color}`}>{d.val}</div>
                        <div className="text-xs text-gray-500 mt-1">{d.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* progress bars — desktop only */}
                  <div className="hidden lg:block space-y-2">
                    <div className="h-px bg-dark-600" />
                    {[
                      { name: 'Customer Support Bot', status: 'Scaling', pct: 85, color: 'bg-green-400' },
                      { name: 'Doc Processing', status: 'Evaluating', pct: 45, color: 'bg-yellow-400' },
                      { name: 'Sales Forecasting', status: 'Stalled', pct: 20, color: 'bg-red-400' },
                    ].map((r) => (
                      <div key={r.name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">{r.name}</span>
                          <span className="text-gray-500">{r.status}</span>
                        </div>
                        <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                          <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ─── PROBLEM ─── */
function Problem() {
  return (
    <section className="py-16 lg:py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" />
      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">
        <Reveal>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Most AI work looks active.{' '}
            <span className="text-gray-500">Very little of it holds up under scrutiny.</span>
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <p className="text-lg text-gray-400 mb-8">Across most companies, AI looks like this:</p>
        </Reveal>

        <Reveal delay={150}>
          <ul className="space-y-4 mb-10">
            {[
              'Pilots across multiple teams',
              'Tools being tested without clear outcomes',
              'Activity that can\'t be tied to business impact',
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-gray-300 text-lg">
                <XCircle className="w-5 h-5 text-red-400/70 mt-1 shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={200}>
          <p className="text-lg text-gray-400 mb-4">On the surface, it looks like progress. But when leadership asks:</p>
        </Reveal>

        <Reveal delay={250}>
          <blockquote className="border-l-4 border-accent-400 pl-6 py-2 mb-8">
            <p className="text-2xl lg:text-3xl font-bold text-white italic">
              "What is this actually delivering?"
            </p>
          </blockquote>
        </Reveal>

        <Reveal delay={300}>
          <p className="text-lg text-gray-400 mb-8">
            The answers break down because no one knows which workflows matter most,
            which initiatives are actually working, and what should be stopped.
          </p>
        </Reveal>

        {/* consequences */}
        <div className="grid sm:grid-cols-3 gap-6 mb-10">
          {[
            { icon: TrendingUp, title: 'Budget grows', desc: 'Spending keeps increasing without proof of return' },
            { icon: Clock, title: 'Work repeats', desc: 'Teams duplicate effort instead of scaling what works' },
            { icon: Shield, title: 'Confidence drops', desc: 'Leaders lose faith in the direction' },
          ].map((c, i) => (
            <Reveal key={c.title} delay={350 + i * 80}>
              <div className="bg-dark-800/60 border border-dark-600/50 rounded-xl p-6 hover:border-red-400/30 transition-colors duration-300">
                <c.icon className="w-8 h-8 text-red-400/70 mb-4" />
                <h3 className="text-white font-semibold text-lg mb-2">{c.title}</h3>
                <p className="text-gray-400 text-sm">{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={600}>
          <p className="text-lg text-gray-400 mb-8">
            This is not a technology problem.{' '}
            <span className="text-white font-semibold">It's a decision and clarity problem.</span>
          </p>
          <CTAButton />
        </Reveal>
      </div>
    </section>
  )
}

/* ─── ICP FILTER ─── */
function ICPFilter() {
  return (
    <section className="py-16 lg:py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-950 to-dark-900" />
      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">
        <Reveal>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-10">
            This is for you if:
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {[
            'You are responsible for AI direction or outcomes',
            'AI work is already happening across the business',
            'You are expected to show results, not activity',
            'You don\'t have a clear way to prioritise or measure impact',
          ].map((t, i) => (
            <Reveal key={t} delay={100 + i * 60}>
              <div className="flex items-start gap-3 bg-dark-800/40 border border-dark-600/30 rounded-xl p-5 hover:border-accent-400/30 transition-colors duration-300">
                <CheckCircle2 className="w-5 h-5 text-accent-400 mt-0.5 shrink-0" />
                <span className="text-gray-300">{t}</span>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  )
}

/* ─── METHOD ─── */
function Method() {
  const steps = [
    { icon: Crosshair, letter: 'I', word: 'Identify', desc: 'Tie AI to real workflows that affect cost, speed, risk, or revenue' },
    { icon: Map, letter: 'M', word: 'Map', desc: 'Get a clear view of what exists, who owns it, and what it\'s doing' },
    { icon: Filter, letter: 'P', word: 'Prioritise', desc: 'Focus on the few bets that actually matter' },
    { icon: Handshake, letter: 'A', word: 'Agree', desc: 'Define success upfront with clear criteria and baselines' },
    { icon: Zap, letter: 'C', word: 'Call', desc: 'Stop, continue, or scale -based on evidence' },
    { icon: MessageSquare, letter: 'T', word: 'Tell', desc: 'Give leadership a clear, defensible narrative' },
  ]

  return (
    <section id="system" className="py-16 lg:py-20 relative scroll-mt-20">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-950 to-dark-900" />
      {/* subtle accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent-400/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        <Reveal>
          <p className="text-accent-400 font-semibold text-sm uppercase tracking-wider mb-4 text-center">The System</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4 text-center">
            The AI{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-cyan-400">
              IMPACT
            </span>{' '}
            System
          </h2>
          <p className="text-gray-400 text-center mb-10 text-lg">Six steps. Ten days. Complete clarity.</p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {steps.map((s, i) => (
            <Reveal key={s.word} delay={i * 80}>
              <div className="group bg-dark-800/50 border border-dark-600/40 rounded-xl p-6 hover:border-accent-400/40 transition-all duration-300 hover:bg-dark-800/80 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-accent-400/10 flex items-center justify-center">
                    <s.icon className="w-5 h-5 text-accent-400" />
                  </div>
                  <div>
                    <span className="text-accent-400/60 text-xs font-mono">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="text-white font-bold text-lg leading-tight">{s.word}</h3>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={500}>
          <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto sm:max-w-none mb-10">
            {[
              { from: 'Activity', to: 'Impact' },
              { from: 'Opinion', to: 'Proof' },
            ].map((r) => (
              <div key={r.from} className="flex items-center justify-center gap-4 bg-dark-800/40 border border-dark-600/30 rounded-xl p-5">
                <span className="text-red-400/70 line-through text-lg">{r.from}</span>
                <ArrowRight className="w-4 h-4 text-accent-400" />
                <span className="text-accent-400 font-semibold text-lg">{r.to}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <CTAButton />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─── OFFER ─── */
function Offer() {
  return (
    <section id="offer" className="py-16 lg:py-20 relative scroll-mt-20">
      <div className="absolute inset-0 bg-dark-900" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        <div className="bg-gradient-to-br from-dark-800 to-dark-800/50 border border-dark-600/50 rounded-2xl p-8 lg:p-14">
          <Reveal>
            <p className="text-accent-400 font-semibold text-sm uppercase tracking-wider mb-4">The Offer</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-3">
              10-Day AI Strategy Intensive
            </h2>
            <p className="text-lg text-gray-400 mb-10 max-w-2xl">
              A focused sprint to turn AI activity into a clear, defensible strategy.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-10">
            <Reveal delay={100}>
              <div>
                <h3 className="text-white font-semibold text-lg mb-5">What you get</h3>
                <ul className="space-y-3">
                  {[
                    'A clear view of all AI work across the business',
                    'The top 1-3 AI bets that actually matter',
                    'Defined success metrics tied to business outcomes',
                    'A decision framework for stop / continue / scale',
                    'A leadership-ready narrative explaining what\'s happening and why',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3 text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-accent-400 mt-1 shrink-0" />
                      <span className="text-sm">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="bg-dark-700/40 border border-dark-600/30 rounded-xl p-6">
                <h3 className="text-white font-semibold text-lg mb-4">After 10 days, you can answer:</h3>
                <blockquote className="border-l-4 border-accent-400 pl-5 mb-4">
                  <p className="text-xl text-white font-semibold italic">
                    "What is our AI actually delivering?"
                  </p>
                </blockquote>
                <p className="text-gray-400 text-sm">Clearly. Without listing activity.</p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={300}>
            <div className="mt-10">
              <CTAButton large />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ─── DELIVERABLES ─── */
function Deliverables() {
  const items = [
    { icon: Brain, title: 'AI Opportunity Map', desc: 'What exists, what matters' },
    { icon: BarChart3, title: 'Success Criteria', desc: 'Measurable outcomes tied to business metrics' },
    { icon: FileText, title: 'Executive Narrative', desc: 'Ready for board and leadership discussions' },
  ]

  return (
    <section className="py-16 lg:py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-950 to-dark-900" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        <Reveal>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-12 text-center">
            What you walk away with
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-3 gap-5">
          {items.map((d, i) => (
            <Reveal key={d.title} delay={i * 80}>
              <div className="bg-dark-800/50 border border-dark-600/40 rounded-xl p-6 text-center hover:border-accent-400/30 transition-colors duration-300 h-full">
                <div className="w-12 h-12 rounded-xl bg-accent-400/10 flex items-center justify-center mx-auto mb-4">
                  <d.icon className="w-6 h-6 text-accent-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{d.title}</h3>
                <p className="text-gray-400 text-sm">{d.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── STATS BAR ─── */
function Stats() {
  return (
    <section className="py-16 relative">
      <div className="absolute inset-0 bg-dark-800/40 border-y border-dark-600/30" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: '10', label: 'Days to clarity' },
            { num: '6', label: 'Step system' },
            { num: '100%', label: 'Business-focused' },
            { num: '0', label: 'Fluff' },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 60}>
              <div>
                <div className="text-4xl lg:text-5xl font-extrabold text-white mb-1">{s.num}</div>
                <div className="text-gray-400 text-sm uppercase tracking-wider">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}



/* ─── RISK REVERSAL ─── */
function RiskReversal() {
  return (
    <section className="py-16 lg:py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-950 to-dark-900" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <Reveal>
          <p className="text-accent-400 font-semibold text-sm uppercase tracking-wider mb-4">Risk</p>
          <p className="text-lg lg:text-xl text-gray-300 leading-relaxed mb-6">
            If we cannot identify clear, measurable opportunities for AI to impact your business,
            you will know within the first few days.
          </p>
          <p className="text-gray-400">
            You are not committing to a long transformation programme.
          </p>
          <p className="text-white font-semibold mt-2">
            This is a short, focused intervention.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ─── ABOUT ─── */
function About() {
  return (
    <section id="about" className="py-16 lg:py-20 relative scroll-mt-20">
      <div className="absolute inset-0 bg-dark-900" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8">
        <Reveal>
          <p className="text-accent-400 font-semibold text-sm uppercase tracking-wider mb-4">About</p>
          <p className="text-lg text-gray-300 leading-relaxed mb-6">
            I work with companies where AI is already happening but the impact is unclear.
          </p>
          <p className="text-lg text-gray-400 mb-6">My focus is not tools.</p>
          <p className="text-lg text-gray-300 mb-4">It is helping leadership:</p>
          <ul className="space-y-3 mb-6">
            {[
              'Make better decisions',
              'Focus effort where it matters',
              'Explain AI in terms the business understands',
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-gray-300">
                <ChevronRight className="w-4 h-4 text-accent-400 mt-1 shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}

/* ─── BOTTOM CTA ─── */
function BottomCTA() {
  return (
    <section id="book" className="py-16 lg:py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 to-dark-950" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent-400/8 rounded-full blur-[100px]" />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <Reveal>
          <p className="text-accent-400 font-semibold text-sm uppercase tracking-wider mb-4">Start here</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Start with a diagnostic
          </h2>
          <p className="text-lg text-gray-400 mb-10 max-w-lg mx-auto">
            If you're being asked what AI is delivering and don't have a clean answer -start here.
          </p>
          <CTAButton large />
        </Reveal>
      </div>
    </section>
  )
}

/* ─── NEWSLETTER ─── */
function Newsletter() {
  if (!BEEHIIV_EMBED_URL) return null

  return (
    <section className="py-16 relative">
      <div className="absolute inset-0 bg-dark-800/30 border-y border-dark-600/20" />
      <div className="relative z-10 max-w-xl mx-auto px-6 lg:px-8 text-center">
        <Reveal>
          <p className="text-white font-semibold text-lg mb-2">Get AI strategy insights</p>
          <p className="text-gray-400 text-sm mb-6">No fluff. Just clarity on making AI work for your business.</p>
          <iframe
            src={BEEHIIV_EMBED_URL}
            data-test-id="beehiiv-embed"
            width="100%"
            height="52"
            frameBorder="0"
            scrolling="no"
            title="Subscribe to newsletter"
            className="rounded-lg"
          />
        </Reveal>
      </div>
    </section>
  )
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer className="py-12 relative">
      <div className="absolute inset-0 bg-dark-950 border-t border-dark-600/20" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-400/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-accent-400" />
            </div>
            <span className="text-white font-bold text-lg">AI IMPACT</span>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-400">
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Book a Call</a>
            <a href="https://www.linkedin.com/in/martongaspar/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white transition-colors">Contact</a>
            <a href="/privacy.html" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms.html" className="hover:text-white transition-colors">Terms</a>
          </nav>

          <div className="flex items-center gap-4">
            <a href="https://www.linkedin.com/in/martongaspar/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-accent-400 transition-colors" aria-label="LinkedIn profile">
              <ExternalLink className="w-5 h-5" />
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-gray-600 hover:text-accent-400 transition-colors" aria-label="Send email">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-dark-600/20 text-center text-xs text-gray-600">
          &copy; {new Date().getFullYear()} AI IMPACT. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

/* ─── SOCIAL PROOF ─── */
function SocialProof() {
  const imageBrands = [
    { name: 'Microsoft', src: '/logos/microsoft.svg', h: 'h-7' },
    { name: 'IBM', src: '/logos/ibm.svg', h: 'h-6' },
  ]
  const textBrands = ['Netflix', 'Amazon', 'eBay', 'BCG', 'EY', 'NHS', 'Edelman', 'Mindshare']

  return (
    <section className="py-16 lg:py-20 relative">
      <div className="absolute inset-0 bg-dark-800/40 border-y border-dark-600/30" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center">
        <Reveal>
          <p className="text-gray-400 text-sm uppercase tracking-wider mb-10">
            Leaders I've worked with come from
          </p>
        </Reveal>
        <Reveal delay={100}>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8 sm:gap-x-14">
            {imageBrands.map((l) => (
              <img
                key={l.name}
                src={l.src}
                alt={l.name}
                className={`${l.h} w-auto brightness-0 invert opacity-70`}
              />
            ))}
            {textBrands.map((name) => (
              <span
                key={name}
                className="text-xl font-bold tracking-wide text-gray-300 select-none"
              >
                {name}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─── TESTIMONIALS ─── */
function Testimonials() {
  const quotes = [
    {
      text: 'Candid yet compassionate feedback, always linking it to desired culture, outcomes and overarching strategy.',
      name: 'Pete Ward',
      role: 'Deputy Director',
      url: 'https://www.linkedin.com/in/peteward/',
    },
    {
      text: 'A rare set of creative skills and psychology understanding to challenge existing mindsets and ways of doing things.',
      name: 'Alex McCallum',
      role: 'Interim Chief Data Officer, EY',
      url: 'https://www.linkedin.com/in/alexmccallum/',
    },
    {
      text: 'Led the company into the age of modern product development, transforming the company to one that measures its success by outcomes, not outputs.',
      name: 'Alexandra Heimiller',
      role: 'Product Director',
      url: 'https://www.linkedin.com/in/alexandraheimiller/',
    },
    {
      text: 'An outcome-based approach, and a clear understanding of how to deliver value efficiently. He strikes an effective balance between being driven and being empathetic.',
      name: 'Ravi Sachdev',
      role: 'Senior Product Manager, Dept for Education',
      url: 'https://www.linkedin.com/in/ravisachdev/',
    },
  ]

  return (
    <section className="py-16 lg:py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-950 to-dark-900" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        <Reveal>
          <p className="text-accent-400 font-semibold text-sm uppercase tracking-wider mb-4 text-center">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-12 text-center">
            What leaders say
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-6">
          {quotes.map((q, i) => (
            <Reveal key={q.name} delay={i * 80}>
              <div className="bg-dark-800/50 border border-dark-600/40 rounded-xl p-6 h-full flex flex-col">
                <blockquote className="text-gray-300 leading-relaxed mb-6 flex-1">
                  "{q.text}"
                </blockquote>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold text-sm">{q.name}</p>
                    <p className="text-gray-500 text-xs">{q.role}</p>
                  </div>
                  <a
                    href={q.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-accent-400 transition-colors"
                    aria-label={`${q.name} on LinkedIn`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── COOKIE CONSENT ─── */
function CookieConsent() {
  const [visible, setVisible] = React.useState(() => {
    try { return !localStorage.getItem('cookie-consent') } catch { return true }
  })

  if (!visible) return null

  const dismiss = (choice) => {
    try { localStorage.setItem('cookie-consent', choice) } catch {}
    setVisible(false)
  }

  return (
    <div role="dialog" aria-label="Cookie consent" className="fixed bottom-0 inset-x-0 z-50 bg-dark-800 border-t border-dark-600 px-6 py-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-4 text-sm">
        <p className="text-gray-300">
          This site uses third-party services (Calendly) that may set cookies.{' '}
          <a href="/privacy.html" className="text-accent-400 hover:underline">Privacy Policy</a>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => dismiss('rejected')}
            className="border border-dark-500 hover:border-gray-400 text-gray-300 font-semibold rounded-lg px-5 py-2 text-sm transition-colors whitespace-nowrap"
          >
            Reject
          </button>
          <button
            onClick={() => dismiss('accepted')}
            className="bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-lg px-5 py-2 text-sm transition-colors whitespace-nowrap"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── APP ─── */
export default function App() {
  return (
    <>
      <style>{`
        .reveal-item {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-item.revealed {
          opacity: 1;
          transform: translateY(0);
        }
        .sr-only {
          position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
          overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
        }
        .sr-only:focus {
          position: fixed; top: 0; left: 0; z-index: 100; width: auto; height: auto;
          padding: 1rem 1.5rem; margin: 0; overflow: visible; clip: auto;
          background: #818cf8; color: #fff; font-size: 1rem; white-space: normal;
        }
      `}</style>
      <a href="#main-content" className="sr-only focus:not-sr-only">Skip to main content</a>
      <Navbar />
      <header role="banner">
        <Hero />
      </header>
      <main id="main-content" role="main">
        <Problem />
        <ICPFilter />
        <Method />
        <Stats />
        <Offer />
        <Deliverables />
        <SocialProof />
        <Testimonials />
        <RiskReversal />
        <About />
        <BottomCTA />
        <Newsletter />
      </main>
      <Footer />
      <CookieConsent />
    </>
  )
}
