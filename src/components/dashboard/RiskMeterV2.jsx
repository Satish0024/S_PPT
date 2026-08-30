import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { useParticipant } from '../../context/ParticipantContext.jsx'
import { isNotEligibleUser } from '../../data/participants'
import { RISK_LEVELS, RISK_PROFILE_UPDATED_EVENT, getRiskLevel, getRiskProfileId } from '../../lib/riskProfile'

// This is an abstract visual language for risk, not a data chart: a field
// of dots with varying opacity/size, and one highlighted row standing in
// for the measured level. Purely decorative — the level is stated as real
// text (title, badge, description) regardless of this rendering.
function RiskField({ activeIndex, total }) {
  const rows = 5
  const cols = 6
  const cells = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const onPath = r === activeIndex + 1
      const cx = 24 + c * 22
      const cy = 14 + r * 22
      const base = onPath ? 0.85 : 0.16 + ((r + c) % 3) * 0.06
      cells.push(
        <circle
          key={`${r}-${c}`}
          cx={cx}
          cy={cy}
          r={onPath ? 4.2 : 2.6 + ((r + c) % 2) * 0.8}
          fill={onPath ? '#0f7f6c' : '#2e8f7d'}
          opacity={base}
        />
      )
    }
  }
  return (
    <svg className="risk3-field" viewBox="0 0 160 110" preserveAspectRatio="xMaxYMid meet" aria-hidden="true" focusable="false">
      {cells}
    </svg>
  )
}

// Investment Style sidebar widget: a typography-led risk identity card.
// No gauge, meter, or chart — the level name is the dominant visual,
// paired with a named badge and a labelled dot field for texture only.
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

  return (
    <section className="risk3" aria-label="Investment Style">
      <RiskField activeIndex={activeIndex} total={RISK_LEVELS.length} />
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

        <Link to="/risk-check-in" className="risk3-btn">
          <Pencil size={13} strokeWidth={2.3} aria-hidden="true" />
          Edit Preferences
        </Link>
      </div>
    </section>
  )
}
