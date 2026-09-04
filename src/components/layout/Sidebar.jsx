import { NavLink, useLocation } from 'react-router-dom'
import { Icon } from '../../lib/icons'
import {
  faExchangeAlt,
  faFileAlt,
  faThLarge,
  faUser,
  faWallet
} from '@fortawesome/free-solid-svg-icons'
import { useTheme } from '../../context/ThemeContext.jsx'
import { BRAND } from '../../config/brand.js'

const ITEMS = [
  { to: '/', label: 'Dashboard', icon: faThLarge, end: true },
  { to: '/portfolio', label: 'Investment portfolio', icon: faWallet },
  { to: '/transactions', label: 'Transactions', icon: faExchangeAlt },
  { to: '/profile', label: 'My profile', icon: faUser },
  { to: '/reports', label: 'Document Center', icon: faFileAlt }
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const { theme } = useTheme()
  const onEnrollment = pathname.startsWith('/enrollment')
  const onGoal = pathname.startsWith('/retirement-goal')
  const onSummary = pathname.startsWith('/account-summary')

  return (
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
        <div className="nav-brand" aria-hidden="true">
          <img src={theme === 'dark' ? BRAND.logoOnDark || BRAND.logo : BRAND.logo} alt="" />
        </div>
      </div>
    </nav>
  )
}
