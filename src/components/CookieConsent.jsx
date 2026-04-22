import React from 'react'
import { CONSENT_STORAGE_KEY } from '../lib/consent.js'

export default function CookieConsent() {
  const [visible, setVisible] = React.useState(() => {
    try {
      return !localStorage.getItem(CONSENT_STORAGE_KEY)
    } catch (err) {
      console.warn('Cookie consent read failed:', err)
      return true
    }
  })

  if (!visible) return null

  const dismiss = (choice) => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, choice)
    } catch (err) {
      console.warn('Cookie consent save failed:', err)
    }
    setVisible(false)
    try {
      window.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: choice }))
    } catch {
      // No-op if CustomEvent unsupported
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-50 bg-dark-800 border-t border-dark-600 px-6 py-4"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-4 text-sm">
        <p className="text-gray-300">
          This site uses localStorage to save your progress and third-party services (Calendly, Cal.com) that may set cookies.{' '}
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
