import { Link } from 'react-router-dom'
import { FileText, FilePlus2, TrendingUp, Users } from 'lucide-react'

// "Generate statement" moved here from the Recent Transactions widget
// (items #63/#78) — it's a Quick Links tile now, not a link buried in the
// transactions list. Hidden entirely when the participant has no
// transactions, same as the old widget-link behavior.
export default function QuickLinks({ showStatement = true }) {
  return (
    <section>
      <h2 className="section-title">Quick links</h2>
      <div className="quick-grid">
        <Link className="quick-link" to="/profile?section=beneficiary&add=1">
          <span className="q-ico" aria-hidden="true">
            <Users size={18} strokeWidth={2} />
          </span>
          <span className="q-label">Add beneficiary</span>
        </Link>
        <Link className="quick-link" to="/reports">
          <span className="q-ico" aria-hidden="true">
            <FileText size={18} strokeWidth={2} />
          </span>
          <span className="q-label">My documents</span>
        </Link>
        <Link className="quick-link" to="/portfolio">
          <span className="q-ico" aria-hidden="true">
            <TrendingUp size={18} strokeWidth={2} />
          </span>
          <span className="q-label">My portfolio</span>
        </Link>
        {showStatement && (
          <Link className="quick-link" to="/reports" state={{ openStatement: true }}>
            <span className="q-ico" aria-hidden="true">
              <FilePlus2 size={18} strokeWidth={2} />
            </span>
            <span className="q-label">Generate statement</span>
          </Link>
        )}
      </div>
    </section>
  )
}
