import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Clock, GraduationCap } from 'lucide-react'
import { ARTICLES } from '../../data/learning.js'

// Learning Portal sidebar widget. Rather than generic topic chips, this
// surfaces the actual first few guides from the Enrich library with their
// topic and read time, so the card is useful at a glance instead of just
// decorative. Each row is a real link into the library.
const FEATURED = ARTICLES.slice(0, 3)

export default function LearningPortal() {
  return (
    <section className="learn2" aria-label="Learning Portal">
      <header className="learn2-head">
        <span className="learn2-head-ico" aria-hidden="true">
          <GraduationCap size={16} strokeWidth={2.1} />
        </span>
        <div className="learn2-head-copy">
          <span className="learn2-tag">Enrich</span>
          <h3 className="learn2-title">Learning Portal</h3>
        </div>
        <Link className="learn2-all" to="/enrich">
          View all
          <ArrowRight size={13} strokeWidth={2.4} aria-hidden="true" />
        </Link>
      </header>

      <ul className="learn2-list">
        {FEATURED.map((a) => (
          <li key={a.id}>
            <Link className="learn2-item" to="/enrich">
              <span className="learn2-item-copy">
                <span className="learn2-item-meta">
                  <span className={`learn2-chip ${a.tone}`}>{a.tag}</span>
                  <span className="learn2-time">
                    <Clock size={11} strokeWidth={2.2} aria-hidden="true" />
                    {a.minutes} min
                  </span>
                </span>
                <b>{a.title}</b>
              </span>
              <ChevronRight size={15} strokeWidth={2.2} className="learn2-item-go" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
