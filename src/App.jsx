import { Navigate, Route, Routes } from 'react-router-dom'
import DesignSystem from './pages/DesignSystem.jsx'

// This branch exists to host the Design System documentation site only —
// not the participant portal itself. Every real app page (Dashboard,
// Login, Enrollment, etc.) still lives under src/pages/ and its CSS is
// exactly what this design system page greps and documents from, but none
// of those flows should be reachable when this branch is deployed: a
// visitor should land on the design system immediately, not a login
// screen for an app they were never meant to sign into here.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DesignSystem />} />
      <Route path="/design-system" element={<DesignSystem />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
