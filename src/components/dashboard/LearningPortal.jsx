import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

// Purely decorative botanical line art: a few thin-outline, translucent
// leaf shapes with a soft radial glow and a scatter of dots, kept to the
// right and faded into the background via a CSS mask. aria-hidden — every
// word on the card exists as real text regardless of this rendering.
function BotanicalArt() {
  return (
    <svg className="learn2-field" viewBox="0 0 240 190" preserveAspectRatio="xMaxYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="learn2-glow" cx="72%" cy="30%" r="60%">
          <stop offset="0%" stopColor="var(--learn-pattern-soft)" />
          <stop offset="100%" stopColor="var(--learn-pattern-soft)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="240" height="190" fill="url(#learn2-glow)" />

      {/* Three abstract leaf silhouettes — a central spine with one curved
          lobe each, filled at very low opacity, outlined thin. */}
      <g className="learn2-leaf-drift" stroke="var(--learn-pattern)" strokeWidth="1" fill="var(--learn-pattern-soft)">
        <path d="M188 24 C 214 40, 218 78, 190 100 C 168 78, 168 42, 188 24 Z" />
        <path d="M188 24 L 190 100" fill="none" strokeWidth=".8" opacity=".7" />
      </g>
      <g className="learn2-leaf-drift d2" stroke="var(--learn-pattern)" strokeWidth="1" fill="var(--learn-pattern-soft)" opacity=".8">
        <path d="M150 70 C 182 78, 198 108, 176 138 C 148 128, 132 96, 150 70 Z" />
        <path d="M150 70 L 176 138" fill="none" strokeWidth=".8" opacity=".7" />
      </g>
      <g stroke="var(--learn-pattern)" strokeWidth=".9" fill="var(--learn-pattern-soft)" opacity=".55">
        <path d="M206 100 C 230 112, 236 140, 214 160 C 192 146, 188 116, 206 100 Z" />
      </g>

      <g fill="var(--learn-pattern)">
        <circle cx="222" cy="60" r="2" opacity=".55" />
        <circle cx="204" cy="150" r="1.6" opacity=".4" />
        <circle cx="160" cy="42" r="1.4" opacity=".35" />
        <circle cx="230" cy="120" r="1.8" opacity=".45" />
        <circle cx="140" cy="110" r="1.4" opacity=".3" />
      </g>
    </svg>
  )
}

// Financial Wellness sidebar widget: a light, editorial content-discovery
// card. Typography carries the hierarchy, botanical line art provides
// texture on the right without becoming the focal point.
export default function LearningPortal() {
  return (
    <section className="learn2" aria-label="Financial Wellness">
      <BotanicalArt />
      <div className="learn2-body">
        <span className="learn2-tag">Learning</span>
        <h3 className="learn2-title">Financial Wellness</h3>
        <p className="learn2-desc">Learn about planning, saving, investing wisely</p>
        <Link className="learn2-cta" to="/enrich">
          Know More
          <ArrowRight size={13} strokeWidth={2.4} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
