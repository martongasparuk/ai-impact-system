import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './fonts.css'
import './index.css'
import App from './App.jsx'
import CookieConsent from './components/CookieConsent.jsx'
import ScorecardErrorBoundary from './scorecard/ErrorBoundary.tsx'

// /audit/* routes are code-split so the homepage bundle doesn't pay for the
// scorecard + radar chart + email capture. Each lazy chunk is ~60-80 KB raw.
const AuditLanding = lazy(() => import('./scorecard/AuditLanding.tsx'))
const ScorecardFlow = lazy(() => import('./scorecard/ScorecardFlow.tsx'))
const ResultPage = lazy(() => import('./scorecard/ResultPage.tsx'))
const BetaGate = lazy(() => import('./scorecard/BetaGate.tsx'))

function AuditFallback() {
  return (
    <div className="min-h-screen bg-dark-950 text-gray-400 flex items-center justify-center">
      <p className="text-sm">Loading...</p>
    </div>
  )
}

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<AuditFallback />}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route
            path="/audit"
            element={<ScorecardErrorBoundary><BetaGate><AuditLanding /></BetaGate></ScorecardErrorBoundary>}
          />
          <Route
            path="/audit/start"
            element={<ScorecardErrorBoundary><BetaGate><ScorecardFlow /></BetaGate></ScorecardErrorBoundary>}
          />
          <Route
            path="/audit/result"
            element={<ScorecardErrorBoundary><BetaGate><ResultPage /></BetaGate></ScorecardErrorBoundary>}
          />
        </Routes>
      </Suspense>
      <CookieConsent />
    </BrowserRouter>
  </StrictMode>,
)
