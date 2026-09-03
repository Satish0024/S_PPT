import { NavLink, useLocation } from 'react-router-dom'
import {
  ArrowLeftRight,
  FileText,
  LayoutGrid,
  UserRound,
  Wallet
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext.jsx'
import { BRAND } from '../../config/brand.js'

const ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/portfolio', label: 'Investment portfolio', icon: Wallet },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/profile', label: 'My profile', icon: UserRound },
  { to: '/reports', label: 'Document Center', icon: FileText }
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const { theme } = useTheme()
  const onEnrollment = pathname.startsWith('/enrollment')
  const onGoal = pathname.startsWith('/retirement-goal')
  const onSummary = pathname.startsWith('/account-summary')

  return (
    <nav className="nav" aria-label="Primary">
      {ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => (isActive || (to === '/' && (onEnrollment || onGoal || onSummary)) ? 'active' : '')}
        >
          <span className="ico" aria-hidden="true">
            <Icon size={23} strokeWidth={1.7} />
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
