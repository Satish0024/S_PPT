import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown, LogOut, Moon, Sun } from 'lucide-react'
import { useParticipant } from '../../context/ParticipantContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { BRAND } from '../../config/brand.js'

export default function Header() {
  const { participant, participants, selectParticipant, logout } = useParticipant()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <header className="topbar">
      <div className="brand">
        <img src={theme === 'dark' ? BRAND.logoOnDark || BRAND.logo : BRAND.logo} alt={BRAND.name} />
      </div>
      <div className="top-right">
        <button
          type="button"
          className="icon-btn theme-toggle"
          onClick={toggle}
          aria-pressed={theme === 'dark'}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <Sun size={19} strokeWidth={2.1} /> : <Moon size={19} strokeWidth={2.1} />}
        </button>
        <div className="user-menu" ref={menuRef}>
          <button
            type="button"
            className={`user-chip${open ? ' open' : ''}`}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <img src={participant.avatar} alt="" />
            <span className="chip-text">
              <span className="chip-name">{participant.name}</span>
            </span>
            <ChevronDown className="chev" size={14} strokeWidth={2.2} />
          </button>
          <div className={`user-dropdown${open ? ' open' : ''}`} role="menu" aria-label="Account">
            <div className="dd-label">Participants</div>
            {participants.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`user-option${p.id === participant.id ? ' on' : ''}`}
                role="menuitemradio"
                aria-checked={p.id === participant.id}
                onClick={() => {
                  selectParticipant(p.id)
                  setOpen(false)
                  navigate('/', { replace: true })
                }}
              >
                <img src={p.avatar} alt="" />
                <span className="meta">
                  <span className="name">{p.name}</span>
                  <span className="scenario">{p.scenario}</span>
                </span>
                <Check className="check" size={18} strokeWidth={2.4} />
              </button>
            ))}
            <button
              type="button"
              className="user-option sign-out"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                logout()
                navigate('/login', { replace: true })
              }}
            >
              <span className="sign-out-ico" aria-hidden="true">
                <LogOut size={16} strokeWidth={2.2} />
              </span>
              <span className="meta">
                <span className="name">Sign out</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
