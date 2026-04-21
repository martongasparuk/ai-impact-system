import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '@fontsource-variable/inter'
import './index.css'
import App from './App.jsx'
import AuditLanding from './scorecard/AuditLanding.tsx'

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/audit" element={<AuditLanding />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
