import { useParticipant } from '../context/ParticipantContext.jsx'
import { hasAccountSummary } from '../lib/accountSummary'
import OverallBalance from '../components/dashboard/OverallBalance.jsx'
import PlanCard from '../components/dashboard/PlanCard.jsx'
import QuickLinks from '../components/dashboard/QuickLinks.jsx'
import Transactions from '../components/dashboard/Transactions.jsx'
import LearningPortal from '../components/dashboard/LearningPortal.jsx'

// Retirement Readiness (score ring + "Adjust your goal" page) and the risk
// widget/questionnaire are removed for Saturna per prototype review #2 —
// they stay available on other branded builds via RetirementGoalSimulatorV2
// / RiskMeterV2 / the /retirement-goal and /risk-check-in routes, just not
// wired up here.
export default function Dashboard() {
  const { participant } = useParticipant()
  const first = participant.name.split(' ')[0]
  // Cash Balance is a notional benefit, not real plan assets — carried
  // separately from every balance total already (see planBalance /
  // isSummaryPlan), same as an outstanding loan. Surfaced explicitly here
  // per prototype review #8 so it's visibly excluded, not just silently so.
  const cashBalancePlan = participant.plans.find((p) => p.type === 'Cash Balance' && p.cashBenefit)

  return (
    <div className="page-body">
      <div className="hi-bar">
        <h1>Hi {first} 👋</h1>
      </div>
      <div className="dash-layout">
        <div className="dash-main">
          <OverallBalance
            {...participant.overall}
            showSummary={hasAccountSummary(participant)}
            cashBalance={cashBalancePlan?.cashBenefit}
          />
          <section>
            <h2 className="section-title">My plans</h2>
            <div className="plans-grid">
              {participant.plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </section>
          <QuickLinks />
          <Transactions rows={participant.transactions.slice(0, 5)} />
        </div>
        <aside className="dash-side">
          <LearningPortal />
        </aside>
      </div>
    </div>
  )
}
