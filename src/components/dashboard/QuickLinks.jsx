import { Link } from 'react-router-dom'
import { FileSpreadsheet, FileText, TrendingUp, Users } from 'lucide-react'

// showGenerateStatement: per prototype review #28/#32/#63/#78, keep hiding
// this action entirely when the participant has no transactions to
// statement.
export default function QuickLinks({ showGenerateStatement }) {
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
        {showGenerateStatement && (
          <Link className="quick-link" to="/reports" state={{ openStatement: true }}>
            <span className="q-ico" aria-hidden="true">
              <FileSpreadsheet size={18} strokeWidth={2} />
            </span>
            <span className="q-label">Generate statement</span>
          </Link>
        )}
      </div>
    </section>
  )
}
