function randomId() {
  // Not cryptographic (fine for a no-auth prototype). Keeps a stable id per device/browser.
  return `pf_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

export function getOrCreateLocalProfileId() {
  const key = 'pf_profile_id'
  const existing = window.localStorage.getItem(key)
  if (existing) return existing
  const created = randomId()
  window.localStorage.setItem(key, created)
  return created
}


