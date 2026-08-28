import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, CircleCheck, DollarSign, Info, Lightbulb, Star, TrendingDown, TrendingUp, Trophy, Wallet } from 'lucide-react'
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

function ScoreGauge({ score }) {
  const pct = Math.max(0, Math.min(100, score))
  const dash = (pct / 100) * CIRC
  return (
    <div className="rsc-gauge" role="img" aria-label={`Readiness score ${Math.round(pct)} out of 100`}>
      <svg viewBox="0 0 100 100">
        <circle className="rsc-gauge-track" cx="50" cy="50" r={R} strokeWidth="8" />
        <circle className="rsc-gauge-fill" cx="50" cy="50" r={R} strokeWidth="8" strokeDasharray={`${dash} ${CIRC}`} />
      </svg>
      <div className="rsc-gauge-mid">
        <span className="rsc-gauge-star" aria-hidden="true">
          <Star size={13} strokeWidth={2.2} />
        </span>
        <b>{Math.round(pct)}</b>
        <span className="rsc-gauge-caption">Readiness Score</span>
      </div>
    </div>
  )
}

// Decorative summit-and-flag graphic in the card header, matching the
// reference design. Purely ornamental (aria-hidden) and themed off the
// brand token so it re-colors with the app instead of needing an asset.
function SummitMark() {
  return (
    <svg className="rsc-summit" viewBox="0 0 120 90" aria-hidden="true">
      <path d="M0 90 40 30 60 55 78 20 120 90Z" fill="var(--brand)" opacity="0.1" />
      <path d="M40 30 60 55 78 20 96 46" fill="none" stroke="var(--brand)" strokeWidth="1.4" strokeDasharray="2 3" opacity="0.5" />
      <circle cx="40" cy="30" r="2.6" fill="var(--brand)" opacity="0.6" />
      <line x1="78" y1="20" x2="78" y2="4" stroke="var(--brand)" strokeWidth="1.6" />
      <path d="M78 4h13l-13 8Z" fill="var(--brand)" />
    </svg>
  )
}

// Retirement Goal Simulator sidebar widget — reproduces the reference
// design's gauge (with star badge), itemized income/shortfall breakdown
// with dot-connector rows, and stacked trophy/bulb tip banner, scaled to
// the dashboard sidebar column.
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

  if (isNotEligibleUser(participant)) return null

  return (
    <section className="rsc-card" aria-label="Retirement Goal Simulator">
      <header className="rsc-head">
        <span className="rsc-head-ico" aria-hidden="true">
          <TrendingUp size={19} strokeWidth={2.2} />
        </span>
        <div>
          <h3>Retirement Goal Simulator</h3>
          <p>See how your inputs affect your savings, income, risk.</p>
        </div>
        <SummitMark />
      </header>

      {started ? (
        <>
          <Link className="rsc-gauge-panel" to="/retirement-goal" aria-label="Adjust your retirement goal">
            <ScoreGauge score={score} />
            <span className={`rsc-badge ${tone}`}>
              <CircleCheck size={12} strokeWidth={2.4} />
              {status.title}
            </span>
            <p className="rsc-gauge-note">{status.body}</p>
          </Link>

          <div className="rsc-right">
            <div className="rsc-row plain">
              <span className="rsc-row-ico expense" aria-hidden="true">
                <Wallet size={13} strokeWidth={2.2} />
              </span>
              <span className="rsc-row-label">Expected expense</span>
              <b>{money(expense)}</b>
            </div>
            <div className="rsc-row connector">
              <span className="rsc-row-ico income" aria-hidden="true">
                <DollarSign size={13} strokeWidth={2.4} />
              </span>
              <span className="rsc-row-label">
                All income
                <small>Monthly</small>
              </span>
              <b className="income">{money(income)}</b>
            </div>
            <div className="rsc-row">
              <span className="rsc-row-ico shortfall" aria-hidden="true">
                <TrendingDown size={13} strokeWidth={2.4} />
              </span>
              <span className="rsc-row-label">
                Short fall
                <small>Monthly</small>
              </span>
              <b className="shortfall">{money(shortfall)}</b>
            </div>
          </div>

          <div className={`rsc-tips ${tone}`}>
            <div className="rsc-tip">
              <span className="rsc-tip-ico trophy" aria-hidden="true">
                <Trophy size={18} strokeWidth={2} />
              </span>
              <div>
                <b>{status.title}</b>
                <span>{status.body}</span>
              </div>
            </div>
            <div className="rsc-tip">
              <span className="rsc-tip-ico bulb" aria-hidden="true">
                <Lightbulb size={15} strokeWidth={2} />
              </span>
              <div>
                <b>Keep it up!</b>
                <span>Review your plan periodically and adjust it to stay on track.</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="rsc-intro">
          <p>
            This estimates how much of your retirement spending is covered by your savings, by using deferrals, age,
            and location.
          </p>
          <Link className="rsc-cta" to="/retirement-goal">
            Get started
            <ArrowRight size={14} strokeWidth={2.2} aria-hidden="true" />
          </Link>
        </div>
      )}

      <p className="rsc-foot">
        <Info size={13} strokeWidth={2.2} aria-hidden="true" />
        <span>
          <b>*Not guaranteed results</b> It&apos;s a simulation. For more details
        </span>
        <button type="button" className="rsc-foot-link" onClick={() => setOpen(true)}>
          Read more
          <ArrowRight size={12} strokeWidth={2.4} />
        </button>
      </p>

      {open && <DisclaimerModal onClose={() => setOpen(false)} />}
    </section>
  )
}
