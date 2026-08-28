import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { DEMO_PASSWORD } from '../data/participants'
import { useParticipant } from '../context/ParticipantContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { BRAND } from '../config/brand.js'
import '../styles/login.css'

export default function Login() {
  const { login, participants } = useParticipant()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState(null)
  const dropRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const goDashboard = (ok) => {
    if (!ok) {
      setError('Email or password is incorrect.')
      return
    }
    navigate('/', { replace: true })
  }

  const submit = (e) => {
    e.preventDefault()
    goDashboard(login(email, password))
  }

  const pickUser = (p) => {
    setPicked(p)
    setEmail(p.profile.email)
    setPassword(DEMO_PASSWORD)
    setError('')
    setOpen(false)
    goDashboard(login(p.profile.email, DEMO_PASSWORD))
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

          <p className="login-hint">
            Demo password: <b>{DEMO_PASSWORD}</b>
          </p>
          <div className="login-demos" ref={dropRef}>
            <span>Try a participant</span>
            <button
              type="button"
              className={`lp-toggle${open ? ' open' : ''}`}
              aria-haspopup="listbox"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {picked ? (
                <span className="lp-text">
                  <strong>{picked.name}</strong>
                  <small>{picked.scenario}</small>
                </span>
              ) : (
                <span className="lp-placeholder">Select a participant</span>
              )}
              <ChevronDown size={16} strokeWidth={2.2} />
            </button>
            {open && (
              <div className="lp-menu" role="listbox">
                {participants.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`lp-row${picked?.id === p.id ? ' on' : ''}`}
                    role="option"
                    aria-selected={picked?.id === p.id}
                    onClick={() => pickUser(p)}
                  >
                    <img src={p.avatar} alt="" width={24} height={24} />
                    <span className="lp-text">
                      <strong>{p.name}</strong>
                      <small>{p.scenario}</small>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
