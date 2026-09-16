import { useId } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../lib/icons'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'

// Tertiary balances (loan/cash-balance) get an info icon carrying the
// clarifying note on hover/focus instead of an always-on paragraph below
// them -- same accessible, no-delay CSS tooltip pattern as Field.jsx's
// FieldTip (focus-within, not native `title`, so it opens instantly and
// stays keyboard-reachable).
function BalanceTip({ tooltip }) {
  const id = useId()
  return (
    <span className="field-tip">
      <button type="button" className="field-tip-btn" aria-describedby={id}>
        <Icon icon={faInfoCircle} size={13} aria-hidden="true" />
        <span className="sr-only">More info</span>
      </button>
      <span className="field-tip-bubble" role="tooltip" id={id}>
        {tooltip}
      </span>
    </span>
  )
}

export default function OverallBalance({ total, vested, loan, cashBalance, showSummary = true }) {
  return (
    <section className="overall-balance" aria-label="Overall account balance">
      <div className={`ob-top${showSummary ? '' : ' ob-top-single'}`}>
        <div className="ob-metrics">
          <div className="ob-block">
            <div className="ob-k">Account balance</div>
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
            <span className="loan-k">
              <BalanceTip tooltip="This loan balance is tracked separately and is not reflected in the account balances shown above." />
              Outstanding loan balance
            </span>
            <span className="loan-v">{loan}</span>
          </div>
        </div>
      ) : null}
      {cashBalance ? (
        <div className="ob-loan">
          <div className="ob-loan-row">
            <span className="loan-k">
              <BalanceTip tooltip="This is a notional value, tracked separately, and is removed from the account balances shown above." />
              Cash balance benefit
            </span>
            <span className="loan-v">{cashBalance}</span>
          </div>
        </div>
      ) : null}
    </section>
  )
}
