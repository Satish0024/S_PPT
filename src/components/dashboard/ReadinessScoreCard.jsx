import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowRight,
  CircleAlert,
  CircleCheck,
  Info,
  Landmark,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Wallet
} from 'lucide-react'
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

const R = 42
const CIRC = 2 * Math.PI * R
// The status icon changes with the tone as well as the color, so the state
// is never communicated by color alone (a11y requirement).
const TONE_ICON = { good: CircleCheck, ok: CircleCheck, warn: CircleAlert }

function ScoreGauge({ score, tone }) {
  const pct = Math.max(0, Math.min(100, score))
  const dash = (pct / 100) * CIRC
  return (
    <div className={`rsc-gauge ${tone}`} role="img" aria-label={`Readiness score ${Math.round(pct)} out of 100`}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className="rsc-gauge-track" cx="50" cy="50" r={R} strokeWidth="14" />
        <circle
          className="rsc-gauge-fill"
          cx="50"
          cy="50"
          r={R}
          strokeWidth="14"
          strokeDasharray={`${dash} ${CIRC}`}
        />
      </svg>
      <div className="rsc-gauge-mid">
        <b>{Math.round(pct)}</b>
        <span>out of 100</span>
      </div>
    </div>
  )
}

// Retirement Readiness sidebar widget: a prominent ring gauge paired with a
// status panel, then the three money figures grouped in one bordered list.
// No decorative artwork — nothing competes with the numbers.
export default function ReadinessScoreCard() {
  const { participant } = useParticipant()
  const location = useLocation()
  const [started, setStarted] = useState(() => !!(participant.showSimulator || readMap(READINESS_KEY)[participant.id]))
  const [open, setOpen] = useState(false)
  const [prefs, setPrefs] = useState(() => hydratePrefs(participant))

  useEffect(() => {
    setStarted(!!(participant.showSimulator || readMap(READINESS_KEY)[participant.id]))
    setPrefs(hydratePrefs(participant))
  }, [participant.id, participant.showSimulator])

  useEffect(() => {
    if (!location.state?.goalSaved) return
    setStarted(true)
    setPrefs(hydratePrefs(participant))
  }, [location.state, participant])

  const currentAge = ageFromDob(participant.profile?.dob)
  const balance = parseMoney(participant.overall?.total)
  const { score, income, expense, shortfall } = useMemo(
    () => scoreGoal({ prefs, currentAge, balance }),
    [prefs, currentAge, balance]
  )
  const status = statusCopy(score)
  const tone = score >= 80 ? 'good' : score >= 55 ? 'ok' : 'warn'
  const StatusIcon = TONE_ICON[tone]

  if (isNotEligibleUser(participant)) return null

  return (
    <section className="rsc" aria-label="Retirement Readiness">
      <div className="rsc-body">
        <header className="rsc-head">
          <span className="rsc-head-ico" aria-hidden="true">
            <TrendingUp size={20} strokeWidth={2.2} />
          </span>
          <div className="rsc-head-copy">
            <h3>Retirement Readiness</h3>
            <p>See how your inputs affect your savings, income, risk.</p>
          </div>
          <Link className="rsc-head-act" to="/retirement-goal" aria-label="Adjust your retirement goal">
            <SlidersHorizontal size={16} strokeWidth={2.2} aria-hidden="true" />
          </Link>
        </header>

        {started ? (
          <>
            <div className="rsc-score">
              <ScoreGauge score={score} tone={tone} />
              <div className={`rsc-status ${tone}`}>
                <span className="rsc-status-pill">
                  <StatusIcon size={16} strokeWidth={2.3} aria-hidden="true" />
                  {status.title}
                </span>
                <p>{status.body}</p>
              </div>
            </div>

            {/* Annual figures — scoreGoal returns yearly income/expense, so
                these are labelled per year rather than monthly. */}
            <dl className="rsc-rows">
              <div className="rsc-row">
                <span className="rsc-row-ico" aria-hidden="true">
                  <Wallet size={16} strokeWidth={2.2} />
                </span>
                <dt>
                  Expected expense
                  <small>Per year in retirement</small>
                </dt>
                <dd>{money(expense)}</dd>
              </div>
              <div className="rsc-row">
                <span className="rsc-row-ico income" aria-hidden="true">
                  <Landmark size={16} strokeWidth={2.2} />
                </span>
                <dt>
                  All income
                  <small>Per year</small>
                </dt>
                <dd className="income">{money(income)}</dd>
              </div>
              <div className="rsc-row">
                <span className="rsc-row-ico shortfall" aria-hidden="true">
                  <TrendingDown size={16} strokeWidth={2.2} />
                </span>
                <dt>
                  Shortfall
                  <small>Per year</small>
                </dt>
                <dd className="shortfall">{money(shortfall)}</dd>
              </div>
            </dl>
          </>
        ) : null}
      </div>

      {!started && (
        <div className="rsc-intro">
          <p>
            This estimates how much of your retirement spending is covered by your savings, using your deferrals,
            age, and location.
          </p>
          <Link className="rsc-cta" to="/retirement-goal">
            Get started
            <ArrowRight size={14} strokeWidth={2.2} aria-hidden="true" />
          </Link>
        </div>
      )}

      <p className="rsc-foot">
        <span className="rsc-foot-note">
          <Info size={13} strokeWidth={2.2} aria-hidden="true" />
          Not guaranteed results. It&apos;s a simulation.
        </span>
        <button type="button" className="rsc-foot-link" onClick={() => setOpen(true)}>
          Read more
          <ArrowRight size={12} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </p>

      {open && <DisclaimerModal onClose={() => setOpen(false)} />}
    </section>
  )
}
