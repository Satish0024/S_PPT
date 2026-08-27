import { NavLink, useLocation } from 'react-router-dom'
import {
  ArrowLeftRight,
  ClipboardList,
  FileText,
  LayoutGrid,
  UserRound,
  Wallet
} from 'lucide-react'
import { useParticipant } from '../../context/ParticipantContext.jsx'
import { isNotEligibleUser } from '../../data/participants'

const ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/portfolio', label: 'Investment portfolio', icon: Wallet },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/profile', label: 'My profile', icon: UserRound },
  { to: '/reports', label: 'Reports & documents', icon: FileText }
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const { participant } = useParticipant()
  const onEnrollment = pathname.startsWith('/enrollment')
  const onGoal = pathname.startsWith('/retirement-goal')
  const onSummary = pathname.startsWith('/account-summary')
  const showQuestionnaire = !isNotEligibleUser(participant)

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
        {showQuestionnaire && (
          <NavLink
            to="/risk-check-in"
            className={({ isActive }) => `nav-cta${isActive ? ' active' : ''}`}
            title="Risk check-in"
            aria-label="Risk check-in"
          >
            <ClipboardList size={20} strokeWidth={1.9} />
          </NavLink>
        )}

        <div className="nav-brand" aria-hidden="true">
          <img src="/core-logo.svg" alt="" />
        </div>
      </div>
    </nav>
  )
}
