export function parseMoney(value) {
  if (value == null || value === '—' || value === '') return 0
  const n = Number(String(value).replace(/[^0-9.-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

export function formatMoney(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export function formatPct(n) {
  return `${n.toFixed(2)}%`
}

export function planCode(meta) {
  return String(meta || '').match(/ID\s+(\d+)/i)?.[1] || '—'
}

export function planBalance(plan) {
  return parseMoney(plan.stats?.balance || plan.details?.balance)
}

export function planVested(plan) {
  return parseMoney(plan.stats?.vested || plan.details?.vested)
}

export function isSummaryPlan(plan) {
  if (plan.badge === 'Not Eligible' || plan.badgeClass === 'muted' || plan.cardClass === 'ineligible') {
    return false
  }
  return planBalance(plan) > 0
}

export function hasAccountSummary(participant) {
  return (participant?.plans || []).some(isSummaryPlan)
}

const COLORS = ['#e05a4f', '#5ba3d9', '#1a9d63', '#7c6bc4', '#e08a3a', '#0284c7', '#d4a017']

// Some funds hold more than one asset type (e.g. a target-date or balanced
// fund blends stock and bond), so each asset class maps to an array of the
// categories it's made up of rather than a single label.
const ASSET_CATEGORY = {
  'U.S. Equity': ['Stock'],
  'International Equity': ['Stock'],
  'U.S. Bond': ['Bond'],
  'International Bond': ['Bond'],
  'Target-Date': ['Stock', 'Bond'],
  Balanced: ['Stock', 'Bond']
}

export function assetCategory(asset) {
  return ASSET_CATEGORY[asset] || ['Other']
}

function toRows(items, total) {
  if (!items?.length || total <= 0) return []
  return items
    .filter((item) => item.amount > 0)
    .map((item, i) => ({
      id: `${item.name}-${i}`,
      name: item.name,
      asset: item.asset || '',
      amount: item.amount,
      vested: item.vested ?? 0,
      price: item.price ?? null,
      units: item.units ?? null,
      color: COLORS[i % COLORS.length],
      pct: total ? (item.amount / total) * 100 : 0
    }))
}

// Groups investment rows by their asset class (e.g. "U.S. Equity") into one
// row per class, each carrying its member investments so the summary table
// can expand a class row to show the underlying holdings — same accordion
// pattern as the Investments tab, just grouped a level up.
function toAssetClassRows(investments, total) {
  const rows = toRows(investments, total)
  if (!rows.length) return []
  const byClass = new Map()
  rows.forEach((row) => {
    const key = row.asset || 'Other'
    if (!byClass.has(key)) byClass.set(key, [])
    byClass.get(key).push(row)
  })
  return Array.from(byClass.entries()).map(([asset, members], i) => {
    const amount = members.reduce((sum, m) => sum + m.amount, 0)
    return {
      id: `class-${asset}-${i}`,
      name: asset,
      asset,
      amount,
      color: COLORS[i % COLORS.length],
      pct: total ? (amount / total) * 100 : 0,
      members
    }
  })
}

export function summaryForPlan(plan) {
  const balance = planBalance(plan)
  const vested = planVested(plan)
  return {
    balance,
    vested,
    sources: toRows(plan.sources, balance),
    investments: toRows(plan.investments, balance),
    assetClasses: toAssetClassRows(plan.investments, balance)
  }
}
