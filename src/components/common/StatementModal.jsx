import { useState } from 'react'
import { useEscapeToClose } from '../../hooks/useEscapeToClose'
import '../../styles/documents.css'

const STATEMENT_PERIODS = [
  { id: '1m', label: 'Last month' },
  { id: '3m', label: 'Last 3 months' },
  { id: '6m', label: 'Last 6 months' },
  { id: '12m', label: 'Last 12 months' }
]

export default function StatementModal({ plans, onCancel, onGenerate }) {
  const [planId, setPlanId] = useState('')
  const [period, setPeriod] = useState('3m')

  useEscapeToClose(true, onCancel)

  return (
    <div className="enroll-modal-bg" role="presentation" onClick={onCancel}>
      <div
        className="enroll-modal stmt-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stmt-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 id="stmt-title">Generate Statement</h4>
        <div className="pr-form stmt-form">
          <div className="pr-field">
            <label htmlFor="stmt-plan">
              Plan Name/ID<i aria-hidden="true">*</i>
              <span className="sr-only"> (required)</span>
            </label>
            <select id="stmt-plan" required value={planId} onChange={(e) => setPlanId(e.target.value)}>
              <option value="">Select</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="pr-field">
            <label htmlFor="stmt-period">Statement Period</label>
            <select id="stmt-period" value={period} onChange={(e) => setPeriod(e.target.value)}>
              {STATEMENT_PERIODS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="enroll-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={onGenerate}>
            Generate &amp; Download
          </button>
        </div>
      </div>
    </div>
  )
}
