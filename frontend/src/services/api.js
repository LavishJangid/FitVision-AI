import { getToken } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://127.0.0.1:8000'

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parseError(response, fallbackMessage) {
  try {
    const data = await response.json()
    if (data?.detail) return new Error(data.detail)
  } catch {
    // Ignore JSON parse errors and use fallback.
  }
  return new Error(fallbackMessage)
}

async function postSession(payload) {
  const response = await fetch(`${API_BASE_URL}/progress/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw await parseError(response, 'Failed to save workout session')
  return response.json()
}

async function fetchStats() {
  const response = await fetch(`${API_BASE_URL}/progress/stats`, { headers: { ...authHeaders() } })
  if (!response.ok) throw await parseError(response, 'Failed to fetch stats')
  return response.json()
}

async function fetchSessions(limit = 10) {
  const response = await fetch(`${API_BASE_URL}/progress/sessions?limit=${limit}`, { headers: { ...authHeaders() } })
  if (!response.ok) throw await parseError(response, 'Failed to fetch sessions')
  return response.json()
}

async function registerUser(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw await parseError(response, 'Registration failed')
  return response.json()
}

async function loginUser(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw await parseError(response, 'Login failed')
  return response.json()
}

async function fetchProfile() {
  const response = await fetch(`${API_BASE_URL}/auth/me`, { headers: { ...authHeaders() } })
  if (!response.ok) throw await parseError(response, 'Unauthorized')
  return response.json()
}

async function fetchLeaderboard(limit = 10) {
  const response = await fetch(`${API_BASE_URL}/progress/leaderboard?limit=${limit}`)
  if (!response.ok) throw await parseError(response, 'Failed to fetch leaderboard')
  return response.json()
}

async function fetchChallenges() {
  const response = await fetch(`${API_BASE_URL}/progress/challenges`, { headers: { ...authHeaders() } })
  if (!response.ok) throw await parseError(response, 'Failed to fetch challenges')
  return response.json()
}

export {
  API_BASE_URL,
  WS_BASE_URL,
  postSession,
  fetchStats,
  fetchSessions,
  registerUser,
  loginUser,
  fetchProfile,
  fetchLeaderboard,
  fetchChallenges,
}
