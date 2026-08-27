import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, DollarSign, TrendingUp } from 'lucide-react'
import LearningIllustration from './LearningIllustration.jsx'

const TOPICS = [
  { label: 'Plan Basics', icon: BookOpen },
  { label: 'Taxes', icon: DollarSign },
  { label: 'Investing', icon: TrendingUp }
]

export default function LearningPortal() {
  return (
    <Link className="learn-card" to="/enrich">
      <LearningIllustration />
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
      <div className="learn-card-foot">
        <span className="learn-card-cta">Explore the library</span>
        <span className="learn-card-cta-ico" aria-hidden="true">
          <ArrowRight size={16} strokeWidth={2.4} />
        </span>
      </div>
    </Link>
  )
}
