import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, DollarSign, GraduationCap, TrendingUp } from 'lucide-react'

const TOPICS = [
  { label: 'Plan basics', icon: BookOpen, tone: 'brand' },
  { label: 'Taxes', icon: DollarSign, tone: 'green' },
  { label: 'Investing', icon: TrendingUp, tone: 'blue' }
]

export default function LearningPortal() {
  return (
    <section className="learn2" aria-label="Learning Portal">
      <span className="learn2-icon" aria-hidden="true">
        <GraduationCap size={26} strokeWidth={1.8} />
      </span>

      <span className="learn2-tag">Enrich</span>
      <h3 className="learn2-title">Learning Portal</h3>
      <p className="learn2-lead">Short guides on deferrals, investing, and planning for retirement.</p>

      <span className="learn2-sub">Quick topics</span>
      <ul className="learn2-topics">
        {TOPICS.map(({ label, icon: Icon, tone }) => (
          <li key={label} className={tone}>
            <span className="learn2-topic-ico" aria-hidden="true">
              <Icon size={16} strokeWidth={2.2} />
            </span>
            {label}
          </li>
        ))}
      </ul>

      <Link className="learn2-cta" to="/enrich">
        <span className="learn2-cta-copy">
          <b>Explore the library</b>
          <small>Browse all learning resources and helpful guides.</small>
        </span>
        <span className="learn2-cta-go" aria-hidden="true">
          <ArrowRight size={15} strokeWidth={2.4} />
        </span>
      </Link>
    </section>
  )
}
