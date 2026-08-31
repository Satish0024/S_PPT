import { useId, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Check, Copy, Info, Printer } from 'lucide-react'
import { useFocusTrap } from '../hooks/useFocusTrap'
import Header from '../components/layout/Header.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'
import ConfirmDialog from '../components/common/ConfirmDialog.jsx'
import Field, { FieldGroup } from '../components/common/Field.jsx'
import EditAllocationSlideover, { FeeAndTaxPanel } from '../components/transactions/EditAllocationSlideover.jsx'
import LegalCopySlideover from '../components/transactions/LegalCopySlideover.jsx'
import AmortizationScheduleSlideover from '../components/transactions/AmortizationScheduleSlideover.jsx'
import AddInvestmentSlideover from '../components/transactions/AddInvestmentSlideover.jsx'
import BuySellDetailsSlideover from '../components/transactions/BuySellDetailsSlideover.jsx'
import InvestmentAllocationTable from '../components/transactions/InvestmentAllocationTable.jsx'
import { useParticipant } from '../context/ParticipantContext.jsx'
import { formatMoney, planBalance, planVested } from '../lib/accountSummary'
import {
  BANK_ON_FILE,
  DISTRIBUTION_MODES,
  LOAN_INTEREST_RATE,
  LOAN_PAYMENT_METHODS,
  LOAN_POLICY_COPY,
  LOAN_REPAYMENT_FREQUENCIES,
  LOAN_REPAYMENT_METHODS,
  LOAN_TERMS_COPY,
  LOAN_TYPES,
  NAV_DISCLAIMER,
  REQUEST_DOC_REQUIREMENTS,
  SPOUSAL_CONSENT_DOC,
  WITHDRAWAL_TYPES,
  activeLoanFor,
  blankWithdrawalAllocation,
  computeGrossLoanAmount,
  computeWithdrawalFees,
  estimatePeriodicPayment,
  generateTransactionId,
  hasRestrictedTransfer,
  investmentsForSource,
  loanLimits,
  sourcesFor,
  sumWithdrawalFees,
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
      { id: 'details', title: 'Source Selection' },
      { id: 'summary', title: 'Transfer Request Summary' }
    ]
  },
  rebalance: {
    title: 'New Rebalance Request',
    steps: [
      { id: 'details', title: 'Source Selection' },
      { id: 'summary', title: 'Rebalance Request Summary' }
    ]
  }
}

function blankForm(type) {
  if (type === 'loan') {
    return {
      loanType: '',
      reason: '',
      amount: '',
      entireAmount: '',
      maritalStatus: '',
      repaymentMethod: 'payroll',
      repaymentFrequency: 'monthly',
      years: 1,
      months: 0,
      repaymentStartDate: '',
      paymentMethod: 'eft',
      hasBankOnFile: true,
      addedBank: null,
      docUploaded: false,
      docs: {},
      termsAccepted: false
    }
  }
  if (type === 'withdrawal') {
    return {
      withdrawalType: '',
      withdrawAs: 'onetime',
      entireBalance: '',
      // One allocation per recipient — starts with the participant's own
      // ("Self"); "Add allocation" appends more (e.g. a beneficiary).
      allocations: [blankWithdrawalAllocation()],
      addressChanged: false,
      docUploaded: false,
      termsAccepted: false
    }
  }
  // transfer + rebalance
  return {
    selectedSources: [],
    allocations: {},
    applySameElection: false,
    futureElections: false
  }
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

  // Accepts a plain patch object, or an updater function (f) => patch —
  // the latter reads the *current* form state rather than whatever was in
  // scope when the callback was created, so back-to-back set() calls in the
  // same tick (e.g. uploading two documents) don't clobber each other.
  const set = (patch) => setForm((f) => ({ ...f, ...(typeof patch === 'function' ? patch(f) : patch) }))
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

  const [transactionId] = useState(generateTransactionId)
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
            {/* An ordered list of buttons rather than clickable divs: steps
                are navigation, not headings, and they have to be reachable
                and operable from the keyboard. */}
            <ol className="txn-step-list">
              {wizard.steps.map((s, i) => {
                const complete = i < stepIdx
                const current = i === stepIdx
                const enabled = i <= maxReached
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={`txn-step${complete ? ' complete' : ''}${current ? ' current' : ''}${enabled ? ' enabled' : ''}`}
                      disabled={!enabled}
                      aria-current={current ? 'step' : undefined}
                      onClick={() => goTo(i)}
                    >
                      <span className="num" aria-hidden="true">
                        {complete ? <Check size={13} strokeWidth={3} /> : i + 1}
                      </span>
                      <span className="txn-step-title">{s.title}</span>
                      <span className="sr-only">
                        {complete ? ' (completed)' : current ? ' (current step)' : ' (not yet available)'}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </aside>

          {/* Transfer and rebalance render wide current-vs-target tables, so
              they get more room than the form-style loan/withdrawal steps. */}
          <main className={`txn-main${type === 'transfer' || type === 'rebalance' ? ' txn-main-wide' : ''}`}>
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
              <LoanSteps
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
            {(type === 'transfer' || type === 'rebalance') && (
              <AllocationSteps
                mode={type}
                step={step.id}
                plan={plan}
                form={form}
                set={set}
                onNext={next}
                onBack={back}
                onSubmit={submit}
              />
            )}
          </main>
        </div>
      </div>

      {/* Pops up over the final summary step rather than replacing the page,
          so "Back to Transactions" reads as dismissing a confirmation, not
          navigating away from content that's already gone. */}
      {done && <SubmittedPanel type={type} transactionId={transactionId} navigate={navigate} />}
    </>
  )
}

// Success confirmation as a modal popup over the finished wizard, rather
// than swapping the page content out — the last summary screen stays
// visible (dimmed) behind it, so "submitted" reads as a confirmation of
// what's on screen instead of a navigation away from it.
function SubmittedPanel({ type, transactionId, navigate }) {
  const label = { loan: 'loan', withdrawal: 'withdrawal', transfer: 'transfer', rebalance: 'rebalance' }[type] || 'request'
  const headline = type === 'loan' ? 'Your loan request successfully sent!' : 'Your request successfully sent!'
  const [copied, setCopied] = useState(false)
  const trapRef = useFocusTrap(true)
  const titleId = useId()

  const copyId = () => {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(transactionId)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="enroll-modal-bg" role="presentation">
      <div
        ref={trapRef}
        className="txn-success-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="success-mark" aria-hidden="true" style={{ margin: '0 auto 12px' }}>
          <svg viewBox="0 0 52 52" width="52" height="52">
            <circle className="success-ring" cx="26" cy="26" r="24" />
            <path className="success-check" d="M15.5 27.2l7.2 7.2 14.6-16" />
          </svg>
        </div>
        <h3 id={titleId}>{headline}</h3>
        <p className="hint">Meanwhile use transaction ID to track your {label} status.</p>
        <div className="txn-success-id">
          <span>Transaction ID: {transactionId}</span>
          <button type="button" className="icon-btn" onClick={copyId} aria-label="Copy transaction ID">
            <Copy size={14} strokeWidth={2.2} />
          </button>
          {copied && <span className="txn-success-copied">Copied</span>}
        </div>
        <div className="txn-actions" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/transactions')}>
            Back to Transactions
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Loan ---------------- */

function LoanSteps({ step, plan, participant, form, set, onNext, onBack, onSubmit, onEdit }) {
  const [showPolicy, setShowPolicy] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showAmortization, setShowAmortization] = useState(false)
  const [showAddBank, setShowAddBank] = useState(false)

  // Scenario 2/3: an existing active loan on this plan shrinks the eligible
  // limit dollar-for-dollar (Loan Policy — "50% of vested or $50,000, minus
  // outstanding balance").
  const existingLoan = activeLoanFor(participant, plan)
  const limits = loanLimits(plan, existingLoan?.balance || 0)
  const amount = +form.amount || 0
  const overLimit = amount > limits.max
  const payment = estimatePeriodicPayment(amount, +form.years, +form.months)
  const loanType = LOAN_TYPES.find((l) => l.id === form.loanType)
  const repaymentMethod = LOAN_REPAYMENT_METHODS.find((m) => m.id === form.repaymentMethod)
  const repaymentFrequency = LOAN_REPAYMENT_FREQUENCIES.find((f) => f.id === form.repaymentFrequency)
  const paymentMethod = LOAN_PAYMENT_METHODS.find((m) => m.id === form.paymentMethod)
  const maxTermYears = loanType?.maxYears ?? 5
  const gross = computeGrossLoanAmount(amount)
  const bank = form.addedBank || (form.hasBankOnFile ? BANK_ON_FILE : null)
  // Scenario 6: not vested at all — nothing to borrow against, block the
  // whole wizard before any field entry.
  const notEligible = limits.max <= 0

  if (notEligible) {
    return (
      <div className="txn-card">
        <h3>Loan Details</h3>
        <div className="wd-note warn">
          You're not eligible for a new loan on this plan right now
          {existingLoan ? ' — your outstanding loan already uses your full eligible limit.' : ' — you have no vested balance to borrow against.'}
        </div>
        <div className="txn-actions">
          <span />
          <Link to="/transactions" className="btn btn-primary" style={{ width: 'auto', textDecoration: 'none' }}>
            Back to Transactions
          </Link>
        </div>
      </div>
    )
  }

  if (step === 'details') {
    return (
      <div className="txn-card">
        <div className="txn-summary-head">
          <h3>Loan Details</h3>
          <button type="button" className="txn-summary-edit" onClick={() => setShowPolicy(true)}>
            Policy and procedures
          </button>
        </div>

        {existingLoan && (
          <div className="wd-note">
            You have an outstanding loan with a balance of {formatMoney(existingLoan.balance)}. Your eligible limit
            below already accounts for it.
          </div>
        )}

        <div className="txn-row">
          <Field label="Select Loan type" required note="The Processing time for your loan is 10 days.">
            <select value={form.loanType} onChange={(e) => set({ loanType: e.target.value })}>
              <option value="">Select</option>
              {LOAN_TYPES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Reason for loan">
            <input type="text" placeholder="e.g. Educational purpose" value={form.reason} onChange={(e) => set({ reason: e.target.value })} />
          </Field>
        </div>

        <div className="txn-card txn-card-nested" style={{ marginTop: 18, marginBottom: 0 }}>
          <h4 style={{ margin: '0 0 4px' }}>Loan calculator</h4>
          <p className="hint" style={{ marginTop: 0 }}>
            Enter any two of Loan Request Amount, Periodic Payment, Tenure to auto-compute the third value.
          </p>

          <div className="txn-row">
            <Field label="Interest rate">
              <input type="text" readOnly value={`${LOAN_INTEREST_RATE}%`} />
            </Field>
          </div>

          <div className="txn-row" style={{ marginTop: 14 }}>
            <FieldGroup label="Take entire loan amount" required>
              <div className="txn-radio-row">
                <label className="txn-radio">
                  <input
                    type="radio"
                    name="entire-loan-amount"
                    checked={form.entireAmount === 'yes'}
                    onChange={() => set({ entireAmount: 'yes', amount: String(limits.max) })}
                  />
                  Yes
                </label>
                <label className="txn-radio">
                  <input
                    type="radio"
                    name="entire-loan-amount"
                    checked={form.entireAmount === 'no'}
                    onChange={() => set({ entireAmount: 'no' })}
                  />
                  No
                </label>
              </div>
            </FieldGroup>
          </div>

          <div className="txn-row" style={{ marginTop: 14 }}>
            <Field
              label="Loan amount"
              required
              noteClass={overLimit ? 'warn' : undefined}
              note={`You can make a request from ${formatMoney(limits.min)} to ${formatMoney(
                limits.max
              )} subjected to plan rules & regulations.`}
            >
              <input
                type="number"
                placeholder="Enter amount"
                value={form.amount}
                disabled={form.entireAmount === 'yes'}
                aria-invalid={overLimit || undefined}
                onChange={(e) => set({ amount: e.target.value })}
              />
            </Field>
          </div>

          <div className="txn-summary-head" style={{ marginTop: 24 }}>
            <h4 style={{ margin: 0 }}>Repayment details</h4>
            <button
              type="button"
              className="txn-summary-edit"
              disabled={!amount}
              onClick={() => setShowAmortization(true)}
            >
              View Amortization Schedule
            </button>
          </div>

          <div className="txn-row" style={{ marginTop: 8 }}>
            <FieldGroup label="Loan repayment method" required note={repaymentMethod?.hint}>
              <div className="txn-radio-row txn-radio-col">
                {LOAN_REPAYMENT_METHODS.map((m) => (
                  <label key={m.id} className="txn-radio">
                    <input
                      type="radio"
                      name="loan-repayment-method"
                      checked={form.repaymentMethod === m.id}
                      onChange={() => set({ repaymentMethod: m.id })}
                    />
                    {m.label}
                  </label>
                ))}
              </div>
            </FieldGroup>
            <Field label="Loan repayment frequency" required>
              <select value={form.repaymentFrequency} onChange={(e) => set({ repaymentFrequency: e.target.value })}>
                {LOAN_REPAYMENT_FREQUENCIES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="txn-row" style={{ marginTop: 18, alignItems: 'flex-end' }}>
            <FieldGroup
              label="Length of Loan Term"
              required
              note={`Maximum tenure is ${maxTermYears} year(s) 0 month(s)`}
              tooltip="Changes to the tenure automatically update the periodic payment."
            >
              <div className="txn-tenure-row">
                <input
                  type="number"
                  min={0}
                  aria-label="Loan term years"
                  value={form.years}
                  onChange={(e) => set({ years: Math.max(0, +e.target.value || 0) })}
                />
                <span className="note">Year(s)</span>
                <input
                  type="number"
                  min={0}
                  max={11}
                  aria-label="Loan term months"
                  value={form.months}
                  onChange={(e) => set({ months: Math.max(0, Math.min(11, +e.target.value || 0)) })}
                />
                <span className="note">Month(s)</span>
              </div>
            </FieldGroup>
            <Field label="Periodic Payment">
              <input type="text" readOnly value={payment ? formatMoney(payment) : '—'} />
            </Field>
          </div>

          <div className="txn-row" style={{ marginTop: 18 }}>
            <Field label="First repayment date" required>
              <input
                type="date"
                value={form.repaymentStartDate}
                onChange={(e) => set({ repaymentStartDate: e.target.value })}
              />
            </Field>
          </div>
        </div>

        {/* Scenario 4: married participants need spousal consent — captured
            here so the Documents step can surface the extra required file. */}
        <div className="txn-row" style={{ marginTop: 18 }}>
          <FieldGroup
            label="Marital status"
            required
            noteClass="warn"
            note={
              form.maritalStatus === 'married'
                ? "Spousal consent is required — you'll be asked to upload a signed Spousal Consent Form in the Documents step."
                : undefined
            }
          >
            <div className="txn-radio-row">
              <label className="txn-radio">
                <input
                  type="radio"
                  name="marital-status"
                  checked={form.maritalStatus === 'married'}
                  onChange={() => set({ maritalStatus: 'married' })}
                />
                Married
              </label>
              <label className="txn-radio">
                <input
                  type="radio"
                  name="marital-status"
                  checked={form.maritalStatus === 'single'}
                  onChange={() => set({ maritalStatus: 'single' })}
                />
                Single
              </label>
            </div>
          </FieldGroup>
        </div>

        <div className="txn-actions">
          <span />
          <button
            type="button"
            className="btn btn-primary"
            disabled={
              !form.loanType ||
              !form.entireAmount ||
              !amount ||
              amount < limits.min ||
              overLimit ||
              !form.repaymentStartDate ||
              !form.maritalStatus
            }
            onClick={onNext}
          >
            Continue
          </button>
        </div>

        {showPolicy && <LegalCopySlideover title="Policy and procedures" paragraphs={LOAN_POLICY_COPY} onClose={() => setShowPolicy(false)} />}
        {showAmortization && (
          <AmortizationScheduleSlideover
            principal={amount}
            termMonths={Math.max(1, (+form.years || 0) * 12 + (+form.months || 0))}
            onClose={() => setShowAmortization(false)}
          />
        )}
      </div>
    )
  }

  if (step === 'payment') {
    return (
      <div className="txn-card">
        <h3>Payment &amp; Fee Details</h3>

        <h4>Payment details</h4>
        <div className="txn-row">
          <FieldGroup label="Payment method" required>
            <div className="txn-radio-row txn-radio-col">
              {LOAN_PAYMENT_METHODS.map((m) => (
                <label key={m.id} className="txn-radio">
                  <input
                    type="radio"
                    name="loan-payment-method"
                    checked={form.paymentMethod === m.id}
                    onChange={() => set({ paymentMethod: m.id })}
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </FieldGroup>
        </div>

        {form.paymentMethod === 'eft' && (
          <>
            <h4>Select bank</h4>
            {/* Scenario 5: no bank on file — show an empty state with an
                add-bank action instead of the read-only bank card. */}
            {bank ? (
              <div className="edit-alloc-readcard" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <b>Bank name</b>
                  <span>{bank.bankName}</span>
                </div>
                <div>
                  <b>Account number</b>
                  <span>•••• •••• {bank.last4}</span>
                </div>
                <div>
                  <b>Routing No</b>
                  <span>{bank.routingNo}</span>
                </div>
                <button type="button" className="txn-summary-edit" onClick={() => setShowAddBank(true)}>
                  Edit
                </button>
              </div>
            ) : (
              <div className="wd-note">
                No bank details found.{' '}
                <button type="button" className="txn-summary-edit" onClick={() => setShowAddBank(true)}>
                  Add bank account
                </button>
              </div>
            )}
          </>
        )}

        <h4>Fee Details</h4>
        <div className="wd-fee-card" style={{ marginTop: 0, marginBottom: 0 }}>
          <div className="wd-fee-row">
            <span>Net request amount</span>
            <b>{formatMoney(gross.requested)}</b>
          </div>
          <div className="wd-fee-row">
            <span>Transaction Fee</span>
            <b>{formatMoney(gross.transactionFee)}</b>
          </div>
          <div className="wd-fee-row" style={{ paddingLeft: 16 }}>
            <span>TPA Fee</span>
            <b>{formatMoney(gross.tpaFee)}</b>
          </div>
          <div className="wd-fee-row" style={{ paddingLeft: 16 }}>
            <span>EFT Fee</span>
            <b>{formatMoney(gross.eftFee)}</b>
          </div>
          <div className="wd-fee-row">
            <span>Redemption fee</span>
            <b>{formatMoney(gross.redemptionFee)}</b>
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
          <button
            type="button"
            className="btn btn-primary"
            disabled={form.paymentMethod === 'eft' && !bank}
            onClick={onNext}
          >
            Continue
          </button>
        </div>

        {showAddBank && (
          <AddBankDialog
            bank={bank}
            onCancel={() => setShowAddBank(false)}
            onSave={(b) => {
              set({ addedBank: b, hasBankOnFile: true })
              setShowAddBank(false)
            }}
          />
        )}
      </div>
    )
  }

  if (step === 'documents') {
    const extraDocs = form.maritalStatus === 'married' ? [SPOUSAL_CONSENT_DOC] : []
    return <DocumentsStep type="loan" extraDocs={extraDocs} form={form} set={set} onNext={onNext} onBack={onBack} />
  }

  const docsUploaded = Object.values(form.docs || {}).filter(Boolean).length

  return (
    <SummaryStep title="Loan Request Summary" onBack={onBack} onSubmit={onSubmit} submitDisabled={!form.termsAccepted}>
      <div className="wd-terms" style={{ marginBottom: 18 }}>
        <label>
          <input type="checkbox" checked={form.termsAccepted} onChange={(e) => set({ termsAccepted: e.target.checked })} />
          <span>
            By checking this box, I declare that I have read{' '}
            <button type="button" className="txn-summary-edit" onClick={() => setShowTerms(true)}>
              the terms and conditions
            </button>
            .
          </span>
        </label>
      </div>

      <SummaryRow label="Loan type" value={loanType?.label || '—'} onEdit={() => onEdit(0)} />
      <SummaryRow label="Reason for loan" value={form.reason || '—'} onEdit={() => onEdit(0)} />
      <SummaryRow label="Take entire loan amount" value={form.entireAmount === 'yes' ? 'Yes' : 'No'} onEdit={() => onEdit(0)} />
      <SummaryRow label="Loan amount" value={formatMoney(amount)} onEdit={() => onEdit(0)} />
      <SummaryRow label="Interest rate" value={`${LOAN_INTEREST_RATE}%`} />
      <SummaryRow label="Repayment method" value={repaymentMethod?.label || '—'} onEdit={() => onEdit(0)} />
      <SummaryRow label="Repayment frequency" value={repaymentFrequency?.label || '—'} onEdit={() => onEdit(0)} />
      <SummaryRow label="Loan term" value={`${form.years || 0} yr ${form.months || 0} mo`} onEdit={() => onEdit(0)} />
      <SummaryRow label="First repayment date" value={form.repaymentStartDate || '—'} onEdit={() => onEdit(0)} />
      <SummaryRow label="Periodic payment" value={payment ? formatMoney(payment) : '—'} />
      <SummaryRow label="Marital status" value={form.maritalStatus === 'married' ? 'Married' : 'Single'} onEdit={() => onEdit(0)} />
      <SummaryRow label="Payment method" value={paymentMethod?.label || '—'} onEdit={() => onEdit(1)} />
      {form.paymentMethod === 'eft' && bank && (
        <SummaryRow label="Bank" value={`${bank.bankName} •••• ${bank.last4}`} onEdit={() => onEdit(1)} />
      )}
      <SummaryRow label="Net request amount" value={formatMoney(gross.requested)} />
      <SummaryRow label="Fees" value={formatMoney(gross.transactionFee + gross.redemptionFee)} />
      <SummaryRow label="Gross Loan Amount" value={formatMoney(gross.grossAmount)} />
      <SummaryRow
        label="Documents"
        value={docsUploaded > 0 ? `${String(docsUploaded).padStart(2, '0')} File(s) uploaded` : 'Not uploaded'}
        onEdit={() => onEdit(2)}
      />

      {showTerms && <LegalCopySlideover title="Terms and conditions" paragraphs={LOAN_TERMS_COPY} onClose={() => setShowTerms(false)} />}
    </SummaryStep>
  )
}

function AddBankDialog({ bank, onCancel, onSave }) {
  const [bankName, setBankName] = useState(bank?.bankName || '')
  const [accountNumber, setAccountNumber] = useState('')
  const [routingNo, setRoutingNo] = useState(bank?.routingNo || '')

  return (
    <div className="enroll-modal-bg" onClick={onCancel}>
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-bank-title"
        onClick={(e) => e.stopPropagation()}
        style={{ textAlign: 'left' }}
      >
        <h3 id="add-bank-title" style={{ marginTop: 0 }}>
          Add bank account
        </h3>
        <Field label="Bank name" required>
          <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} />
        </Field>
        <Field label="Account number" required>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="•••• •••• 1234"
          />
        </Field>
        <Field label="Routing No" required>
          <input type="text" value={routingNo} onChange={(e) => setRoutingNo(e.target.value)} />
        </Field>
        <div className="txn-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!bankName || !accountNumber || !routingNo}
            onClick={() => onSave({ bankName, last4: accountNumber.slice(-4), routingNo })}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Withdrawal / Distribution ---------------- */

function WithdrawalSteps({ step, plan, participant, form, set, onNext, onBack, onSubmit, onEdit }) {
  const [showLoanDialog, setShowLoanDialog] = useState(false)
  const [editingAllocationId, setEditingAllocationId] = useState(null)
  const [addingAllocation, setAddingAllocation] = useState(false)
  const withdrawalType = WITHDRAWAL_TYPES.find((t) => t.id === form.withdrawalType)
  const legalName = participant.name
  const originalAddress = `${participant.profile?.address || ''}, ${participant.profile?.city || ''}`.trim()
  const allocations = form.allocations
  const fees = sumWithdrawalFees(allocations, form.withdrawalType)
  const loan = activeLoanFor(participant, plan)
  const allocationsReady = allocations.length > 0 && allocations.every((a) => a.mode && a.amount)
  const editingAllocation = editingAllocationId ? allocations.find((a) => a.id === editingAllocationId) : null

  const patchAllocation = (id, patch) =>
    set((f) => ({ allocations: f.allocations.map((a) => (a.id === id ? { ...a, ...patch } : a)) }))

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
          <Field label="Select withdrawal type" required>
            <select value={form.withdrawalType} onChange={(e) => set({ withdrawalType: e.target.value })}>
              <option value="">Select</option>
              {WITHDRAWAL_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="txn-row" style={{ marginTop: 14 }}>
          <FieldGroup label="Withdraw" required>
            <div className="txn-radio-row txn-radio-col">
              <label className="txn-radio">
                <input
                  type="radio"
                  name="withdraw-as"
                  checked={form.withdrawAs === 'onetime'}
                  onChange={() => set({ withdrawAs: 'onetime' })}
                />
                As one time payment
              </label>
              <label className="txn-radio">
                <input
                  type="radio"
                  name="withdraw-as"
                  checked={form.withdrawAs === 'periodic'}
                  onChange={() => set({ withdrawAs: 'periodic' })}
                />
                As periodic payment
              </label>
            </div>
          </FieldGroup>
          <FieldGroup label="Withdraw entire balance" required>
            <div className="txn-radio-row">
              <label className="txn-radio">
                <input
                  type="radio"
                  name="withdraw-entire-balance"
                  checked={form.entireBalance === 'yes'}
                  onChange={() => chooseEntireBalance('yes')}
                />
                Yes
              </label>
              <label className="txn-radio">
                <input
                  type="radio"
                  name="withdraw-entire-balance"
                  checked={form.entireBalance === 'no'}
                  onChange={() => chooseEntireBalance('no')}
                />
                No
              </label>
            </div>
          </FieldGroup>
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
        <div className="txn-summary-head">
          <h3>Withdrawal Allocation</h3>
          <button type="button" className="btn btn-secondary alloc-add-btn" onClick={() => setAddingAllocation(true)}>
            Add allocation
          </button>
        </div>
        <p className="hint">Review how this withdrawal is allocated, then edit the recipient details if needed.</p>

        <AllocationTable
          allocations={allocations}
          withdrawalTypeId={form.withdrawalType}
          onEdit={setEditingAllocationId}
          onRemove={
            allocations.length > 1
              ? (id) => set((f) => ({ allocations: f.allocations.filter((a) => a.id !== id) }))
              : undefined
          }
        />

        {!allocationsReady && (
          <p className="wd-alloc-incomplete-hint">
            <Info size={14} strokeWidth={2.2} />
            Every recipient needs a distribution mode and amount before you can continue — open "View details" on any
            row still marked Incomplete.
          </p>
        )}

        <div className="txn-actions">
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            Back
          </button>
          <button type="button" className="btn btn-primary" disabled={!allocationsReady} onClick={onNext}>
            Continue
          </button>
        </div>

        {editingAllocation && (
          <EditAllocationSlideover
            allocation={editingAllocation}
            withdrawalTypeId={form.withdrawalType}
            legalName={editingAllocation.recipientType === 'self' ? legalName : editingAllocation.name}
            originalAddress={originalAddress}
            plan={plan}
            onClose={() => setEditingAllocationId(null)}
            onSave={(draft) => {
              patchAllocation(editingAllocation.id, {
                ...draft,
                addressChanged: draft.addressOption === 'custom' && draft.customAddress.trim().length > 0
              })
              setEditingAllocationId(null)
            }}
          />
        )}
        {addingAllocation && (
          <EditAllocationSlideover
            isNew
            allocation={blankWithdrawalAllocation({
              id: `beneficiary-${Date.now()}`,
              recipientType: 'beneficiary',
              name: ''
            })}
            withdrawalTypeId={form.withdrawalType}
            legalName=""
            originalAddress={originalAddress}
            plan={plan}
            onClose={() => setAddingAllocation(false)}
            onSave={(draft) => {
              set((f) => ({ allocations: [...f.allocations, draft] }))
              setAddingAllocation(false)
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
          <FeeAndTaxPanel fees={fees} title="" />
        </div>

        {allocations.some((a) => a.addressChanged) && (
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
      <AllocationTable allocations={allocations} withdrawalTypeId={form.withdrawalType} onEdit={() => onEdit(1)} />

      {allocations.map((a) => {
        const m = DISTRIBUTION_MODES.find((d) => d.id === a.mode)
        if (m?.id !== 'direct') return null
        if (a.paymentMethod === 'check') {
          return (
            <div key={a.id}>
              <SummaryRow
                label={`Mail check payable to (${a.name})`}
                value={a.recipientType === 'self' ? legalName : a.name}
              />
              <SummaryRow label="Address" value={a.customAddress || originalAddress} onEdit={() => onEdit(1)} />
            </div>
          )
        }
        if (a.paymentMethod === 'eft') {
          const bank =
            a.bankOption === 'custom'
              ? {
                  accountHolder: a.accountHolder || (a.recipientType === 'self' ? legalName : a.name),
                  bankName: a.bankName,
                  routingNo: a.routingNo,
                  accountNumber: a.accountNumber
                }
              : {
                  ...BANK_ON_FILE,
                  accountHolder: a.recipientType === 'self' ? legalName : a.name || BANK_ON_FILE.accountHolder
                }
          return (
            <div key={a.id}>
              <SummaryRow label={`EFT bank (${a.name})`} value={bank.bankName || '—'} onEdit={() => onEdit(1)} />
              <SummaryRow label="Account holder" value={bank.accountHolder || '—'} />
              <SummaryRow label="Routing number" value={bank.routingNo || '—'} />
              <SummaryRow label="Account number" value={bank.accountNumber || `•••• ${bank.last4 || ''}`} />
            </div>
          )
        }
        return null
      })}

      <div className="wd-fee-card" style={{ marginTop: 20 }}>
        <FeeAndTaxPanel fees={fees} title="Fee Details" />
      </div>

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

/* ---------------- Transfer / Rebalance ----------------
   Both flows are the same two-step shape — pick sources, retarget the
   investments inside them, review — so they share one implementation and
   differ only in labels and the per-source side panel. */

function AllocationSteps({ mode, step, plan, form, set, onNext, onBack, onSubmit }) {
  const [addingTo, setAddingTo] = useState(null)
  const [buySellFor, setBuySellFor] = useState(null)

  const isRebalance = mode === 'rebalance'
  const afterLabel = isRebalance ? 'After Rebalance' : 'After Transfer'
  const sources = sourcesFor(plan)
  const selectedSources = sources.filter((s) => form.selectedSources.includes(s.id))

  const rowsFor = (source) => form.allocations[source.id] || []
  const sumPct = (rows) => rows.reduce((sum, r) => sum + (+r.afterPct || 0), 0)
  const ready =
    selectedSources.length > 0 &&
    selectedSources.every((s) => Math.round(sumPct(rowsFor(s))) === 100 && !hasRestrictedTransfer(rowsFor(s)))

  const toggleSource = (source) => {
    set((f) => {
      const on = f.selectedSources.includes(source.id)
      const selected = on
        ? f.selectedSources.filter((id) => id !== source.id)
        : [...f.selectedSources, source.id]
      // Seed a source's rows the first time it's checked, starting the target
      // percentages at the current holding so the table opens balanced.
      const allocations = { ...f.allocations }
      if (!on && !allocations[source.id]) {
        allocations[source.id] = investmentsForSource(plan, source).map((r) => ({ ...r, afterPct: r.pct }))
      }
      return { selectedSources: selected, allocations }
    })
  }

  const setPct = (sourceId, rowId, value) => {
    const pct = Math.max(0, Math.min(100, +value || 0))
    set((f) => {
      const allocations = { ...f.allocations }
      // "Apply same election to all selected sources" mirrors every edit into
      // each selected source that holds the same fund.
      const targets = f.applySameElection ? f.selectedSources : [sourceId]
      targets.forEach((id) => {
        if (!allocations[id]) return
        allocations[id] = allocations[id].map((r) => (r.id === rowId ? { ...r, afterPct: pct } : r))
      })
      return { allocations }
    })
  }

  const addInvestments = (sourceId, picks) => {
    set((f) => {
      const allocations = { ...f.allocations }
      const existing = allocations[sourceId] || []
      allocations[sourceId] = [
        ...existing,
        ...picks.map((p) => ({ id: p.id, name: p.name, nav: p.nav, units: 0, amount: 0, pct: 0, afterPct: 0 }))
      ]
      return { allocations }
    })
    setAddingTo(null)
  }

  const sourcePanels = selectedSources.map((source) => {
    const rows = rowsFor(source)
    return (
      <div key={source.id} className="alloc-panel">
        <div className="alloc-panel-head">
          <div>
            <b>{source.name} investments</b>
            <span>{String(rows.length).padStart(2, '0')} Investment(s)</span>
          </div>
          {isRebalance ? (
            <button type="button" className="txn-summary-edit" onClick={() => setBuySellFor(source)}>
              View Buy/sell details
            </button>
          ) : (
            step === 'details' && (
              <button type="button" className="btn btn-secondary alloc-add-btn" onClick={() => setAddingTo(source)}>
                Add investment
              </button>
            )
          )}
        </div>

        {isRebalance && (
          <p className="alloc-nav-note">
            <AlertTriangle size={13} strokeWidth={2.4} /> {NAV_DISCLAIMER}
          </p>
        )}

        <InvestmentAllocationTable
          rows={rows}
          sourceTotal={source.amount}
          afterLabel={afterLabel}
          editable={step === 'details'}
          onChangePct={(rowId, value) => setPct(source.id, rowId, value)}
        />
      </div>
    )
  })

  if (step === 'details') {
    return (
      <div className="txn-card">
        <h3>Source Selection</h3>

        <div className="alloc-sources">
          <b>Sources</b>
          <p className="hint">Select sources need to be {isRebalance ? 'rebalanced' : 'transferred'}</p>
          <div className="alloc-source-grid">
            {sources.map((s) => {
              const on = form.selectedSources.includes(s.id)
              return (
                <label key={s.id} className={`alloc-source${on ? ' on' : ''}`}>
                  <input type="checkbox" checked={on} onChange={() => toggleSource(s)} />
                  <span>
                    <b>{s.name}</b>
                    <small>{formatMoney(s.amount)}</small>
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        <div className="alloc-inv-head">
          <div>
            <b>Investments</b>
            <p className="hint">Following investments will be {isRebalance ? 'rebalanced' : 'transferred'}</p>
          </div>
          {!isRebalance && (
            <label className="alloc-apply-all">
              <input
                type="checkbox"
                checked={form.applySameElection}
                disabled={form.selectedSources.length < 2}
                onChange={(e) => set({ applySameElection: e.target.checked })}
              />
              <span>Apply same election to all selected sources</span>
            </label>
          )}
        </div>

        {sourcePanels.length ? (
          sourcePanels
        ) : (
          <div className="wd-note">Select at least one source to choose how it should be allocated.</div>
        )}

        <div className="txn-actions">
          <span />
          <button type="button" className="btn btn-primary" disabled={!ready} onClick={onNext}>
            Continue
          </button>
        </div>

        {addingTo && (
          <AddInvestmentSlideover
            existingIds={rowsFor(addingTo).map((r) => r.id)}
            onClose={() => setAddingTo(null)}
            onSave={(picks) => addInvestments(addingTo.id, picks)}
          />
        )}
        {buySellFor && (
          <BuySellDetailsSlideover
            sourceName={buySellFor.name}
            rows={rowsFor(buySellFor)}
            sourceTotal={buySellFor.amount}
            onClose={() => setBuySellFor(null)}
          />
        )}
      </div>
    )
  }

  return (
    <SummaryStep
      title={isRebalance ? 'Rebalance Request Summary' : 'Transfer Request Summary'}
      onBack={onBack}
      onSubmit={onSubmit}
    >
      <div className="alloc-inv-head">
        <b>Sources &amp; Investments</b>
        {!isRebalance && (
          <label className="alloc-apply-all">
            <input
              type="checkbox"
              checked={form.futureElections}
              onChange={(e) => set({ futureElections: e.target.checked })}
            />
            <span>Update same investment elections for future contributions</span>
          </label>
        )}
      </div>

      {sourcePanels}

      {buySellFor && (
        <BuySellDetailsSlideover
          sourceName={buySellFor.name}
          rows={rowsFor(buySellFor)}
          sourceTotal={buySellFor.amount}
          onClose={() => setBuySellFor(null)}
        />
      )}
    </SummaryStep>
  )
}

/* ---------------- Shared steps ---------------- */

function DocumentsStep({ type, extraDocs = [], form, set, onNext, onBack }) {
  const docs = [...(REQUEST_DOC_REQUIREMENTS[type] || []), ...extraDocs]
  const docsState = form.docs || {}
  const setDocUploaded = (id) => {
    // Functional patch so two uploads triggered in the same tick (e.g. two
    // required documents) both apply instead of the second clobbering the
    // first via a stale `docsState` closure.
    set((f) => {
      const nextDocs = { ...(f.docs || {}), [id]: true }
      // `docUploaded` stays in sync as "all required docs uploaded" so single-doc
      // flows (withdrawal/transfer) and their Summary rows keep working unchanged.
      const allRequiredDone = docs.filter((d) => d.required).every((d) => nextDocs[d.id])
      return { docs: nextDocs, docUploaded: allRequiredDone }
    })
  }
  const allRequiredDone = docs.filter((d) => d.required).every((d) => docsState[d.id])

  return (
    <div className="txn-card">
      <h3>Upload Documents</h3>
      {docs.map((d) => (
        <DocumentUploadBlock key={d.id} doc={d} uploaded={!!docsState[d.id]} onUploaded={() => setDocUploaded(d.id)} />
      ))}
      <div className="txn-actions">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn btn-primary" disabled={docs.some((d) => d.required) && !allRequiredDone} onClick={onNext}>
          Continue
        </button>
      </div>
    </div>
  )
}

function DocumentUploadBlock({ doc, uploaded, onUploaded }) {
  const [mode, setMode] = useState('manual')
  return (
    <div style={{ marginBottom: 16 }}>
      <span className="txn-doc-required">{doc.required ? 'Required' : 'Not required'}</span>
      <div className="txn-upload">
        <div className="tabs2">
          <button type="button" className={mode === 'manual' ? 'on' : ''} onClick={() => setMode('manual')}>
            Upload manually
          </button>
          <button type="button" className={mode === 'esign' ? 'on' : ''} onClick={() => setMode('esign')}>
            Use E-signature
          </button>
        </div>
        <p style={{ fontWeight: 700, color: 'var(--ink)' }}>{doc.label}</p>
        {mode === 'manual' ? (
          <>
            <button type="button" className="btn btn-secondary" onClick={onUploaded}>
              {uploaded ? 'Replace file' : 'Browse or drag & drop to upload'}
            </button>
            <p>Accepted formats: jpeg, png, jpg, pdf, word · Max file size 5MB</p>
          </>
        ) : (
          <button type="button" className="btn btn-secondary" onClick={onUploaded}>
            Send for e-signature
          </button>
        )}
        {uploaded && <p style={{ color: 'var(--green)', fontWeight: 700 }}>✓ Received</p>}
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

// Recipient/Tax/Fee/Penalty/Amount table used by both the Withdrawal
// Allocation step and the Summary step — one row per allocation (Self plus
// any added beneficiaries), each with its own "View details" edit link.
// `onRemove`, when given, adds a "Remove" action (never offered for the
// last remaining allocation — there must always be at least one recipient).
function AllocationTable({ allocations, withdrawalTypeId, onEdit, onRemove }) {
  return (
    <div className="table-wrap">
      <table className="wd-alloc-table">
        <thead>
          <tr>
            <th scope="col">Recipient</th>
            <th scope="col" className="num">Tax</th>
            <th scope="col" className="num">Fee</th>
            <th scope="col" className="num">Penalty</th>
            <th scope="col" className="num">Amount</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {allocations.map((a) => {
            const incomplete = !a.mode || !a.amount
            const rowFees = computeWithdrawalFees(a.amount, withdrawalTypeId, a.paymentMethod)
            return (
              <tr key={a.id} className={incomplete ? 'wd-alloc-incomplete' : undefined}>
                <td>{a.name || (a.recipientType === 'self' ? 'Self' : 'Beneficiary')}</td>
                {incomplete ? (
                  <td className="num wd-alloc-incomplete-cell" colSpan={4}>
                    Incomplete — add distribution mode and amount
                  </td>
                ) : (
                  <>
                    <td className="num">{formatMoney(rowFees.federalTax)}</td>
                    <td className="num">{formatMoney(rowFees.feeAndTax - rowFees.federalTax)}</td>
                    <td className="num">{formatMoney(rowFees.penalty)}</td>
                    <td className="num">{formatMoney(rowFees.requested)}</td>
                  </>
                )}
                <td className="num wd-alloc-actions">
                  <button type="button" className="wd-alloc-edit" onClick={() => onEdit(a.id)}>
                    View details
                  </button>
                  {onRemove && (
                    <button type="button" className="wd-alloc-remove" onClick={() => onRemove(a.id)}>
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
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
