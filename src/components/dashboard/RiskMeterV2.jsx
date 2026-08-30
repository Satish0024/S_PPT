import { useEffect, useState } from 'react'
import { useParticipant } from '../../context/ParticipantContext.jsx'
import { isNotEligibleUser } from '../../data/participants'
import { RISK_PROFILE_UPDATED_EVENT, getRiskLevel, getRiskProfileId } from '../../lib/riskProfile'

// Deterministic per-angle radius variation. Every contour reuses the same
// profile, so the rings nest cleanly instead of crossing — that nesting is
// what makes the set read as elevation rather than as scattered ovals
// (which is exactly how the previous hand-placed paths came across).
const CONTOUR_PROFILE = [
  1.0, 1.07, 1.12, 1.09, 1.0, 0.93, 0.9, 0.94, 1.02, 1.1, 1.14, 1.11,
  1.03, 0.95, 0.9, 0.92, 0.98, 1.05, 1.1, 1.08, 1.01, 0.95, 0.92, 0.96
]

// Smooth closed path through the sampled points, using midpoint anchors
// and quadratic segments so the curve has no visible corners.
function contourPath(cx, cy, radius, squash) {
  const n = CONTOUR_PROFILE.length
  const pts = CONTOUR_PROFILE.map((mult, i) => {
    const a = (i / n) * Math.PI * 2
    return [cx + Math.cos(a) * radius * mult, cy + Math.sin(a) * radius * mult * squash]
  })
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]
  const f = (v) => Math.round(v * 10) / 10
  const startPt = mid(pts[n - 1], pts[0])
  let d = `M${f(startPt[0])} ${f(startPt[1])}`
  for (let i = 0; i < n; i++) {
    const cur = pts[i]
    const nxt = pts[(i + 1) % n]
    const m = mid(cur, nxt)
    d += ` Q${f(cur[0])} ${f(cur[1])} ${f(m[0])} ${f(m[1])}`
  }
  return `${d} Z`
}

// Purely decorative topographic contour field: one organic profile drawn
// at six nested scales, plus a few generative nodes (one emphasised).
// Deliberately not a chart — no axis, no connecting lines, and nothing
// here changes with the measured level. aria-hidden — the level itself is
// stated as real text (title, badge, description) on the card.
function TopographicField() {
  const CX = 118
  const CY = 92
  const rings = [16, 28, 41, 55, 70, 86, 103]
  return (
    <svg className="risk3-field" viewBox="0 0 220 190" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      <g fill="none" stroke="var(--inv-pattern)" strokeWidth="1">
        {rings.map((r, i) => (
          <path
            key={r}
            d={contourPath(CX, CY, r, 0.82)}
            opacity={(0.95 - i * 0.1).toFixed(2)}
          />
        ))}
      </g>
      <g>
        <circle cx={CX} cy={CY} r="4.6" fill="var(--inv-node)" className="risk3-node" style={{ '--node-op': 0.95 }} />
        <circle cx="152" cy="66" r="2.4" fill="var(--inv-node)" className="risk3-node" style={{ '--node-op': 0.45 }} />
        <circle cx="80" cy="118" r="2.1" fill="var(--inv-node)" className="risk3-node" style={{ '--node-op': 0.38 }} />
        <circle cx="168" cy="128" r="1.8" fill="var(--inv-node)" className="risk3-node" style={{ '--node-op': 0.32 }} />
        <circle cx="72" cy="52" r="1.7" fill="var(--inv-node)" className="risk3-node" style={{ '--node-op': 0.28 }} />
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
