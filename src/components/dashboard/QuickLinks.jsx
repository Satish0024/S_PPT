import { Link } from 'react-router-dom'
import { Icon } from '../../lib/icons'
import { faFileAlt, faChartLine, faUsers, faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons'

// showGenerateStatement: per prototype review #28/#32, keep hiding this
// action entirely when the participant has no transactions to statement.
export default function QuickLinks({ showGenerateStatement }) {
  return (
    <section>
      <h2 className="section-title">Quick links</h2>
      <div className="quick-grid">
        <Link className="quick-link" to="/profile?section=beneficiary&add=1">
          <span className="q-ico" aria-hidden="true">
            <Icon icon={faUsers} size={18} />
          </span>
          <span className="q-label">Add beneficiary</span>
        </Link>
        <Link className="quick-link" to="/reports">
          <span className="q-ico" aria-hidden="true">
            <Icon icon={faFileAlt} size={18} />
          </span>
          <span className="q-label">My documents</span>
        </Link>
        <Link className="quick-link" to="/portfolio">
          <span className="q-ico" aria-hidden="true">
            <Icon icon={faChartLine} size={18} />
          </span>
          <span className="q-label">My portfolio</span>
        </Link>
        {showGenerateStatement && (
          <Link className="quick-link" to="/reports" state={{ openStatement: true }}>
            <span className="q-ico" aria-hidden="true">
              <Icon icon={faFileInvoiceDollar} size={18} />
            </span>
            <span className="q-label">Generate statement</span>
          </Link>
        )}
      </div>
    </section>
  )
}
