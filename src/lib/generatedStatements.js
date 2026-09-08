// Prototype-only persistence for statements generated from the Documents
// page's "Generate Statement" action -- sessionStorage-backed, scoped per
// participant. Each generate click creates a real new record (not a
// re-used mock row), so the Documents list actually grows and the newest
// statement is always the one just generated.
const GENERATED_STATEMENTS_KEY = 'saturnaGeneratedStatements'

function todayLabel() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getGeneratedStatements(participantId) {
  try {
    const all = JSON.parse(sessionStorage.getItem(GENERATED_STATEMENTS_KEY) || '{}')
    return all[participantId] || []
  } catch {
    return []
  }
}

// planName must be a real, non-empty value -- a malformed call (missing
// plan, e.g.) throws instead of silently writing a broken record, so a
// genuine failure surfaces as the error toast rather than a blank
// document appearing in the list.
export function addGeneratedStatement(participantId, { planName, periodLabel }) {
  if (!participantId) throw new Error('Missing participant for statement generation.')
  if (!planName) throw new Error('Select a plan before generating a statement.')

  const doc = {
    id: `gen-${Date.now()}`,
    name: `${planName} Statement_${new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-')}`,
    type: 'Quarterly Fee Disclosure',
    date: todayLabel(),
    plan: planName,
    period: periodLabel,
    generated: true
  }

  try {
    const all = JSON.parse(sessionStorage.getItem(GENERATED_STATEMENTS_KEY) || '{}')
    all[participantId] = [doc, ...(all[participantId] || [])]
    sessionStorage.setItem(GENERATED_STATEMENTS_KEY, JSON.stringify(all))
  } catch {
    /* sessionStorage unavailable (private mode, etc.) -- the record still
       renders for this render cycle via the caller's local state, it just
       won't survive a reload. Not a generation failure. */
  }

  return doc
}
