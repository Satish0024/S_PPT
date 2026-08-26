import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, Gauge } from 'lucide-react'
import { useParticipant } from '../../context/ParticipantContext.jsx'
import { isNotEligibleUser } from '../../data/participants'
import {
  READINESS_KEY,
  ageFromDob,
  hydratePrefs,
  parseMoney,
  readMap,
  scoreGoal,
  statusCopy
} from '../../lib/retirementGoal'
import { DisclaimerModal, ReadinessChart } from './ReadinessVisuals.jsx'

export default function RetirementGoalSimulator() {
  const { participant } = useParticipant()
  const location = useLocation()
  const [started, setStarted] = useState(() => !!(participant.showSimulator || readMap(READINESS_KEY)[participant.id]))
  const [open, setOpen] = useState(false)
  const [updated, setUpdated] = useState(false)
  const [prefs, setPrefs] = useState(() => hydratePrefs(participant))

  useEffect(() => {
    setStarted(!!(participant.showSimulator || readMap(READINESS_KEY)[participant.id]))
    setPrefs(hydratePrefs(participant))
  }, [participant.id, participant.showSimulator])

  useEffect(() => {
    if (!location.state?.goalSaved) return
    setStarted(true)
    setPrefs(hydratePrefs(participant))
    setUpdated(true)
    const t = window.setTimeout(() => setUpdated(false), 2400)
    return () => window.clearTimeout(t)
  }, [location.state, participant])

  const currentAge = ageFromDob(participant.profile?.dob)
  const balance = parseMoney(participant.overall?.total)
  const result = useMemo(
    () => scoreGoal({ prefs, currentAge, balance }),
    [prefs, currentAge, balance]
  )
  const { score, income, expense, shortfall } = result
  const status = statusCopy(score)
  const excellent = score >= 80
  const tone = excellent ? 'good' : score >= 55 ? 'ok' : 'warn'

  if (isNotEligibleUser(participant)) return null

  return (
    <section className={`rr-card${started ? '' : ' fresh'}`} aria-label="Retirement Goal Simulator">
      <div className="rr-head">
        <span className="rr-ico" aria-hidden="true">
          <Gauge size={18} strokeWidth={2.1} />
        </span>
        <div className="rr-copy">
          <span className="rr-tag">Goal Setting</span>
          <h3>Retirement Readiness</h3>
        </div>
      </div>

      {started ? (
        <>
          <ReadinessChart score={score} expense={expense} income={income} shortfall={shortfall} />
          <div className={`rr-status ${tone}`}>
            <div className="rr-status-copy">
              <b>{status.title}</b>
              <span>{status.body}</span>
              {updated && <em>Updated just now</em>}
            </div>
            <Link className="rr-status-go" to="/retirement-goal">
              Adjust your goal
            </Link>
          </div>
        </>
      ) : (
        <div className="rr-intro">
          <p className="rr-lead">
            This estimates how much of your retirement spending your savings may cover, using deferrals, age, and location.
          </p>
          <Link className="rr-cta" to="/retirement-goal">
            Get started
            <ArrowRight size={15} strokeWidth={2.2} />
          </Link>
        </div>
      )}

      <div className="rr-foot">
        *Not guaranteed results · It&apos;s a simulation.{' '}
        <button type="button" className="rr-more" onClick={() => setOpen(true)}>
          Read more
        </button>
      </div>

      {open && <DisclaimerModal onClose={() => setOpen(false)} />}
    </section>
  )
}
