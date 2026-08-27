import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Bookmark, ChevronRight, Plus, TrendingUp } from 'lucide-react'
import { useParticipant } from '../../context/ParticipantContext.jsx'
import { isNotEligibleUser } from '../../data/participants'
import {
  READINESS_KEY,
  ageFromDob,
  hydratePrefs,
  money,
  parseMoney,
  readMap,
  scoreGoal,
  statusCopy
} from '../../lib/retirementGoal'
import { DisclaimerModal } from './ReadinessVisuals.jsx'
import ReadinessSceneV2 from './ReadinessSceneV2.jsx'

// Version 2 of the Retirement Readiness dashboard widget — same data and
// CTAs as the original (src/components/dashboard/RetirementGoalSimulator.jsx),
// laid out per the updated design (hero % + animated scene, horizontal
// metric row, status banner) instead of the donut chart.
export default function RetirementGoalSimulatorV2() {
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
  const tone = score >= 80 ? 'good' : score >= 55 ? 'ok' : 'warn'

  if (isNotEligibleUser(participant)) return null

  return (
    <section className="rr2-card" aria-label="Retirement Goal Simulator">
      <div className="rr2-head">
        <span className="rr2-ico" aria-hidden="true">
          <Bookmark size={20} strokeWidth={2.1} />
        </span>
        <div className="rr2-copy">
          <span className="rr2-tag">Goal Setting</span>
          <h3>Retirement Readiness</h3>
        </div>
      </div>

      {started ? (
        <>
          <div className="rr2-hero">
            <div className="rr2-hero-copy">
              <b>{Math.round(score)}%</b>
              <span>Goal reached</span>
              {updated && <em>Updated just now</em>}
            </div>
            <ReadinessSceneV2 />
          </div>

          <div className="rr2-metrics">
            <div className="rr2-metric">
              <span className="rr2-metric-ico expense" aria-hidden="true">
                <TrendingUp size={12} strokeWidth={2.4} />
              </span>
              <span className="rr2-metric-copy">
                <small>Expected expense</small>
                <b>{money(expense)}</b>
              </span>
            </div>
            <span className="rr2-metric-div" aria-hidden="true" />
            <div className="rr2-metric">
              <span className="rr2-metric-ico income" aria-hidden="true">
                <Plus size={12} strokeWidth={2.4} />
              </span>
              <span className="rr2-metric-copy">
                <small>All income</small>
                <b className="income">{money(income)}</b>
              </span>
            </div>
            <span className="rr2-metric-div" aria-hidden="true" />
            <div className="rr2-metric">
              <span className="rr2-metric-ico shortfall" aria-hidden="true">
                <AlertTriangle size={12} strokeWidth={2.4} />
              </span>
              <span className="rr2-metric-copy">
                <small>Shortfall</small>
                <b className="shortfall">{money(shortfall)}</b>
              </span>
            </div>
          </div>

          <Link className={`rr2-status ${tone}`} to="/retirement-goal">
            <span className="rr2-status-check" aria-hidden="true">
              <svg viewBox="0 0 10 8" fill="none">
                <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="rr2-status-copy">
              <b>{status.title}</b> {status.body}
            </span>
            <ChevronRight size={16} strokeWidth={2.2} className="rr2-status-go" />
          </Link>
        </>
      ) : (
        <>
          <div className="rr2-hero rr2-hero-intro">
            <div className="rr2-hero-copy">
              <p className="rr2-lead">
                This estimates how much of your retirement spending is covered by your savings, by using deferrals, age,
                and location.
              </p>
              <Link className="rr2-cta" to="/retirement-goal">
                Get started
                <ArrowRight size={15} strokeWidth={2.2} />
              </Link>
            </div>
            <ReadinessSceneV2 idle />
          </div>
        </>
      )}

      <div className="rr2-foot">
        <span>*Not guaranteed results · It&apos;s a simulation.</span>{' '}
        <button type="button" className="rr2-disclaimer-link" onClick={() => setOpen(true)}>
          Disclaimer
        </button>
      </div>

      {open && <DisclaimerModal onClose={() => setOpen(false)} />}
    </section>
  )
}
