export const DOCUMENT_TYPES = [
  'Annual Fee Disclosure',
  'Quarterly Fee Disclosure',
  'Summary Plan Description',
  'Enrollment Notice',
  'Investment & Fee Change Notice',
  'Plan Document'
]

export const PLAN_DOCS = [
  {
    id: 'spd',
    name: 'Summary Plan Description',
    type: 'Summary Plan Description',
    date: 'Jan 1, 2026',
    plan: 'LendGuard 401(k) Plan'
  },
  {
    id: 'fees',
    name: 'Participant Fee Disclosure (404a-5)',
    type: 'Annual Fee Disclosure',
    date: 'Jan 1, 2026',
    plan: 'LendGuard 401(k) Plan'
  },
  {
    id: 'psp-spd',
    name: 'Profit Sharing Plan Document',
    type: 'Plan Document',
    date: 'Jan 1, 2026',
    plan: 'LendGuard Profit Sharing Plan'
  },
  {
    id: 'qdia',
    name: 'QDIA Notice',
    type: 'Investment & Fee Change Notice',
    date: 'Mar 1, 2026',
    plan: 'LendGuard 401(k) Plan'
  }
]

export const STATEMENTS = {
  'auto-enrolled': [
    { id: 'q4-25', name: 'Q4 2025 Account Statement', type: 'Quarterly Fee Disclosure', date: 'Jan 15, 2026', plan: 'LendGuard 401(k) Plan' },
    { id: 'jan-26', name: 'January 2026 Activity Statement', type: 'Quarterly Fee Disclosure', date: 'Feb 5, 2026', plan: 'LendGuard 401(k) Plan' },
    { id: 'enroll', name: 'Enrollment Notice_08-12-2026', type: 'Enrollment Notice', date: 'Aug 12, 2026', plan: 'LendGuard 401(k) Plan' }
  ],
  'not-eligible': [],
  'eligible-not-enrolled': [],
  'eligible-enrolled': [
    { id: 'q4-25', name: 'Q4 2025 Account Statement', type: 'Quarterly Fee Disclosure', date: 'Jan 15, 2026', plan: 'LendGuard 401(k) Plan' },
    { id: 'q3-25', name: 'Q3 2025 Account Statement', type: 'Quarterly Fee Disclosure', date: 'Oct 12, 2025', plan: 'LendGuard 401(k) Plan' },
    { id: 'annual-25', name: '2025 Annual Fee Disclosure', type: 'Annual Fee Disclosure', date: 'Jan 31, 2026', plan: 'LendGuard 401(k) Plan' }
  ],
  'opted-out': [
    { id: 'opt-out', name: 'Opt-Out Confirmation', type: 'Enrollment Notice', date: 'Jan 18, 2026', plan: 'LendGuard 401(k) Plan' }
  ]
}
