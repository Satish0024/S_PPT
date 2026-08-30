import { useEffect, useState } from 'react'
import { useParticipant } from '../../context/ParticipantContext.jsx'
import { isNotEligibleUser } from '../../data/participants'
import { RISK_PROFILE_UPDATED_EVENT, getRiskLevel, getRiskProfileId } from '../../lib/riskProfile'

// Purely decorative topographic contour field: irregular, overlapping
// closed paths standing in for elevation lines, plus a handful of
// generative nodes (one emphasised). This is deliberately not a chart or a
// progress visualization — no axis, no straight connecting lines, nothing
// here changes with the measured level. aria-hidden — the level itself is
// stated as real text (title, badge, description) elsewhere on the card.
function TopographicField() {
  return (
    <svg className="risk3-field" viewBox="0 0 220 190" preserveAspectRatio="xMaxYMid meet" aria-hidden="true" focusable="false">
      <g fill="none" stroke="var(--inv-pattern)" strokeWidth="1">
        <path d="M40 20 C 90 4, 150 10, 190 42 C 210 62, 206 96, 178 112 C 148 130, 96 128, 62 104 C 34 84, 22 46, 40 20 Z" opacity=".5" />
        <path d="M56 34 C 96 22, 144 26, 172 50 C 188 64, 184 88, 162 100 C 138 114, 100 112, 76 94 C 54 78, 44 52, 56 34 Z" opacity=".55" />
        <path d="M74 48 C 104 40, 136 44, 154 60 C 164 70, 160 86, 144 94 C 126 102, 102 100, 88 88 C 74 76, 66 60, 74 48 Z" opacity=".6" />
        <path d="M30 110 C 60 100, 96 106, 112 128 C 122 142, 112 160, 92 164 C 68 168, 40 156, 30 138 C 22 126, 22 116, 30 110 Z" opacity=".4" />
        <path d="M120 132 C 148 122, 182 128, 198 148 C 206 158, 198 172, 180 176 C 158 180, 132 172, 122 156 C 116 146, 114 138, 120 132 Z" opacity=".35" />
      </g>
      <g>
        <circle cx="118" cy="72" r="4.5" fill="var(--inv-node)" className="risk3-node" style={{ '--node-op': 0.9 }} />
        <circle cx="150" cy="60" r="2.4" fill="var(--inv-node)" className="risk3-node" style={{ '--node-op': 0.45 }} />
        <circle cx="82" cy="88" r="2" fill="var(--inv-node)" className="risk3-node" style={{ '--node-op': 0.35 }} />
        <circle cx="176" cy="96" r="2.6" fill="var(--inv-node)" className="risk3-node" style={{ '--node-op': 0.4 }} />
        <circle cx="64" cy="132" r="2.2" fill="var(--inv-node)" className="risk3-node" style={{ '--node-op': 0.3 }} />
        <circle cx="158" cy="150" r="2" fill="var(--inv-node)" className="risk3-node" style={{ '--node-op': 0.3 }} />
        <circle cx="198" cy="70" r="1.6" fill="var(--inv-node)" className="risk3-node" style={{ '--node-op': 0.25 }} />
      </g>
    </svg>
  )
}

// Investment Style sidebar widget: a typography-led risk identity card.
// No gauge, meter, or chart — the level name is the dominant visual,
// paired with a named badge and a topographic field for texture only.
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
      <TopographicField />
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
