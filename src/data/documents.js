export const PLAN_DOCS = [
  { id: 'spd', name: 'Summary Plan Description', type: 'Plan Document', date: 'Jan 1, 2026', plan: 'Saturna 401(k) Plan' },
  { id: 'fees', name: 'Participant Fee Disclosure (404a-5)', type: 'Plan Document', date: 'Jan 1, 2026', plan: 'Saturna 401(k) Plan' },
  { id: 'psp-spd', name: 'Profit Sharing Plan Document', type: 'Plan Document', date: 'Jan 1, 2026', plan: 'Saturna Profit Sharing Plan' },
  { id: 'qdia', name: 'QDIA Notice', type: 'Notice', date: 'Mar 1, 2026', plan: 'Saturna 401(k) Plan' }
]

export const STATEMENTS = {
  'auto-enrolled': [
    { id: 'q4-25', name: 'Q4 2025 Account Statement', type: 'Statement', date: 'Jan 15, 2026', plan: 'Saturna 401(k) Plan' },
    { id: 'jan-26', name: 'January 2026 Activity Statement', type: 'Statement', date: 'Feb 5, 2026', plan: 'Saturna 401(k) Plan' },
    { id: 'loan', name: 'Loan Amortization Schedule', type: 'Loan Document', date: 'Jan 12, 2026', plan: 'Saturna 401(k) Plan' }
  ],
  'not-eligible': [],
  'eligible-not-enrolled': [],
  'eligible-enrolled': [
    { id: 'q4-25', name: 'Q4 2025 Account Statement', type: 'Statement', date: 'Jan 15, 2026', plan: 'Saturna 401(k) Plan' },
    { id: 'q3-25', name: 'Q3 2025 Account Statement', type: 'Statement', date: 'Oct 12, 2025', plan: 'Saturna 401(k) Plan' },
    { id: 'q2-25', name: 'Q2 2025 Account Statement', type: 'Statement', date: 'Jul 11, 2025', plan: 'Saturna 401(k) Plan' },
    { id: 'tax-25', name: '2025 Form 5498', type: 'Tax Document', date: 'Jan 31, 2026', plan: 'Saturna 401(k) Plan' }
  ],
  'opted-out': [
    { id: 'opt-out', name: 'Opt-Out Confirmation', type: 'Notice', date: 'Jan 18, 2026', plan: 'Saturna 401(k) Plan' }
  ]
}
