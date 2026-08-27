import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ShieldCheck } from 'lucide-react'
import { useParticipant } from '../../context/ParticipantContext.jsx'
import { isNotEligibleUser } from '../../data/participants'
import { RISK_PROFILE_UPDATED_EVENT, getRiskLevel, getRiskProfileId } from '../../lib/riskProfile'
import RiskCairnIllustration from './RiskCairnIllustration.jsx'

export default function RiskMeterV2() {
  const { participant } = useParticipant()
  const [levelId, setLevelId] = useState(() => getRiskProfileId(participant))
  const [insightIndex, setInsightIndex] = useState(0)

  // Stay in sync even when the questionnaire is completed elsewhere (e.g.
  // the sidebar's "Risk check-in" page).
  useEffect(() => {
    const onUpdate = (e) => {
      if (e.detail?.participantId === participant.id) {
        setLevelId(e.detail.levelId)
        setInsightIndex(0)
      }
    }
    window.addEventListener(RISK_PROFILE_UPDATED_EVENT, onUpdate)
    return () => window.removeEventListener(RISK_PROFILE_UPDATED_EVENT, onUpdate)
  }, [participant.id])

  if (isNotEligibleUser(participant)) return null

  const level = getRiskLevel(levelId)

  return (
    <section className="risk-card" aria-label="Investment risk profile">
      <div className="risk-head">
        <span className="risk-ico" aria-hidden="true">
          <ShieldCheck size={18} strokeWidth={2.1} />
        </span>
        <div className="risk-copy">
          <span className="risk-tag">Risk Level</span>
          <h3>{level.label}</h3>
        </div>
      </div>

      <div className="risk2-panel">
        <div className="risk2-top">
          <RiskCairnIllustration levelId={level.id} color={level.color} />

          <div className="risk2-info">
            <b key={level.id} className="risk2-subtitle" style={{ color: level.color }}>
              {level.subtitle}
            </b>
            <p key={`${level.id}-${insightIndex}`} className="risk2-insight">
              {level.insights[insightIndex]}
            </p>
            <div className="risk2-dots" role="tablist" aria-label="More about this risk style">
              {level.insights.map((insight, i) => (
                <button
                  key={insight}
                  type="button"
                  role="tab"
                  aria-selected={i === insightIndex}
                  aria-label={`Insight ${i + 1}`}
                  className={`risk2-dot${i === insightIndex ? ' on' : ''}`}
                  style={i === insightIndex ? { background: level.color } : undefined}
                  onClick={() => setInsightIndex(i)}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="risk2-caption">This style matches your answers and retirement goals.</p>

        <Link to="/risk-check-in" className="risk2-edit-btn">
          <Sparkles size={15} strokeWidth={2.2} />
          Edit Preferences
        </Link>
      </div>
    </section>
  )
}
