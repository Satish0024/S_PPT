import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, DollarSign, GraduationCap, TrendingUp } from 'lucide-react'

const TOPICS = [
  { label: 'Plan basics', icon: BookOpen },
  { label: 'Taxes', icon: DollarSign },
  { label: 'Investing', icon: TrendingUp }
]

export default function LearningPortal() {
  return (
    <Link className="learn2" to="/enrich">
      {/* A flat gradient banner rather than the old absolutely-positioned
          illustration, which overlapped the title in a narrow column. */}
      <span className="learn2-banner" aria-hidden="true">
        <GraduationCap size={30} strokeWidth={1.7} />
      </span>

      <span className="learn2-tag">Enrich</span>
      <h3 className="learn2-title">Learning Portal</h3>
      <p className="learn2-lead">Short guides on deferrals, investing, and planning for retirement.</p>

      <ul className="learn2-topics">
        {TOPICS.map(({ label, icon: Icon }) => (
          <li key={label}>
            <Icon size={13} strokeWidth={2.3} aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>

      <span className="learn2-cta">
        Explore the library
        <ArrowRight size={15} strokeWidth={2.4} aria-hidden="true" />
      </span>
    </Link>
  )
}
