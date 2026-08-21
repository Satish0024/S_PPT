import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen } from 'lucide-react'

const TOPICS = ['Plan Basics', 'Taxes', 'Investing']

export default function LearningPortal() {
  return (
    <Link className="learn-side" to="/enrich">
      <div className="l-top">
        <span className="l-ico" aria-hidden="true">
          <BookOpen size={18} strokeWidth={2.1} />
        </span>
        <div>
          <span className="l-tag">Enrich</span>
          <h4>Learning Portal</h4>
        </div>
      </div>
      <p>Short guides on deferrals, investing, and planning for retirement.</p>
      <ul className="l-topics">
        {TOPICS.map((topic) => (
          <li key={topic}>{topic}</li>
        ))}
      </ul>
      <span className="l-cta">
        Explore The Library
        <ArrowRight size={15} strokeWidth={2.2} />
      </span>
    </Link>
  )
}
