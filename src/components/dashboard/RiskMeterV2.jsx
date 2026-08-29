import { useEffect, useState } from 'react'
import { RefreshCw, User } from 'lucide-react'
import { useParticipant } from '../../context/ParticipantContext.jsx'
import { isNotEligibleUser } from '../../data/participants'
import { RISK_LEVELS, RISK_PROFILE_UPDATED_EVENT, getRiskLevel, getRiskProfileId } from '../../lib/riskProfile'

// Decorative stacked-stones-and-leaf illustration, matching the reference
// design. Themed off the participant's own risk color (set as --risk-color
// on the card) so it re-colors per level/theme instead of needing a raster
// asset swap.
function StonesMark() {
  return (
    <svg className="risk3-stones" viewBox="0 0 120 110" role="img" aria-hidden="true">
      <circle cx="60" cy="66" r="46" fill="var(--risk-color, var(--brand))" opacity="0.08" />
      <path d="M78 60c10 4 16 10 14 22-8 6-24 6-30-2 4-8 8-16 16-20Z" fill="var(--green)" opacity="0.75" />
      <path d="M84 62c4 8 6 16 4 22" stroke="var(--green)" strokeWidth="1.4" fill="none" opacity="0.5" />
      <ellipse cx="60" cy="96" rx="30" ry="5" fill="var(--risk-color, var(--brand))" opacity="0.12" />
      <ellipse cx="60" cy="82" rx="27" ry="17" fill="var(--risk-color, var(--brand))" />
      <ellipse cx="60" cy="55" rx="21" ry="13.5" fill="var(--risk-color, var(--brand))" opacity="0.65" />
      <ellipse cx="60" cy="33" rx="15" ry="10" fill="var(--panel)" stroke="var(--line-strong)" strokeWidth="1" />
    </svg>
  )
}

// Risk profile sidebar widget — reproduces the reference design: a risk
// level headline with a single gradient progress bar, an "X Investor" pill,
// a decorative stones-and-leaf graphic, a short outlook line, and a footer
// note, scaled to the dashboard sidebar column instead of the wide
// reference layout. No "Edit preferences" CTA, per feedback.
export default function RiskMeterV2() {
  const { participant } = useParticipant()
  const [levelId, setLevelId] = useState(() => getRiskProfileId(participant))

  // Stay in sync even when the questionnaire is completed elsewhere (e.g.
  // the sidebar's "Risk check-in" page).
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
  const fillPct = ((activeIndex + 1) / RISK_LEVELS.length) * 100

  return (
    <section className="risk3" aria-label="Investment risk profile" style={{ '--risk-color': level.color }}>
      <span className="risk3-tag">Your Risk Level</span>
      <h3 className="risk3-title">{level.subtitle.replace(' risk', '')}</h3>

      <div
        className="risk3-gauge"
        role="img"
        aria-label={`${level.subtitle}: level ${activeIndex + 1} of ${RISK_LEVELS.length}`}
      >
        <span className="risk3-gauge-fill" style={{ width: `${fillPct}%` }} />
      </div>

      <span className="risk3-pill">
        <User size={13} strokeWidth={2.2} aria-hidden="true" />
        {level.label}
      </span>

      <StonesMark />

      <p className="risk3-outlook">{level.outlook}</p>

      <div className="risk3-foot">
        <span className="risk3-foot-ico" aria-hidden="true">
          <RefreshCw size={14} strokeWidth={2.2} />
        </span>
        <span className="risk3-foot-copy">We picked this investment style based on your questionnaire.</span>
      </div>
    </section>
  )
}
