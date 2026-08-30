import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, CircleAlert, CircleCheck, Info, SlidersHorizontal, TrendingUp } from 'lucide-react'
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

// The status icon changes with the tone as well as the color, so the state
// is never communicated by color alone (a11y requirement).
const TONE_ICON = { good: CircleCheck, ok: CircleCheck, warn: CircleAlert }

// Purely decorative: faint concentric rings + a couple of floating dots
// behind the score. aria-hidden, and the score itself is real text next to
// this, so nothing here is required to read the widget.
function OrbitRings() {
  return (
    <svg className="rgs-orbit-rings" viewBox="0 0 128 128" aria-hidden="true" focusable="false">
      <circle cx="64" cy="64" r="62" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1" />
      <circle cx="64" cy="64" r="50" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="1" />
      <path d="M64 6 A58 58 0 0 1 118 52" fill="none" stroke="#8fa0ff" strokeWidth="2" strokeLinecap="round" opacity=".55" />
      <path d="M14 78 A58 58 0 0 0 46 121" fill="none" stroke="#7be6c8" strokeWidth="2" strokeLinecap="round" opacity=".45" />
      <circle cx="118" cy="52" r="2.5" fill="#8fa0ff" opacity=".8" />
      <circle cx="12" cy="70" r="2" fill="#7be6c8" opacity=".7" />
      <circle cx="100" cy="112" r="1.6" fill="#fff" opacity=".5" />
    </svg>
  )
}

function DecorLayers() {
  return (
    <>
      <span className="rgs-noise" aria-hidden="true" />
      <svg className="rgs-wave" viewBox="0 0 360 300" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path
          d="M-10 220 C 70 190, 130 260, 210 210 S 340 150, 380 190"
          fill="none"
          stroke="rgba(143,160,255,.18)"
          strokeWidth="1.5"
        />
        <path
          d="M-10 260 C 60 250, 140 300, 220 250 S 330 210, 380 240"
          fill="none"
          stroke="rgba(123,230,200,.14)"
          strokeWidth="1.5"
        />
      </svg>
    </>
  )
}

// Retirement Goal Simulator sidebar widget: a premium dark glass panel
// where the goal percentage is set as large real text (not a chart), a
// translucent snapshot lists expense/income/shortfall, and a status panel
// reads as a confirmation state rather than an alert.
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
  const pct = Math.max(0, Math.min(100, Math.round(score)))

  if (isNotEligibleUser(participant)) return null

  return (
    <section className="rgs" aria-label="Retirement Goal Simulator">
      <DecorLayers />
      <div className="rgs-body">
        <header className="rgs-head">
          <div className="rgs-head-copy">
            <span className="rgs-eyebrow">Retirement Goal Simulator</span>
            <h3>See how your inputs affect your savings, income, risk.</h3>
          </div>
          <Link className="rgs-head-act" to="/retirement-goal" aria-label="Adjust your retirement goal">
            <SlidersHorizontal size={15} strokeWidth={2.2} aria-hidden="true" />
          </Link>
        </header>

        {started ? (
          <>
            <div className="rgs-main">
              <div className="rgs-orbit" role="img" aria-label={`${pct}% of your retirement goal`}>
                <OrbitRings />
                <div className="rgs-orbit-value">
                  <b>{pct}%</b>
                  <span>of your goal</span>
                </div>
              </div>

              <dl className="rgs-snap">
                <div className="rgs-snap-row expense">
                  <dt className="rgs-snap-label">Expected expense</dt>
                  <dd>
                    <b>{money(expense)}</b>
                  </dd>
                </div>
                <div className="rgs-snap-div" aria-hidden="true" />
                <div className="rgs-snap-row income">
                  <dt className="rgs-snap-label">
                    <TrendingUp size={12} strokeWidth={2.4} aria-hidden="true" />
                    All income
                  </dt>
                  <dd>
                    <b>{money(income)}</b>
                  </dd>
                </div>
                <div className="rgs-snap-row shortfall">
                  <dt className="rgs-snap-label">
                    <span className="rgs-dot" aria-hidden="true" />
                    Short fall
                  </dt>
                  <dd>
                    <b>{money(shortfall)}</b>
                  </dd>
                </div>
              </dl>
            </div>

            <div className={`rgs-status ${tone}`}>
              <span className="rgs-status-ico" aria-hidden="true">
                <StatusIcon size={17} strokeWidth={2.3} />
              </span>
              <span className="rgs-status-copy">
                <b>{status.title}</b>
                <span>{status.body}</span>
              </span>
            </div>
          </>
        ) : (
          <div className="rgs-intro">
            <p>
              This estimates how much of your retirement spending is covered by your savings, using your deferrals,
              age, and location.
            </p>
            <Link className="rgs-cta" to="/retirement-goal">
              Get started
              <ArrowRight size={14} strokeWidth={2.2} aria-hidden="true" />
            </Link>
          </div>
        )}

        <p className="rgs-foot">
          <span className="rgs-foot-note">
            <Info size={13} strokeWidth={2.2} aria-hidden="true" />
            Not guaranteed results. It&apos;s a simulation.
          </span>
          <button type="button" className="rgs-foot-link" onClick={() => setOpen(true)}>
            Read more
            <ArrowRight size={12} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </p>
      </div>

      {open && <DisclaimerModal onClose={() => setOpen(false)} />}
    </section>
  )
}
