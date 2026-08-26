import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, Info } from 'lucide-react'
import Header from '../components/layout/Header.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'
import { useParticipant } from '../context/ParticipantContext.jsx'
import { formatMoney, planBalance, planVested } from '../lib/accountSummary'
import {
  DISTRIBUTION_MODES,
  LOAN_TYPES,
  REQUEST_DOC_REQUIREMENTS,
  estimatePeriodicPayment,
  loanLimits,
  transactablePlans
} from '../data/transactions.js'
import '../styles/transactions.css'

const WIZARDS = {
  loan: {
    title: 'New Loan Request',
    steps: [
      { id: 'details', title: 'Loan Details' },
      { id: 'payment', title: 'Payment & Fee Details' },
      { id: 'documents', title: 'Upload Documents' },
      { id: 'summary', title: 'Loan Request Summary' }
    ]
  },
  withdrawal: {
    title: 'New Withdrawal Request',
    steps: [
      { id: 'details', title: 'Distribution Details' },
      { id: 'documents', title: 'Upload Documents' },
      { id: 'summary', title: 'Withdrawal Request Summary' }
    ]
  },
  transfer: {
    title: 'New Transfer Request',
    steps: [
      { id: 'details', title: 'Transfer Details' },
      { id: 'summary', title: 'Transfer Request Summary' }
    ]
  }
}

function blankForm(type) {
  if (type === 'loan') {
    return { loanType: '', amount: '', years: 1, months: 0, docUploaded: false }
  }
  if (type === 'withdrawal') {
    return { mode: '', amount: '', address: '', addressChanged: false, city: '', country: '', docUploaded: false }
  }
  return { fromPct: 100, toPct: 0 }
}

export default function TransactionRequest() {
  const { type } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { participant } = useParticipant()
  const wizard = WIZARDS[type]

  const plans = useMemo(() => transactablePlans(participant), [participant])
  const requestedPlanId = params.get('plan')
  const plan = plans.find((p) => p.id === requestedPlanId) || plans[0]

  const [stepIdx, setStepIdx] = useState(0)
  const [maxReached, setMaxReached] = useState(0)
  const [form, setForm] = useState(() => blankForm(type))
  const [done, setDone] = useState(false)

  if (!wizard || !plan) {
    return (
      <div className="page-body">
        <div className="hi-bar">
          <h1>Request not available</h1>
        </div>
        <p style={{ padding: '0 20px' }}>
          <Link to="/transactions" className="text-link">
            Back to Transactions
          </Link>
        </p>
      </div>
    )
  }

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const step = wizard.steps[stepIdx]

  const goTo = (i) => {
    if (i <= maxReached) setStepIdx(i)
  }
  const next = () => {
    const n = Math.min(wizard.steps.length - 1, stepIdx + 1)
    setStepIdx(n)
    setMaxReached((m) => Math.max(m, n))
  }
  const back = () => setStepIdx((i) => Math.max(0, i - 1))

  const submit = () => setDone(true)

  return (
    <>
      <Header />
      <div className="layout">
        <Sidebar />
        <div className="txn-wizard">
          <aside className="txn-steps">
            <Link to="/transactions" className="back">
              <ArrowLeft size={15} strokeWidth={2.2} /> Back
            </Link>
            <h1>{wizard.title}</h1>
            {wizard.steps.map((s, i) => {
              const complete = i < stepIdx
              const current = i === stepIdx
              const enabled = i <= maxReached
              return (
                <div
                  key={s.id}
                  className={`txn-step${complete ? ' complete' : ''}${current ? ' current' : ''}${enabled ? ' enabled' : ''}`}
                  onClick={() => goTo(i)}
                  role={enabled ? 'button' : undefined}
                >
                  <span className="num">{complete ? <Check size={13} strokeWidth={3} /> : i + 1}</span>
                  <h4>{s.title}</h4>
                </div>
              )
            })}
          </aside>

          <main className="txn-main">
            {done ? (
              <SubmittedPanel type={type} navigate={navigate} />
            ) : (
              <>
                <div className="txn-plan-head">
                  <div>
                    <h2>{plan.name}</h2>
                    <p className="plan-meta">
                      Plan ID {plan.meta?.match(/ID\s+(\S+)/i)?.[1] || plan.id} · Type {plan.type}
                    </p>
                  </div>
                  <div className="req-plan-stats">
                    <div>
                      <span>Plan balance</span>
                      <b>{formatMoney(planBalance(plan))}</b>
                    </div>
                    <div>
                      <span>Vested balance</span>
                      <b>{formatMoney(planVested(plan))}</b>
                    </div>
                  </div>
                </div>

                {type === 'loan' && (
                  <LoanSteps step={step.id} plan={plan} form={form} set={set} onNext={next} onBack={back} onSubmit={submit} onEdit={goTo} />
                )}
                {type === 'withdrawal' && (
                  <WithdrawalSteps
                    step={step.id}
                    plan={plan}
                    participant={participant}
                    form={form}
                    set={set}
                    onNext={next}
                    onBack={back}
                    onSubmit={submit}
                    onEdit={goTo}
                  />
                )}
                {type === 'transfer' && (
                  <TransferSteps step={step.id} plan={plan} form={form} set={set} onNext={next} onBack={back} onSubmit={submit} />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </>
  )
}

function SubmittedPanel({ type, navigate }) {
  const label = type === 'loan' ? 'loan' : type === 'withdrawal' ? 'withdrawal' : 'transfer'
  return (
    <div className="txn-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
      <div className="success-mark" aria-hidden="true" style={{ margin: '0 auto 12px' }}>
        <svg viewBox="0 0 52 52" width="52" height="52">
          <circle className="success-ring" cx="26" cy="26" r="24" />
          <path className="success-check" d="M15.5 27.2l7.2 7.2 14.6-16" />
        </svg>
      </div>
      <h3>Your {label} request has been submitted</h3>
      <p className="hint">You can track its status from the Requests tab on the Transactions page.</p>
      <div className="txn-actions" style={{ justifyContent: 'center' }}>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/transactions')}>
          Back to Transactions
        </button>
      </div>
    </div>
  )
}

/* ---------------- Loan ---------------- */

function LoanSteps({ step, plan, form, set, onNext, onBack, onSubmit, onEdit }) {
  const limits = loanLimits(plan)
  const amount = +form.amount || 0
  const payment = estimatePeriodicPayment(amount, +form.years, +form.months)
  const loanType = LOAN_TYPES.find((l) => l.id === form.loanType)
  const maxTermYears = loanType?.maxYears ?? 5

  if (step === 'details') {
    return (
      <div className="txn-card">
        <h3>Loan Details</h3>
        <p className="hint">
          Your personal eligible maximum limit is {formatMoney(limits.max)}.{' '}
          <a href="#policy" className="text-link" onClick={(e) => e.preventDefault()}>
            Policy and requirements
          </a>
        </p>
        <div className="txn-row">
          <div className="txn-field">
            <label>
              Select loan type<i>*</i>
            </label>
            <select value={form.loanType} onChange={(e) => set({ loanType: e.target.value })}>
              <option value="">Select</option>
              {LOAN_TYPES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
            {loanType && <span className="note">{loanType.hint}</span>}
          </div>
          <div className="txn-field">
            <label>
              Loan amount<i>*</i>
            </label>
            <input
              type="number"
              placeholder="Enter amount"
              value={form.amount}
              onChange={(e) => set({ amount: e.target.value })}
            />
            <span className={`note${amount > limits.max ? ' warn' : ''}`}>
              Minimum {formatMoney(limits.min)} · Maximum {formatMoney(limits.max)}
            </span>
          </div>
        </div>
        <div className="txn-actions">
          <span />
          <button
            type="button"
            className="btn btn-primary"
            disabled={!form.loanType || !amount || amount < limits.min || amount > limits.max}
            onClick={onNext}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  if (step === 'payment') {
    return (
      <div className="txn-card">
        <h3>Payment &amp; Fee Details</h3>
        <p className="hint">Loan repayment method</p>
        <div className="txn-choice on locked">
          <input type="radio" checked readOnly />
          <span>
            <b>Payroll deduction</b>
            <small>Repayments are deducted automatically from your paycheck.</small>
          </span>
        </div>

        <div className="txn-row" style={{ marginTop: 18, alignItems: 'flex-end' }}>
          <div className="txn-field">
            <label>
              Length of the loan term<i>*</i>
            </label>
            <div className="txn-tenure-row">
              <input
                type="number"
                min={0}
                value={form.years}
                onChange={(e) => set({ years: Math.max(0, +e.target.value || 0) })}
              />
              <span className="note">Year(s)</span>
              <input
                type="number"
                min={0}
                max={11}
                value={form.months}
                onChange={(e) => set({ months: Math.max(0, Math.min(11, +e.target.value || 0)) })}
              />
              <span className="note">Month(s)</span>
            </div>
            <span className="note">Max term is {maxTermYears} years 0 months</span>
          </div>
          <div className="txn-field">
            <label>Periodic payment</label>
            <input type="text" disabled value={payment ? formatMoney(payment) : '—'} />
            <span className="note">Changes to the loan term automatically update the periodic payment.</span>
          </div>
        </div>

        <div className="txn-actions">
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            Back
          </button>
          <button type="button" className="btn btn-primary" disabled={!form.years && !form.months} onClick={onNext}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  if (step === 'documents') {
    return <DocumentsStep type="loan" form={form} set={set} onNext={onNext} onBack={onBack} />
  }

  return (
    <SummaryStep title="Loan Request Summary" onBack={onBack} onSubmit={onSubmit}>
      <SummaryRow label="Loan type" value={loanType?.label || '—'} onEdit={() => onEdit(0)} />
      <SummaryRow label="Loan amount" value={formatMoney(amount)} onEdit={() => onEdit(0)} />
      <SummaryRow label="Repayment method" value="Payroll deduction" />
      <SummaryRow label="Loan term" value={`${form.years || 0} yr ${form.months || 0} mo`} onEdit={() => onEdit(1)} />
      <SummaryRow label="Periodic payment" value={payment ? formatMoney(payment) : '—'} />
      <SummaryRow label="Promissory note" value={form.docUploaded ? 'Uploaded' : 'Not uploaded'} onEdit={() => onEdit(2)} />
    </SummaryStep>
  )
}

/* ---------------- Withdrawal / Distribution ---------------- */

function WithdrawalSteps({ step, plan, participant, form, set, onNext, onBack, onSubmit, onEdit }) {
  const mode = DISTRIBUTION_MODES.find((m) => m.id === form.mode)
  const legalName = participant.name
  const originalAddress = `${participant.profile?.address || ''}, ${participant.profile?.city || ''}`.trim()

  if (step === 'details') {
    const orderedModes = [
      DISTRIBUTION_MODES.find((m) => m.id === 'direct'),
      DISTRIBUTION_MODES.find((m) => m.id === 'rollover'),
      DISTRIBUTION_MODES.find((m) => m.id === 'ira')
    ]
    return (
      <div className="txn-card">
        <h3>Distribution Details</h3>
        <p className="hint">Select distribution mode</p>
        <div className="txn-choice-list">
          {orderedModes.map((m) => (
            <label key={m.id} className={`txn-choice${form.mode === m.id ? ' on' : ''}`}>
              <input type="radio" checked={form.mode === m.id} onChange={() => set({ mode: m.id })} />
              <span>
                <b>{m.label}</b>
                <small>{m.hint}</small>
              </span>
            </label>
          ))}
        </div>

        <div className="txn-row" style={{ marginTop: 16 }}>
          <div className="txn-field">
            <label>
              Amount<i>*</i>
            </label>
            <input
              type="number"
              placeholder="Enter amount"
              value={form.amount}
              onChange={(e) => set({ amount: e.target.value })}
            />
          </div>
        </div>

        {form.mode === 'direct' && (
          <>
            <div className="txn-row" style={{ marginTop: 8 }}>
              <div className="txn-field">
                <label>Mail check payable to</label>
                <input type="text" disabled value={legalName} />
                <span className="note">Checks can only be made payable to the name on your account.</span>
              </div>
            </div>
            <div className="txn-row">
              <div className="txn-field">
                <label>
                  Address<i>*</i>
                </label>
                <input
                  type="text"
                  value={form.address}
                  placeholder={originalAddress}
                  onChange={(e) => set({ address: e.target.value, addressChanged: e.target.value.trim().length > 0 })}
                />
              </div>
              <div className="txn-field">
                <label>
                  City<i>*</i>
                </label>
                <input type="text" value={form.city} onChange={(e) => set({ city: e.target.value })} />
              </div>
              <div className="txn-field">
                <label>
                  Country<i>*</i>
                </label>
                <input type="text" value={form.country} onChange={(e) => set({ country: e.target.value })} />
              </div>
            </div>
            {form.addressChanged && (
              <div className="address-banner">
                <Info size={16} strokeWidth={2.2} />
                <div>
                  <b>Custom address on this request</b>
                  This request will be flagged for admin review, noting the address was changed within the last 3
                  days.
                </div>
              </div>
            )}
          </>
        )}

        <div className="txn-actions">
          <span />
          <button type="button" className="btn btn-primary" disabled={!form.mode || !form.amount} onClick={onNext}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  if (step === 'documents') {
    return <DocumentsStep type="withdrawal" form={form} set={set} onNext={onNext} onBack={onBack} />
  }

  return (
    <SummaryStep title="Withdrawal Request Summary" onBack={onBack} onSubmit={onSubmit}>
      <SummaryRow label="Distribution mode" value={mode?.label || '—'} onEdit={() => onEdit(0)} />
      <SummaryRow label="Amount" value={formatMoney(+form.amount || 0)} onEdit={() => onEdit(0)} />
      {form.mode === 'direct' && <SummaryRow label="Mail check payable to" value={legalName} />}
      {form.mode === 'direct' && <SummaryRow label="Address" value={form.address || originalAddress} onEdit={() => onEdit(0)} />}
      <SummaryRow label="Distribution form" value={form.docUploaded ? 'Uploaded' : 'Not uploaded'} onEdit={() => onEdit(1)} />
    </SummaryStep>
  )
}

/* ---------------- Transfer ---------------- */

function TransferSteps({ step, plan, form, set, onNext, onBack, onSubmit }) {
  if (step === 'details') {
    return (
      <div className="txn-card">
        <h3>Transfer Details</h3>
        <p className="hint">Move a share of your balance from one allocation to another. Investments should total 100%.</p>
        <div className="txn-row">
          <div className="txn-field">
            <label>Current allocation</label>
            <input type="text" disabled value={`${form.fromPct}%`} />
          </div>
          <div className="txn-field">
            <label>Transfer percentage</label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.toPct}
              onChange={(e) => {
                const v = Math.max(0, Math.min(100, +e.target.value || 0))
                set({ toPct: v, fromPct: 100 - v })
              }}
            />
          </div>
        </div>
        <div className="txn-actions">
          <span />
          <button type="button" className="btn btn-primary" disabled={!form.toPct} onClick={onNext}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <SummaryStep title="Transfer Request Summary" onBack={onBack} onSubmit={onSubmit}>
      <SummaryRow label="Plan" value={plan.name} />
      <SummaryRow label="Transferring" value={`${form.toPct}%`} />
      <SummaryRow label="Remaining in current allocation" value={`${form.fromPct}%`} />
    </SummaryStep>
  )
}

/* ---------------- Shared steps ---------------- */

function DocumentsStep({ type, form, set, onNext, onBack }) {
  const [mode, setMode] = useState('manual')
  const docs = REQUEST_DOC_REQUIREMENTS[type] || []

  return (
    <div className="txn-card">
      <h3>Upload Documents</h3>
      {docs.map((d) => (
        <div key={d.id} style={{ marginBottom: 16 }}>
          <span className="txn-doc-required">{d.required ? 'Required' : 'Not required'}</span>
          <div className="txn-upload">
            <div className="tabs2">
              <button type="button" className={mode === 'manual' ? 'on' : ''} onClick={() => setMode('manual')}>
                Upload manually
              </button>
              <button type="button" className={mode === 'esign' ? 'on' : ''} onClick={() => setMode('esign')}>
                Use E-signature
              </button>
            </div>
            <p style={{ fontWeight: 700, color: 'var(--ink)' }}>{d.label}</p>
            {mode === 'manual' ? (
              <>
                <button type="button" className="btn btn-secondary" onClick={() => set({ docUploaded: true })}>
                  {form.docUploaded ? 'Replace file' : 'Browse or drag & drop to upload'}
                </button>
                <p>Accepted formats: jpeg, png, jpg, pdf, word · Max file size 5MB</p>
              </>
            ) : (
              <button type="button" className="btn btn-secondary" onClick={() => set({ docUploaded: true })}>
                Send for e-signature
              </button>
            )}
            {form.docUploaded && <p style={{ color: 'var(--green)', fontWeight: 700 }}>✓ Received</p>}
          </div>
        </div>
      ))}
      <div className="txn-actions">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn btn-primary" disabled={docs.some((d) => d.required) && !form.docUploaded} onClick={onNext}>
          Continue
        </button>
      </div>
    </div>
  )
}

function SummaryStep({ title, children, onBack, onSubmit }) {
  return (
    <div className="txn-card">
      <h3>{title}</h3>
      <div>{children}</div>
      <div className="txn-actions">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn btn-primary" onClick={onSubmit}>
          Submit Request
        </button>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, onEdit }) {
  return (
    <div className="txn-summary-row">
      <span>{label}</span>
      <b>
        {value}
        {onEdit && (
          <button type="button" className="txn-summary-edit" onClick={onEdit} style={{ marginLeft: 10 }}>
            Edit
          </button>
        )}
      </b>
    </div>
  )
}
