import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '@fontsource-variable/inter'
import './index.css'
import App from './App.jsx'
import AuditLanding from './scorecard/AuditLanding.tsx'
import ScorecardFlow from './scorecard/ScorecardFlow.tsx'
import ResultPage from './scorecard/ResultPage.tsx'

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/audit" element={<AuditLanding />} />
        <Route path="/audit/start" element={<ScorecardFlow />} />
        <Route path="/audit/result" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
