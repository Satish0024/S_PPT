import { Link } from 'react-router-dom'

export default function OverallBalance({ total, vested, loan }) {
  return (
    <section className="overall-balance" aria-label="Overall account balance">
      <div className="ob-top">
        <div className="ob-metrics">
          <div className="ob-block">
            <div className="ob-k">Account Balance</div>
            <div className="ob-v">{total}</div>
          </div>
          <div className="ob-block vested">
            <div className="ob-k">Vested Balance</div>
            <div className="ob-v">{vested}</div>
          </div>
        </div>
        <Link to="/account-summary" className="btn btn-secondary ob-summary">
          View Summary
        </Link>
      </div>
      {loan && (
        <div className="ob-loan">
          <span className="loan-k">Outstanding Loan Balance</span>
          <span className="loan-v">{loan}</span>
          <span className="loan-note">
            This loan balance is tracked separately and is not reflected in the account balances shown above.
          </span>
        </div>
      )}
    </section>
  )
}
