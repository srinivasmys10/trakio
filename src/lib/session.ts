/**
 * Returns a stable UUID for this device/browser.
 * Generated once, persisted to localStorage forever.
 * Used as the session_id for meal plans — no login required.
 */

const SESSION_KEY = 'run14k_session_id'

function generateUUID(): string {
  // Use crypto.randomUUID if available (all modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

let _cached: string | null = null

export function getSessionId(): string {
  if (_cached) return _cached

  try {
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored) {
      _cached = stored
      return _cached
    }
    const id = generateUUID()
    localStorage.setItem(SESSION_KEY, id)
    _cached = id
    return _cached
  } catch {
    // If localStorage is unavailable, use in-memory id (won't persist across refreshes)
    if (!_cached) _cached = generateUUID()
    return _cached
  }
}
