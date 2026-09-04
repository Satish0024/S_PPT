import { Link } from 'react-router-dom'
import { Icon } from '../../lib/icons'
import { faFileAlt, faChartLine, faUsers } from '@fortawesome/free-solid-svg-icons'

export default function QuickLinks() {
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
      </div>
    </section>
  )
}
