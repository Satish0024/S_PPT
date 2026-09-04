import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../lib/icons'
import { faFlask, faEye, faEyeSlash, faLock, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { DEMO_PASSWORD } from '../data/participants'
import { useParticipant } from '../context/ParticipantContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { BRAND } from '../config/brand.js'
import '../styles/login.css'

// The participant/scenario switcher used to live inline in the sign-in
// form as a "Try a participant" picker. Now that this is heading to
// production, the real sign-in form only takes email/password — but this
// is still a prototype, so a scenario switch is kept, just moved out of the
// form itself: a small "Prototype demo" control in the corner of the page,
// and (post-login) the profile menu in the header alongside Settings/Help.
export default function Login() {
  const { login, participants } = useParticipant()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [demoOpen, setDemoOpen] = useState(false)
  const demoRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (demoRef.current && !demoRef.current.contains(e.target)) setDemoOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setDemoOpen(false)
    }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const submit = (e) => {
    e.preventDefault()
    if (!login(email, password)) {
      setError('Email or password is incorrect.')
      return
    }
    navigate('/', { replace: true })
  }

  const pickDemoUser = (p) => {
    setDemoOpen(false)
    if (login(p.profile.email, DEMO_PASSWORD)) navigate('/', { replace: true })
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
                <Icon icon={faEnvelope} size={16} />
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
                <Icon icon={faLock} size={16} />
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
                  {show ? <Icon icon={faEyeSlash} size={16} /> : <Icon icon={faEye} size={16} />}
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

      <div className="login-demo-corner" ref={demoRef}>
        <button
          type="button"
          className={`login-demo-toggle${demoOpen ? ' open' : ''}`}
          aria-haspopup="listbox"
          aria-expanded={demoOpen}
          onClick={() => setDemoOpen((v) => !v)}
        >
          <Icon icon={faFlask} size={14} />
          Prototype demo — try a participant
        </button>
        {demoOpen && (
          <div className="login-demo-menu" role="listbox">
            {participants.map((p) => (
              <button key={p.id} type="button" className="login-demo-row" role="option" onClick={() => pickDemoUser(p)}>
                <img src={p.avatar} alt="" width={22} height={22} />
                <span className="login-demo-text">
                  <strong>{p.name}</strong>
                  <small>{p.scenario}</small>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
