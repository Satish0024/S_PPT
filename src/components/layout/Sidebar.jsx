import { NavLink, useLocation } from 'react-router-dom'
import {
  ArrowLeftRight,
  FileText,
  LayoutGrid,
  UserRound,
  Wallet
} from 'lucide-react'

const ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/reports', label: 'Reports & Documents', icon: FileText },
  { to: '/portfolio', label: 'Investment Portfolio', icon: Wallet }
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const onEnrollment = pathname.startsWith('/enrollment')

  return (
    <nav className="nav" aria-label="Primary">
      {ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => (isActive || (to === '/' && onEnrollment) ? 'active' : '')}
        >
          <span className="ico" aria-hidden="true">
            <Icon size={23} strokeWidth={1.7} />
          </span>
          <span className="nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
