import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import EnrollmentLayout from './components/layout/EnrollmentLayout.jsx'
import { GuestOnly, RequireAuth } from './components/layout/AuthGates.jsx'
import Dashboard from './pages/Dashboard.jsx'
import PlanDetails from './pages/PlanDetails.jsx'
import Enrollment from './pages/Enrollment.jsx'
import Investments from './pages/Investments.jsx'
import EnrollmentSummary from './pages/EnrollmentSummary.jsx'
import Portfolio from './pages/Portfolio.jsx'
import Enrich from './pages/Enrich.jsx'
import Profile from './pages/Profile.jsx'
import Transactions from './pages/Transactions.jsx'
import Reports from './pages/Reports.jsx'
import Login from './pages/Login.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<Login />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/plans/:planId" element={<PlanDetails />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/accounts" element={<Navigate to="/reports" replace />} />
        </Route>
        <Route element={<EnrollmentLayout />}>
          <Route path="/enrollment" element={<Enrollment />} />
          <Route path="/enrollment/auto-increase" element={<Navigate to="/enrollment" replace />} />
          <Route path="/enrollment/investments" element={<Investments />} />
          <Route path="/enrollment/beneficiaries" element={<Navigate to="/enrollment/summary" replace />} />
          <Route path="/enrollment/summary" element={<EnrollmentSummary />} />
        </Route>
        <Route path="/enrich" element={<Enrich />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
