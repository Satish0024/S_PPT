import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Icon } from '../../lib/icons'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useEscapeToClose } from '../../hooks/useEscapeToClose'
import {
  faBars,
  faCog,
  faExchangeAlt,
  faFileAlt,
  faThLarge,
  faTimes,
  faUser,
  faWallet
} from '@fortawesome/free-solid-svg-icons'

const ITEMS = [
  { to: '/', label: 'Dashboard', icon: faThLarge, end: true },
  { to: '/portfolio', label: 'Investment portfolio', icon: faWallet },
  { to: '/transactions', label: 'Transactions', icon: faExchangeAlt },
  { to: '/profile', label: 'My profile', icon: faUser },
  { to: '/reports', label: 'Document Center', icon: faFileAlt }
]

// Mobile bottom bar carries just two targets (Dashboard / Menu); everything
// else lives in the "Menu" sheet. Settings used to sit in the bar as a third
// item, which gave a secondary screen the same weight as the dashboard while
// the four primary destinations were hidden behind the menu.
// Desktop's full 5-item vertical rail is unaffected; this is purely a
// mobile-width (<640px) presentation, driven by CSS, not a different route
// structure -- every link still points at the same routes as the desktop
// nav above.
const MENU_ITEMS = [
  ...ITEMS.filter((i) => i.to !== '/'),
  { to: '/settings', label: 'Settings', icon: faCog }
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const { theme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const onEnrollment = pathname.startsWith('/enrollment')
  const onGoal = pathname.startsWith('/retirement-goal')
  const onSummary = pathname.startsWith('/account-summary')
  const isActiveTo = (to) => (to === '/' ? pathname === '/' || onEnrollment || onGoal || onSummary : pathname.startsWith(to))

  useEscapeToClose(menuOpen, () => setMenuOpen(false))
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <>
      <nav className="nav" aria-label="Primary">
        {ITEMS.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => (isActive || (to === '/' && (onEnrollment || onGoal || onSummary)) ? 'active' : '')}
          >
            <span className="ico" aria-hidden="true">
              <Icon icon={icon} size={23} />
            </span>
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}

        <div className="nav-bottom">
          {/* Fixed platform mark -- always CORE, never the tenant's own
              logo (that's the header's job, via BRAND.logo). This is the
              "built on CORE" watermark, not a rebrandable element. */}
          <div className="nav-brand" aria-hidden="true">
            <img src={theme === 'dark' ? '/core-logo-dark.svg' : '/core-logo.svg'} alt="" />
          </div>
        </div>
      </nav>

      <nav className="mobile-nav" aria-label="Primary (mobile)">
        <NavLink to="/" end className={() => (isActiveTo('/') ? 'mobile-nav-btn active' : 'mobile-nav-btn')}>
          <span className="ico" aria-hidden="true">
            <Icon icon={faThLarge} size={22} />
          </span>
          <span className="nav-label">Dashboard</span>
        </NavLink>
        <button
          type="button"
          className={`mobile-nav-btn${menuOpen ? ' active' : ''}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="ico" aria-hidden="true">
            <Icon icon={menuOpen ? faTimes : faBars} size={22} />
          </span>
          <span className="nav-label">Menu</span>
        </button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu-bg" role="presentation" onClick={() => setMenuOpen(false)}>
          <div className="mobile-menu-sheet" role="menu" aria-label="More" onClick={(e) => e.stopPropagation()}>
            {MENU_ITEMS.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                role="menuitem"
                className={() => (isActiveTo(to) ? 'active' : '')}
                onClick={() => setMenuOpen(false)}
              >
                <span className="ico" aria-hidden="true">
                  <Icon icon={icon} size={20} />
                </span>
                <span className="nav-label">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
