import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ShieldCheck } from 'lucide-react'
import { useParticipant } from '../../context/ParticipantContext.jsx'
import { isNotEligibleUser } from '../../data/participants'
import { RISK_LEVELS, RISK_PROFILE_UPDATED_EVENT, getRiskLevel, getRiskProfileId } from '../../lib/riskProfile'

export default function RiskMeterV2() {
  const { participant } = useParticipant()
  const [levelId, setLevelId] = useState(() => getRiskProfileId(participant))

  // Stay in sync even when the questionnaire is completed elsewhere (e.g.
  // the sidebar's "Risk check-in" page).
  useEffect(() => {
    const onUpdate = (e) => {
      if (e.detail?.participantId === participant.id) {
        setLevelId(e.detail.levelId)
      }
    }
    window.addEventListener(RISK_PROFILE_UPDATED_EVENT, onUpdate)
    return () => window.removeEventListener(RISK_PROFILE_UPDATED_EVENT, onUpdate)
  }, [participant.id])

  if (isNotEligibleUser(participant)) return null

  const level = getRiskLevel(levelId)
  const activeIndex = RISK_LEVELS.findIndex((l) => l.id === level.id)

  return (
    <section className="risk3" aria-label="Investment risk profile" style={{ '--risk-color': level.color }}>
      <header className="risk3-head">
        <span className="risk3-ico" aria-hidden="true">
          <ShieldCheck size={16} strokeWidth={2.2} />
        </span>
        <span className="risk3-tag">Risk level</span>
      </header>

      <h3 className="risk3-title">{level.label}</h3>

      {/* Segmented gauge: one bar per risk level, filled up to the
          participant's own. Reads as a scale at a glance and stays legible
          in a narrow column, unlike the old illustration-beside-text row. */}
      <div
        className="risk3-gauge"
        role="img"
        aria-label={`${level.subtitle}: level ${activeIndex + 1} of ${RISK_LEVELS.length}`}
      >
        {RISK_LEVELS.map((l, i) => (
          <span key={l.id} className={`risk3-seg${i <= activeIndex ? ' on' : ''}`} />
        ))}
      </div>
      <div className="risk3-scale" aria-hidden="true">
        <span>Lower risk</span>
        <span>Higher risk</span>
      </div>

      <Link to="/risk-check-in" className="risk3-btn">
        <Sparkles size={14} strokeWidth={2.2} aria-hidden="true" />
        Edit preferences
      </Link>
    </section>
  )
}
