// Pure module for cookie/storage consent state.
// Kept separate from the CookieConsent component so that importers don't
// break react-refresh boundaries in Vite.

export const CONSENT_STORAGE_KEY = 'cookie-consent'

export const hasStorageConsent = () => {
  try {
    return localStorage.getItem(CONSENT_STORAGE_KEY) === 'accepted'
  } catch {
    return false
  }
}
