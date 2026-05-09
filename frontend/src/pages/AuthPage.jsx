import { useState } from 'react'
import { loginUser, registerUser } from '../services/api'
import { setAuthSession } from '../services/auth'

function AuthPage() {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      if (mode === 'register') {
        try {
          await registerUser({ name, email, password })
        } catch (error) {
          // If account already exists, still try login with provided credentials.
          if (!String(error?.message || '').toLowerCase().includes('already exists')) {
            throw error
          }
        }
      }
      const result = await loginUser({ email, password })
      setAuthSession(result.token, result.user)
      setMessage(`Welcome ${result.user.name}. You are logged in.`)
    } catch (error) {
      setMessage(error?.message || 'Auth failed. Check your credentials.')
    }
  }

  return (
    <section className="page">
      <h2 className="page-title">Account</h2>
      <form className="card auth-form" onSubmit={submit}>
        <div className="controls">
          <button type="button" className="btn btn-ghost" onClick={() => setMode('login')}>
            Login
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setMode('register')}>
            Register
          </button>
        </div>
        {mode === 'register' ? (
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        ) : null}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn btn-primary" type="submit">
          {mode === 'login' ? 'Login' : 'Register & Login'}
        </button>
        {message ? <p className="muted">{message}</p> : null}
      </form>
    </section>
  )
}

export default AuthPage
