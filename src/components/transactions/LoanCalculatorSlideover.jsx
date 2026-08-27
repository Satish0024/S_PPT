import { useState } from 'react'
import Slideover from '../common/Slideover.jsx'
import { computeLoanPayoff, formatMoney } from '../../data/transactions.js'

const MODES = [
  { id: 'catchup', label: 'To catch up missed payments' },
  { id: 'close', label: 'To close the loan' }
]

function toDateInput(d) {
  return d.toISOString().slice(0, 10)
}

export default function LoanCalculatorSlideover({ loan, onClose }) {
  const [mode, setMode] = useState('close')
  const [date, setDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    return toDateInput(d)
  })

  const result = computeLoanPayoff({
    balance: loan.balance,
    targetDate: date,
    mode,
    monthlyPayment: loan.monthlyPayment
  })

  return (
    <Slideover title="Calculator" width="narrow" onClose={onClose}>
      <div className="loan-calc">
        <p className="loan-calc-lead">
          Estimate how much you owe to {mode === 'catchup' ? 'catch up missed payments' : 'pay off this loan in full'}.
        </p>

        <div className="rq-field">
          <label>Calculate</label>
          <div className="rq-options">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`rq-opt${mode === m.id ? ' on' : ''}`}
                onClick={() => setMode(m.id)}
              >
                <span className="rq-opt-dot" aria-hidden="true" />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rq-field">
          <label>{mode === 'catchup' ? 'Catch-up payment date' : 'Loan payoff date'}</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={toDateInput(new Date())} />
        </div>

        <div className="loan-calc-result">
          <span className="loan-calc-result-title">
            Amount required to {mode === 'catchup' ? 'catch up repayments' : 'close the loan'}
          </span>
          <b>{formatMoney(result.total)}</b>
          <div className="loan-calc-breakdown">
            <div>
              <span>Principal</span>
              <b>{formatMoney(result.principal)}</b>
            </div>
            <div>
              <span>Interest</span>
              <b>{formatMoney(result.interest)}</b>
            </div>
          </div>
        </div>
      </div>
    </Slideover>
  )
}
