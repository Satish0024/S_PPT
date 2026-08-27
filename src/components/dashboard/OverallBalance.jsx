import { Link } from 'react-router-dom'

export default function OverallBalance({ total, vested, loan, showSummary = true }) {
  return (
    <section className="overall-balance" aria-label="Overall account balance">
      <div className={`ob-top${showSummary ? '' : ' ob-top-single'}`}>
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
        {showSummary ? (
          <Link to="/account-summary" className="btn btn-secondary ob-summary">
            View summary
          </Link>
        ) : null}
      </div>
      {loan ? (
        <div className="ob-loan">
          <div className="ob-loan-row">
            <span className="loan-k">Outstanding loan balance</span>
            <span className="loan-v">{loan}</span>
          </div>
          <p className="loan-note">
            This loan balance is tracked separately and is not reflected in the account balances shown above.
          </p>
        </div>
      ) : null}
      <p className="ob-footnote">
        *Account balance includes any cash balance held in your account. Cash balance amounts are notional — shown
        for reference only and do not represent a segregated or invested asset.
      </p>
    </section>
  )
}
