const TOKEN_KEY = 'fitvision_token'
const USER_KEY = 'fitvision_user'

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

function setAuthSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export { getToken, setAuthSession, clearAuthSession, getStoredUser }
