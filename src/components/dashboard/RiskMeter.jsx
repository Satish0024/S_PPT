import { useState } from 'react'
import { Rocket, Scale, ShieldCheck, Sparkles } from 'lucide-react'
import { useParticipant } from '../../context/ParticipantContext.jsx'
import { isNotEligibleUser } from '../../data/participants'
import { RISK_LEVELS, getRiskLevel, getRiskProfileId, setRiskProfileId } from '../../lib/riskProfile'

const LEVEL_ICON = { conservative: ShieldCheck, moderate: Scale, aggressive: Rocket }

export default function RiskMeter() {
  const { participant } = useParticipant()
  const [levelId, setLevelId] = useState(() => getRiskProfileId(participant))
  const [editing, setEditing] = useState(false)

  if (isNotEligibleUser(participant)) return null

  const level = getRiskLevel(levelId)
  const Icon = LEVEL_ICON[level.id]
  // Map the 0-100 score to a -90..90deg rotation around the gauge center so
  // the marker sits on the arc: 0 = far left (conservative), 100 = far
  // right (aggressive).
  const angle = (level.score / 100) * 180 - 90

  const choose = (id) => {
    setLevelId(id)
    setRiskProfileId(participant.id, id)
    setEditing(false)
  }

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

      <div className="risk-body">
        <div className="risk-gauge-wrap">
          <svg className="risk-gauge" viewBox="0 0 200 115" role="img" aria-label={`${level.badge} risk level`}>
            <defs>
              <linearGradient id="risk-arc" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1a9d63" />
                <stop offset="50%" stopColor="#d4a017" />
                <stop offset="100%" stopColor="#c0392b" />
              </linearGradient>
            </defs>
            <path d="M10 100A90 90 0 0 1 190 100" fill="none" stroke="url(#risk-arc)" strokeWidth="14" strokeLinecap="round" />
            <g className="risk-marker" style={{ transform: `rotate(${angle}deg)` }}>
              <circle cx="100" cy="14" r="9" fill="#fff" stroke={level.color} strokeWidth="4" />
            </g>
          </svg>
          <div className="risk-center">
            <span key={level.id} className="risk-center-ico" style={{ color: level.color }}>
              <Icon size={30} strokeWidth={2} />
            </span>
            <b style={{ color: level.color }}>{level.badge}</b>
            <span>Your risk level</span>
          </div>
        </div>

        <div className="risk-side">
          {!editing ? (
            <>
              <p>{level.copy}</p>
              <p className="risk-hint">Want to change it? You can go back and update your answers.</p>
              <button type="button" className="risk-edit-btn" onClick={() => setEditing(true)}>
                <Sparkles size={15} strokeWidth={2.2} />
                Edit Preferences
              </button>
            </>
          ) : (
            <div className="risk-picker">
              <span className="risk-picker-label">Choose a risk level</span>
              {RISK_LEVELS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  className={`risk-picker-opt${l.id === level.id ? ' on' : ''}`}
                  onClick={() => choose(l.id)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
