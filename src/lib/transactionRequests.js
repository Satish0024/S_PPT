import { readSession, writeSession } from '../data/participants.js'
import { formatMoney, generateTransactionId, requestsFor } from '../data/transactions.js'

export const TRANSACTION_REQUESTS_KEY = 'lendguardTransactionRequests'

export function loadStoredRequests(participantId) {
  const all = readSession(TRANSACTION_REQUESTS_KEY) || {}
  return all[participantId] || []
}

export function saveTransactionRequest(participantId, request) {
  const all = readSession(TRANSACTION_REQUESTS_KEY) || {}
  const existing = all[participantId] || []
  all[participantId] = [request, ...existing]
  writeSession(TRANSACTION_REQUESTS_KEY, all)
  return request
}

export function allRequestsFor(participant) {
  const stored = loadStoredRequests(participant.id)
  const seeded = requestsFor(participant)
  const seen = new Set(stored.map((r) => r.id))
  return [...stored, ...seeded.filter((r) => !seen.has(r.id))]
}

export function buildRequestRecord({
  type,
  typeLabel,
  plan,
  amount,
  status = 'Pending',
  extra = {},
}) {
  const now = new Date()
  const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const amountLabel =
    typeof amount === 'number' ? formatMoney(amount) : amount || '—'
  return {
    id: `req-${generateTransactionId()}`,
    type,
    typeLabel,
    plan: plan?.name || plan || '—',
    amount: amountLabel,
    date,
    status,
    ...extra,
  }
}
