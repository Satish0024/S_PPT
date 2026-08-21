import { Link } from 'react-router-dom'
import { FileText, TrendingUp, Users } from 'lucide-react'

export default function QuickLinks() {
  return (
    <section>
      <h2 className="section-title">Quick Links</h2>
      <div className="quick-grid">
        <a className="quick-link" href="#">
          <span className="q-ico" aria-hidden="true">
            <Users size={18} strokeWidth={2} />
          </span>
          <span className="q-label">Add Beneficiary</span>
        </a>
        <Link className="quick-link" to="/reports">
          <span className="q-ico" aria-hidden="true">
            <FileText size={18} strokeWidth={2} />
          </span>
          <span className="q-label">My Documents</span>
        </Link>
        <Link className="quick-link" to="/portfolio">
          <span className="q-ico" aria-hidden="true">
            <TrendingUp size={18} strokeWidth={2} />
          </span>
          <span className="q-label">My Portfolio</span>
        </Link>
      </div>
    </section>
  )
}
