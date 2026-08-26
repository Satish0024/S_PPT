import { Link } from 'react-router-dom'
import { ArrowUpRight, BookOpen, DollarSign, TrendingUp } from 'lucide-react'

const TOPICS = [
  { label: 'Plan Basics', icon: BookOpen },
  { label: 'Taxes', icon: DollarSign },
  { label: 'Investing', icon: TrendingUp }
]

export default function LearningPortal() {
  return (
    <Link className="learn-card" to="/enrich">
      <span className="learn-card-glow" aria-hidden="true" />
      <div className="learn-card-top">
        <span className="learn-card-ico" aria-hidden="true">
          <BookOpen size={18} strokeWidth={2.1} />
        </span>
        <div>
          <span className="learn-card-tag">Enrich</span>
          <h4>Learning Portal</h4>
        </div>
      </div>
      <p>Short guides on deferrals, investing, and planning for retirement.</p>
      <ul className="learn-card-topics">
        {TOPICS.map(({ label, icon: Icon }) => (
          <li key={label}>
            <Icon size={12} strokeWidth={2.4} />
            {label}
          </li>
        ))}
      </ul>
      <span className="learn-card-cta">
        Explore the library
        <span className="learn-card-cta-ico" aria-hidden="true">
          <ArrowUpRight size={15} strokeWidth={2.4} />
        </span>
      </span>
    </Link>
  )
}
