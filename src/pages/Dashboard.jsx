import { useParticipant } from '../context/ParticipantContext.jsx'
import { isNotEligibleUser } from '../data/participants'
import OverallBalance from '../components/dashboard/OverallBalance.jsx'
import PlanCard from '../components/dashboard/PlanCard.jsx'
import QuickLinks from '../components/dashboard/QuickLinks.jsx'
import Transactions from '../components/dashboard/Transactions.jsx'
import RetirementGoalSimulator from '../components/dashboard/RetirementGoalSimulator.jsx'
import LearningPortal from '../components/dashboard/LearningPortal.jsx'

export default function Dashboard() {
  const { participant } = useParticipant()
  const first = participant.name.split(' ')[0]
  const showReadiness = !isNotEligibleUser(participant)

  return (
    <div className="page-body">
      <div className="hi-bar">
        <h1>Hi {first} 👋</h1>
      </div>
      <div className="dash-layout">
        <div className="dash-main">
          <OverallBalance {...participant.overall} />
          <section>
            <h2 className="section-title">Your Plans</h2>
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
          {showReadiness && <RetirementGoalSimulator />}
          <LearningPortal />
        </aside>
      </div>
    </div>
  )
}
