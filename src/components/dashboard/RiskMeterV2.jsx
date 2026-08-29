import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Pencil, Shield } from 'lucide-react'
import { useParticipant } from '../../context/ParticipantContext.jsx'
import { isNotEligibleUser } from '../../data/participants'
import { RISK_LEVELS, RISK_PROFILE_UPDATED_EVENT, getRiskLevel, getRiskProfileId } from '../../lib/riskProfile'

// Map each level onto the theme's own status tokens rather than the raw hex
// in riskProfile.js — those hexes are tuned for light mode only, so using
// the tokens keeps the headline and badge readable in dark mode too.
const LEVEL_TOKENS = {
  conservative: { color: 'var(--green)', bg: 'var(--green-bg)' },
  moderate: { color: 'var(--amber)', bg: 'var(--amber-bg)' },
  aggressive: { color: 'var(--red)', bg: 'var(--red-bg)' }
}

// Risk profile sidebar widget. The measured level is stated three ways —
// the headline, an "X Investor" badge, and a checked step on a labelled
// three-stop scale — so it never depends on color alone to read.
export default function RiskMeterV2() {
  const { participant } = useParticipant()
  const [levelId, setLevelId] = useState(() => getRiskProfileId(participant))

  // Stay in sync even when the questionnaire is completed elsewhere (e.g.
  // the enrollment investment-election step).
  useEffect(() => {
    const onUpdate = (e) => {
      if (e.detail?.participantId === participant.id) setLevelId(e.detail.levelId)
    }
    window.addEventListener(RISK_PROFILE_UPDATED_EVENT, onUpdate)
    return () => window.removeEventListener(RISK_PROFILE_UPDATED_EVENT, onUpdate)
  }, [participant.id])

  if (isNotEligibleUser(participant)) return null

  const level = getRiskLevel(levelId)
  const activeIndex = RISK_LEVELS.findIndex((l) => l.id === level.id)
  const shortName = level.subtitle.replace(' risk', '')
  const tokens = LEVEL_TOKENS[level.id] || LEVEL_TOKENS.moderate

  return (
    <section
      className="risk3"
      aria-label="Investment risk profile"
      style={{ '--risk-color': tokens.color, '--risk-bg': tokens.bg }}
    >
      <header className="risk3-head">
        <span className="risk3-head-ico" aria-hidden="true">
          <Shield size={18} strokeWidth={2.2} />
        </span>
        <span className="risk3-tag">Your Risk Level</span>
        <span className="risk3-badge">{level.label}</span>
      </header>

      <h3 className="risk3-title">{shortName}</h3>

      <ol
        className="risk3-scale"
        aria-label={`Risk scale: ${shortName}, level ${activeIndex + 1} of ${RISK_LEVELS.length}`}
      >
        {RISK_LEVELS.map((l, i) => {
          const state = i < activeIndex ? 'done' : i === activeIndex ? 'on' : 'todo'
          return (
            <li key={l.id} className={`risk3-step ${state}`}>
              <span className="risk3-step-bar" aria-hidden="true" />
              <span className="risk3-step-label">
                {i === activeIndex && <Check size={11} strokeWidth={3} aria-hidden="true" />}
                {l.subtitle.replace(' risk', '')}
              </span>
            </li>
          )
        })}
      </ol>

      <p className="risk3-outlook">{level.outlook}</p>

      <div className="risk3-foot">
        <p>We selected this risk level based on your answers. Want to change it? You can go back and update them.</p>
        <Link to="/risk-check-in" className="risk3-btn">
          <Pencil size={14} strokeWidth={2.3} aria-hidden="true" />
          Edit preferences
        </Link>
      </div>
    </section>
  )
}
