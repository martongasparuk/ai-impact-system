import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '@fontsource-variable/inter'
import './index.css'
import App from './App.jsx'
import AuditLanding from './scorecard/AuditLanding.tsx'
import ScorecardFlow from './scorecard/ScorecardFlow.tsx'
import ResultPage from './scorecard/ResultPage.tsx'
import BetaGate from './scorecard/BetaGate.tsx'

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/audit" element={<BetaGate><AuditLanding /></BetaGate>} />
        <Route path="/audit/start" element={<BetaGate><ScorecardFlow /></BetaGate>} />
        <Route path="/audit/result" element={<BetaGate><ResultPage /></BetaGate>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
