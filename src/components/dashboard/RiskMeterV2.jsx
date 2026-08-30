import { useEffect, useState } from 'react'
import { useParticipant } from '../../context/ParticipantContext.jsx'
import { isNotEligibleUser } from '../../data/participants'
import { RISK_PROFILE_UPDATED_EVENT, getRiskLevel, getRiskProfileId } from '../../lib/riskProfile'

// Investment Style sidebar widget: a typography-led risk identity card.
// No gauge, meter, or chart — the level name is the dominant visual,
// paired with a named badge and the supplied shield-and-coins
// illustration (public/investment-illustration.png) as the card's art.
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
  const shortName = level.subtitle.replace(' risk', '')

  return (
    <section className="risk3" aria-label="Investment Style">
      <img className="risk3-field" src="/investment-illustration.png" alt="" aria-hidden="true" />
      <div className="risk3-body">
        <header className="risk3-head">
          <h3>Investment Style</h3>
          <span className="risk3-badge">{level.label}</span>
        </header>

        <p className="risk3-title">{shortName.toUpperCase()}</p>

        <p className="risk3-desc">
          The illustrated Risk Level was generated based on the answers you provided to the questionnaire.
        </p>
        <p className="risk3-desc">
          If you don&apos;t think this investment style accurately represents you, you can return to the
          questionnaire and update your answers.
        </p>
      </div>
    </section>
  )
}
