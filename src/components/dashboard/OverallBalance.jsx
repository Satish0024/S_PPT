import { Link } from 'react-router-dom'

export default function OverallBalance({ total, vested, loan }) {
  return (
    <section className="overall-balance" aria-label="Overall account balance">
      <div className="ob-top">
        <div className="ob-metrics">
          <div className="ob-block">
            <div className="ob-k">Account balance*</div>
            <div className="ob-v">{total}</div>
          </div>
          <div className="ob-block vested">
            <div className="ob-k">Vested balance</div>
            <div className="ob-v">{vested}</div>
          </div>
        </div>
        <Link to="/account-summary" className="btn btn-secondary ob-summary">
          View summary
        </Link>
      </div>
      {loan && (
        <div className="ob-loan">
          <span className="loan-k">Outstanding loan balance</span>
          <span className="loan-v">{loan}</span>
          <span className="loan-note">
            This loan balance is tracked separately and is not reflected in the account balances shown above.
          </span>
        </div>
      )}
      <p className="ob-footnote">
        *Account balance includes any cash balance held in your account. Cash balance amounts are notional — shown
        for reference only and do not represent a segregated or invested asset.
      </p>
    </section>
  )
}
