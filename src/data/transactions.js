import { formatMoney, isSummaryPlan, parseMoney, planBalance, planVested } from '../lib/accountSummary'

export const TRANSACTION_TYPES = [
  {
    id: 'loan',
    label: 'Loan',
    hint: 'Borrow money from your account. Interest applies.',
    to: (planId) => `/transactions/request/loan?plan=${planId}`
  },
  {
    id: 'withdrawal',
    label: 'Withdrawal',
    hint: 'Taxes and penalties may apply.',
    to: (planId) => `/transactions/request/withdrawal?plan=${planId}`
  },
  {
    id: 'transfer',
    label: 'Transfer',
    hint: 'Manage money across your investments.',
    to: (planId) => `/transactions/request/transfer?plan=${planId}`
  }
]

// A plan is transaction-eligible only once it holds a balance participants can
// actually act on — mirrors how Account Summary decides which plans to show.
export function isTransactablePlan(plan) {
  return isSummaryPlan(plan) && planBalance(plan) > 0
}

export function transactablePlans(participant) {
  return (participant.plans || []).filter(isTransactablePlan)
}

// Loans and withdrawals need real cash to draw from; a transfer only needs an
// existing balance to reallocate, which is already covered by isTransactablePlan.
export function canRequest(plan, typeId) {
  if (!isTransactablePlan(plan)) return false
  if (typeId === 'loan' || typeId === 'withdrawal') return planVested(plan) > 0
  return true
}

// A participant's personal eligible maximum is the lesser of 50% of vested
// balance and the plan-wide cap, with a $300 floor — a simplified stand-in for
// the real regulatory calculation, kept in one place so it's never hardcoded
// per screen.
const PLAN_WIDE_LOAN_CAP = 50000
const LOAN_FLOOR = 300

export function loanLimits(plan) {
  const vested = planVested(plan)
  const max = Math.max(LOAN_FLOOR, Math.min(PLAN_WIDE_LOAN_CAP, Math.round(vested * 0.5)))
  return { min: LOAN_FLOOR, max }
}

// Simple daily-accrual estimate used by the loan calculator slideover — not
// a real amortization schedule, just enough to show a plausible principal +
// interest breakdown for a target catch-up or payoff date.
export function computeLoanPayoff({ balance, targetDate, mode, aprPct = 8.5, missedPayments = 2, monthlyPayment = 0 }) {
  const today = new Date()
  const target = targetDate ? new Date(targetDate) : today
  const days = Math.max(0, Math.round((target - today) / (1000 * 60 * 60 * 24)))
  const dailyRate = aprPct / 100 / 365

  if (mode === 'catchup') {
    const principal = Math.round(monthlyPayment * missedPayments * 100) / 100
    const interest = Math.round(principal * dailyRate * days * 100) / 100
    return { principal, interest, total: Math.round((principal + interest) * 100) / 100, days }
  }

  const principal = Math.round((balance || 0) * 100) / 100
  const interest = Math.round(principal * dailyRate * days * 100) / 100
  return { principal, interest, total: Math.round((principal + interest) * 100) / 100, days }
}

export function estimatePeriodicPayment(amount, years, months, aprPct = 8.5) {
  const totalMonths = Math.max(1, (years || 0) * 12 + (months || 0))
  const monthlyRate = aprPct / 100 / 12
  if (!amount || amount <= 0) return 0
  if (monthlyRate === 0) return amount / totalMonths
  const payment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths))
  return Math.round(payment * 100) / 100
}

export const LOAN_TYPES = [
  { id: 'general', label: 'General Purpose', hint: 'For any reason — max term 5 years.', maxYears: 5 },
  { id: 'residential', label: 'Residential', hint: 'To buy a primary residence — max term 15 years.', maxYears: 15 }
]

export const DISTRIBUTION_MODES = [
  { id: 'direct', label: 'Direct Distribution', hint: 'A check is mailed or funds are sent to your bank account.' },
  { id: 'rollover', label: 'Rollover', hint: 'Move funds directly into another employer plan.' },
  { id: 'ira', label: 'IRA Account', hint: 'Move funds directly into an IRA account.' }
]

export const REQUEST_DOC_REQUIREMENTS = {
  loan: [{ id: 'promissory', label: 'Promissory Note', required: true }],
  withdrawal: [{ id: 'distribution-form', label: 'Distribution Request Form', required: true }],
  transfer: []
}

export function requestStatusTone(status) {
  if (status === 'Approved' || status === 'Completed') return 'good'
  if (status === 'Pending' || status === 'In Review') return 'ok'
  return 'warn'
}

// Mock in-flight/completed requests, keyed by participant id — stands in for a
// real transaction-request service.
export const TRANSACTION_REQUESTS = {
  'auto-enrolled': [
    {
      id: 'req-1001',
      type: 'loan',
      typeLabel: 'Loan',
      plan: 'Saturna 401(k) Plan',
      amount: '$2,500.00',
      date: 'Jan 10, 2026',
      status: 'Approved',
      // Outstanding-loan fields used by the loan calculator slideover.
      balance: 1840,
      monthlyPayment: 214.6
    }
  ]
}

export function requestsFor(participant) {
  return TRANSACTION_REQUESTS[participant.id] || []
}

export { formatMoney, parseMoney, planBalance, planVested }
