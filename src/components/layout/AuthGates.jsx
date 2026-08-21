import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useParticipant } from '../../context/ParticipantContext.jsx'

export function RequireAuth() {
  const { loggedIn } = useParticipant()
  const location = useLocation()
  if (!loggedIn) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

export function GuestOnly() {
  const { loggedIn } = useParticipant()
  if (loggedIn) return <Navigate to="/" replace />
  return <Outlet />
}
