import { Routes, Route } from "react-router-dom";
import { ParticipantProvider } from "./context/ParticipantContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppLayout from "./layout/AppLayout";
import { GuestOnly, RequireAuth } from "./layout/AuthGates";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import AccountSummary from "./pages/AccountSummary";
import PlanDetails from "./pages/PlanDetails";
import RetirementGoal from "./pages/RetirementGoal";
import RiskQuestionnaire from "./pages/RiskQuestionnaire";
import Enrollment from "./pages/Enrollment";
import Enrich from "./pages/Enrich";
import TransactionWizard from "./pages/TransactionWizard";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/common/ErrorBoundary";

function App() {
  return (
    <ThemeProvider>
      <ParticipantProvider>
        <ErrorBoundary>
          <Routes>
            <Route element={<GuestOnly />}>
              <Route path="/login" element={<Login />} />
            </Route>
            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/transactions/request/:type" element={<TransactionWizard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/plans/:planId" element={<PlanDetails />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/account-summary" element={<AccountSummary />} />
                <Route path="/retirement-goal" element={<RetirementGoal />} />
                <Route path="/enrollment" element={<Enrollment />} />
                <Route path="/enrollment/summary" element={<Enrollment />} />
                <Route path="/risk-questionnaire" element={<RiskQuestionnaire />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              {/* Enrich uses its own standalone layout (no sidebar) */}
              <Route path="/enrich" element={<Enrich />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </ParticipantProvider>
    </ThemeProvider>
  );
}

export default App;
