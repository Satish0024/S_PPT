import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, Info, Printer } from 'lucide-react'
import Header from '../components/layout/Header.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'
import ConfirmDialog from '../components/common/ConfirmDialog.jsx'
import EditAllocationSlideover from '../components/transactions/EditAllocationSlideover.jsx'
import { useParticipant } from '../context/ParticipantContext.jsx'
import { formatMoney, planBalance, planVested } from '../lib/accountSummary'
import {
  DISTRIBUTION_MODES,
  LOAN_INTEREST_RATE,
  LOAN_REPAYMENT_FREQUENCIES,
  LOAN_REPAYMENT_METHODS,
  LOAN_TYPES,
  REQUEST_DOC_REQUIREMENTS,
  WITHDRAWAL_TYPES,
  activeLoanFor,
  computeGrossLoanAmount,
  computeWithdrawalFees,
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
      { id: 'details', title: 'Withdrawal Details' },
      { id: 'allocation', title: 'Withdrawal Allocation' },
      { id: 'fee', title: 'Fee Details' },
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
    return {
      loanType: '',
      amount: '',
      entireAmount: '',
      repaymentMethod: 'payroll',
      repaymentFrequency: 'monthly',
      years: 1,
      months: 0,
      docUploaded: false
    }
  }
  if (type === 'withdrawal') {
    return {
      withdrawalType: '',
      withdrawAs: 'onetime',
      entireBalance: '',
      mode: '',
      amount: '',
      address: '',
      addressChanged: false,
      city: '',
      country: '',
      docUploaded: false,
      termsAccepted: false
    }
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
  const repaymentMethod = LOAN_REPAYMENT_METHODS.find((m) => m.id === form.repaymentMethod)
  const repaymentFrequency = LOAN_REPAYMENT_FREQUENCIES.find((f) => f.id === form.repaymentFrequency)
  const maxTermYears = loanType?.maxYears ?? 5
  const gross = computeGrossLoanAmount(amount)

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
            <label>Interest rate</label>
            <input type="text" disabled value={`${LOAN_INTEREST_RATE}%`} />
          </div>
        </div>

        <div className="txn-row" style={{ marginTop: 14 }}>
          <div className="txn-field">
            <label>
              Take entire loan amount<i>*</i>
            </label>
            <div className="txn-tenure-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                <input
                  type="radio"
                  checked={form.entireAmount === 'yes'}
                  onChange={() => set({ entireAmount: 'yes', amount: String(limits.max) })}
                />
                Yes
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                <input
                  type="radio"
                  checked={form.entireAmount === 'no'}
                  onChange={() => set({ entireAmount: 'no' })}
                />
                No
              </label>
            </div>
          </div>
          <div className="txn-field">
            <label>
              Loan amount<i>*</i>
            </label>
            <input
              type="number"
              placeholder="Enter amount"
              value={form.amount}
              disabled={form.entireAmount === 'yes'}
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
            disabled={!form.loanType || !form.entireAmount || !amount || amount < limits.min || amount > limits.max}
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
        <p className="hint">
          Loan calculator — enter any two of loan amount, periodic payment, and tenure; the third auto-computes.
        </p>

        <div className="txn-row">
          <div className="txn-field">
            <label>
              Loan repayment method<i>*</i>
            </label>
            <div className="txn-tenure-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
              {LOAN_REPAYMENT_METHODS.map((m) => (
                <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                  <input
                    type="radio"
                    checked={form.repaymentMethod === m.id}
                    onChange={() => set({ repaymentMethod: m.id })}
                  />
                  {m.label}
                </label>
              ))}
            </div>
            {repaymentMethod && <span className="note">{repaymentMethod.hint}</span>}
          </div>
          <div className="txn-field">
            <label>
              Loan repayment frequency<i>*</i>
            </label>
            <select value={form.repaymentFrequency} onChange={(e) => set({ repaymentFrequency: e.target.value })}>
              {LOAN_REPAYMENT_FREQUENCIES.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
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

        <div className="wd-fee-card" style={{ marginTop: 18, marginBottom: 0 }}>
          <div className="wd-fee-row">
            <span>Requested amount</span>
            <b>{formatMoney(gross.requested)}</b>
          </div>
          <div className="wd-fee-row">
            <span>Loan origination fee</span>
            <b>{formatMoney(gross.fee)}</b>
          </div>
          <div className="wd-fee-row total">
            <span>Gross Loan amount</span>
            <b>{formatMoney(gross.grossAmount)}</b>
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
      <SummaryRow label="Take entire loan amount" value={form.entireAmount === 'yes' ? 'Yes' : 'No'} onEdit={() => onEdit(0)} />
      <SummaryRow label="Loan amount" value={formatMoney(amount)} onEdit={() => onEdit(0)} />
      <SummaryRow label="Interest rate" value={`${LOAN_INTEREST_RATE}%`} />
      <SummaryRow label="Repayment method" value={repaymentMethod?.label || '—'} onEdit={() => onEdit(1)} />
      <SummaryRow label="Repayment frequency" value={repaymentFrequency?.label || '—'} onEdit={() => onEdit(1)} />
      <SummaryRow label="Loan term" value={`${form.years || 0} yr ${form.months || 0} mo`} onEdit={() => onEdit(1)} />
      <SummaryRow label="Periodic payment" value={payment ? formatMoney(payment) : '—'} />
      <SummaryRow label="Gross Loan Amount" value={formatMoney(gross.grossAmount)} />
      <SummaryRow label="Promissory note" value={form.docUploaded ? 'Uploaded' : 'Not uploaded'} onEdit={() => onEdit(2)} />
    </SummaryStep>
  )
}

/* ---------------- Withdrawal / Distribution ---------------- */

function WithdrawalSteps({ step, plan, participant, form, set, onNext, onBack, onSubmit, onEdit }) {
  const [showLoanDialog, setShowLoanDialog] = useState(false)
  const [editingAllocation, setEditingAllocation] = useState(false)
  const withdrawalType = WITHDRAWAL_TYPES.find((t) => t.id === form.withdrawalType)
  const mode = DISTRIBUTION_MODES.find((m) => m.id === form.mode)
  const legalName = participant.name
  const originalAddress = `${participant.profile?.address || ''}, ${participant.profile?.city || ''}`.trim()
  const fees = computeWithdrawalFees(form.amount, form.withdrawalType)
  const loan = activeLoanFor(participant, plan)

  const chooseEntireBalance = (value) => {
    if (value === 'yes' && loan) {
      setShowLoanDialog(true)
      return
    }
    set({ entireBalance: value })
  }

  if (step === 'details') {
    return (
      <div className="txn-card">
        <h3>Withdrawal Details</h3>
        <div className="txn-row">
          <div className="txn-field">
            <label>
              Select withdrawal type<i>*</i>
            </label>
            <select value={form.withdrawalType} onChange={(e) => set({ withdrawalType: e.target.value })}>
              <option value="">Select</option>
              {WITHDRAWAL_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="txn-row" style={{ marginTop: 14 }}>
          <div className="txn-field">
            <label>
              Withdraw<i>*</i>
            </label>
            <div className="txn-tenure-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                <input
                  type="radio"
                  checked={form.withdrawAs === 'onetime'}
                  onChange={() => set({ withdrawAs: 'onetime' })}
                />
                As one time payment
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                <input
                  type="radio"
                  checked={form.withdrawAs === 'periodic'}
                  onChange={() => set({ withdrawAs: 'periodic' })}
                />
                As periodic payment
              </label>
            </div>
          </div>
          <div className="txn-field">
            <label>
              Withdraw entire balance<i>*</i>
            </label>
            <div className="txn-tenure-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                <input type="radio" checked={form.entireBalance === 'yes'} onChange={() => chooseEntireBalance('yes')} />
                Yes
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                <input type="radio" checked={form.entireBalance === 'no'} onChange={() => chooseEntireBalance('no')} />
                No
              </label>
            </div>
          </div>
        </div>

        {form.entireBalance === 'yes' && loan && (
          <div className="wd-note">
            <Info size={15} strokeWidth={2.2} />
            <span>Active loan amount is detected and will be converted to a default loan.</span>
          </div>
        )}

        <div className="txn-actions">
          <span />
          <button
            type="button"
            className="btn btn-primary"
            disabled={!form.withdrawalType || !form.withdrawAs || !form.entireBalance}
            onClick={onNext}
          >
            Continue
          </button>
        </div>

        {showLoanDialog && (
          <ConfirmDialog
            title="Outstanding loan detected!"
            body={`For the plan ${plan.name}, an outstanding loan is detected. The system will apply the default loan treatment and distribute the remaining balance to you.`}
            confirmLabel="Okay"
            onConfirm={() => {
              set({ entireBalance: 'yes' })
              setShowLoanDialog(false)
            }}
            onCancel={() => setShowLoanDialog(false)}
          />
        )}
      </div>
    )
  }

  if (step === 'allocation') {
    return (
      <div className="txn-card">
        <h3>Withdrawal Allocation</h3>
        <p className="hint">Review how this withdrawal is allocated, then edit the recipient details if needed.</p>

        <div className="table-wrap">
          <table className="wd-alloc-table">
            <thead>
              <tr>
                <th>Recipient</th>
                <th className="num">Tax</th>
                <th className="num">Fee</th>
                <th className="num">Penalty</th>
                <th className="num">Amount</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Self</td>
                <td className="num">{formatMoney(fees.federalTax)}</td>
                <td className="num">{formatMoney(fees.withdrawalFee)}</td>
                <td className="num">{formatMoney(fees.penalty)}</td>
                <td className="num">{formatMoney(fees.requested)}</td>
                <td className="num">
                  <button type="button" className="wd-alloc-edit" onClick={() => setEditingAllocation(true)}>
                    View details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="txn-actions">
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            Back
          </button>
          <button type="button" className="btn btn-primary" disabled={!form.mode || !form.amount} onClick={onNext}>
            Continue
          </button>
        </div>

        {editingAllocation && (
          <EditAllocationSlideover
            allocation={{
              mode: form.mode,
              amount: form.amount,
              paymentMethod: form.paymentMethod || 'check',
              addressOption: form.addressOption || 'onfile',
              customAddress: form.address || '',
              source: form.source || 'prorata'
            }}
            withdrawalTypeId={form.withdrawalType}
            legalName={legalName}
            originalAddress={originalAddress}
            onClose={() => setEditingAllocation(false)}
            onSave={(draft) => {
              set({
                mode: draft.mode,
                amount: draft.amount,
                paymentMethod: draft.paymentMethod,
                addressOption: draft.addressOption,
                address: draft.customAddress,
                addressChanged: draft.addressOption === 'custom' && draft.customAddress.trim().length > 0,
                source: draft.source
              })
              setEditingAllocation(false)
            }}
          />
        )}
      </div>
    )
  }

  if (step === 'fee') {
    return (
      <div className="txn-card">
        <h3>Fee Details</h3>
        <p className="hint">This is what your plan will deduct to cover fees, tax withholding, and any penalty.</p>

        <div className="wd-fee-card">
          <div className="wd-fee-row">
            <span>Requested Amount</span>
            <b>{formatMoney(fees.requested)}</b>
          </div>
          <div className="wd-fee-row">
            <span>Withdrawal fee</span>
            <b>{formatMoney(fees.withdrawalFee)}</b>
          </div>
          <div className="wd-fee-row">
            <span>Federal tax ({fees.federalTaxPct}%)</span>
            <b>{formatMoney(fees.federalTax)}</b>
          </div>
          {fees.penaltyPct > 0 && (
            <div className="wd-fee-row">
              <span>Early withdrawal penalty ({fees.penaltyPct}%)</span>
              <b>{formatMoney(fees.penalty)}</b>
            </div>
          )}
          <div className="wd-fee-row total">
            <span>Gross Withdrawal amount</span>
            <b>{formatMoney(fees.grossAmount)}</b>
          </div>
        </div>

        {form.addressChanged && (
          <div className="address-banner">
            <Info size={16} strokeWidth={2.2} />
            <div>
              <b>Custom address on this request</b>
              This request will be flagged for admin review, noting the address was changed within the last 3 days.
            </div>
          </div>
        )}

        <div className="txn-actions">
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            Back
          </button>
          <button type="button" className="btn btn-primary" onClick={onNext}>
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
    <SummaryStep
      title="Withdrawal Request Summary"
      onBack={onBack}
      onSubmit={onSubmit}
      submitDisabled={!form.termsAccepted}
    >
      <h4 style={{ margin: '0 0 8px', fontSize: 13.5, fontWeight: 800 }}>Withdrawal details</h4>
      <SummaryRow label="Withdrawal type" value={withdrawalType?.label || '—'} onEdit={() => onEdit(0)} />
      <SummaryRow label="Withdraw" value={form.withdrawAs === 'periodic' ? 'As periodic payment' : 'As one time payment'} onEdit={() => onEdit(0)} />
      <SummaryRow label="Withdraw entire balance" value={form.entireBalance === 'yes' ? 'Yes' : 'No'} onEdit={() => onEdit(0)} />
      <div className="wd-note">
        <Info size={15} strokeWidth={2.2} />
        <span>The processing time for your withdrawal is 10 days.</span>
      </div>

      <h4 style={{ margin: '20px 0 8px', fontSize: 13.5, fontWeight: 800 }}>Withdrawal allocation</h4>
      <div className="table-wrap">
        <table className="wd-alloc-table">
          <thead>
            <tr>
              <th>Recipient</th>
              <th className="num">Tax</th>
              <th className="num">Fee</th>
              <th className="num">Penalty</th>
              <th className="num">Amount</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Self</td>
              <td className="num">{formatMoney(fees.federalTax)}</td>
              <td className="num">{formatMoney(fees.withdrawalFee)}</td>
              <td className="num">{formatMoney(fees.penalty)}</td>
              <td className="num">{formatMoney(fees.requested)}</td>
              <td className="num">
                <button type="button" className="wd-alloc-edit" onClick={() => onEdit(1)}>
                  View details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {mode?.id === 'direct' && <SummaryRow label="Mail check payable to" value={legalName} />}
      {mode?.id === 'direct' && <SummaryRow label="Address" value={form.address || originalAddress} onEdit={() => onEdit(1)} />}
      <SummaryRow label="Distribution form" value={form.docUploaded ? 'Uploaded' : 'Not uploaded'} onEdit={() => onEdit(3)} />

      <label className="wd-terms">
        <input
          type="checkbox"
          checked={form.termsAccepted}
          onChange={(e) => set({ termsAccepted: e.target.checked })}
        />
        <span>
          By checking this box, I declare that I have read{' '}
          <a href="#terms" className="text-link" onClick={(e) => e.preventDefault()}>
            the terms and conditions
          </a>
          .
        </span>
      </label>
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

function SummaryStep({ title, children, onBack, onSubmit, submitDisabled }) {
  return (
    <div className="txn-card">
      <div className="txn-summary-head">
        <h3>{title}</h3>
        <button type="button" className="icon-btn" title="Print" onClick={() => window.print()}>
          <Printer size={17} strokeWidth={2} />
        </button>
      </div>
      <div>{children}</div>
      <div className="txn-actions">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn btn-primary" disabled={submitDisabled} onClick={onSubmit}>
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
