import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

// Purely decorative "knowledge field": faint contour lines + a scatter of
// dots kept to the right, behind the copy. aria-hidden — every word on the
// card exists as real text regardless.
function KnowledgeField() {
  return (
    <svg className="learn2-field" viewBox="0 0 400 190" preserveAspectRatio="xMaxYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="learn2-glow" cx="70%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#b9a6ff" stopOpacity=".35" />
          <stop offset="100%" stopColor="#b9a6ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="400" height="190" fill="url(#learn2-glow)" />
      <path d="M240 10 C 300 40, 300 90, 360 100 S 420 150, 400 190" fill="none" stroke="rgba(110,86,214,.22)" strokeWidth="1.4" />
      <path d="M270 -10 C 320 30, 310 70, 380 90" fill="none" stroke="rgba(110,86,214,.16)" strokeWidth="1.2" />
      <g fill="#6e56d6">
        <circle cx="300" cy="34" r="2.4" opacity=".5" />
        <circle cx="340" cy="60" r="1.8" opacity=".4" />
        <circle cx="270" cy="80" r="1.6" opacity=".35" />
        <circle cx="360" cy="120" r="2.2" opacity=".45" />
        <circle cx="320" cy="150" r="1.6" opacity=".3" />
        <circle cx="385" cy="70" r="1.4" opacity=".4" />
        <circle cx="250" cy="130" r="1.4" opacity=".3" />
      </g>
    </svg>
  )
}

// Financial Wellness sidebar widget: a light, editorial content-discovery
// card. Typography carries the hierarchy — no illustration, no chart.
export default function LearningPortal() {
  return (
    <section className="learn2" aria-label="Financial Wellness">
      <KnowledgeField />
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
