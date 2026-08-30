import { useParticipant } from '../context/ParticipantContext.jsx'
import { isNotEligibleUser } from '../data/participants'
import { hasAccountSummary } from '../lib/accountSummary'
import OverallBalance from '../components/dashboard/OverallBalance.jsx'
import PlanCard from '../components/dashboard/PlanCard.jsx'
import QuickLinks from '../components/dashboard/QuickLinks.jsx'
import Transactions from '../components/dashboard/Transactions.jsx'
import LearningPortal from '../components/dashboard/LearningPortal.jsx'
import RiskMeterV2 from '../components/dashboard/RiskMeterV2.jsx'
import ReadinessScoreCard from '../components/dashboard/ReadinessScoreCard.jsx'

export default function Dashboard() {
  const { participant } = useParticipant()
  const first = participant.name.split(' ')[0]
  const showReadiness = !isNotEligibleUser(participant)
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
              {participant.plans
                .filter((plan) => plan.type !== 'Profit Sharing')
                .map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
            </div>
          </section>
          <QuickLinks />
          <Transactions rows={participant.transactions.slice(0, 5)} />
        </div>
        <aside className="dash-side">
          {showReadiness && <ReadinessScoreCard />}
          <LearningPortal />
          <RiskMeterV2 />
        </aside>
      </div>
    </div>
  )
}
