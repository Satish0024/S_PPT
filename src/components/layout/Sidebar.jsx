import { NavLink, useLocation } from 'react-router-dom'
import { Icon } from '../../lib/icons'
import {
  faExchangeAlt,
  faFileAlt,
  faThLarge,
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

export default function Sidebar() {
  const { pathname } = useLocation()
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
        {/* Fixed platform mark -- always CORE, never the tenant's own
            logo (that's the header's job, via BRAND.logo). This is the
            "built on CORE" watermark, not a rebrandable element. */}
        <div className="nav-brand" aria-hidden="true">
          <img src="/core-logo.svg" alt="" />
        </div>
      </div>
    </nav>
  )
}
