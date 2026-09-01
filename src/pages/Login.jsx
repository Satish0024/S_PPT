import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useParticipant } from '../context/ParticipantContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { BRAND } from '../config/brand.js'
import '../styles/login.css'

// The participant/scenario switcher used to live here as a "Try a
// participant" picker. Now that this is heading to production, login is a
// real email/password form only — switching between demo participants
// moved to the profile menu in the header (post-login), alongside
// Settings/Help/Sign out, rather than being part of the sign-in flow itself.
export default function Login() {
  const { login } = useParticipant()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!login(email, password)) {
      setError('Email or password is incorrect.')
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="login-page">
      <aside className="login-brand" aria-hidden="true">
        <div className="login-waves" />
        <div className="login-brand-copy">
          <img src={BRAND.logoOnDark || BRAND.logo} alt="" />
          <h1>{BRAND.tagline}</h1>
          <p>{BRAND.taglineBody}</p>
        </div>
      </aside>
      <main className="login-panel">
        <div className="login-card">
          <img className="login-logo" src={theme === 'dark' ? BRAND.logoOnDark || BRAND.logo : BRAND.logo} alt={BRAND.name} />
          <h2>Sign in</h2>
          <p className="login-lead">Use your participant email to continue.</p>

          <form onSubmit={submit}>
            <label className="login-field">
              Email
              <span className="login-input">
                <Mail size={16} strokeWidth={2} />
                <input
                  type="email"
                  autoComplete="username"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  required
                />
              </span>
            </label>
            <label className="login-field">
              Password
              <span className="login-input">
                <Lock size={16} strokeWidth={2} />
                <input
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  required
                />
                <button type="button" className="login-eye" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>
            {error && <p className="login-error">{error}</p>}
            <button className="login-submit" type="submit">
              Sign in
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
