import { TrendingDown, TrendingUp } from 'lucide-react'

export function formatReturn(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return `${n > 0 ? '+' : ''}${n.toFixed(2)}%`
}

export default function PlanReturn({ value }) {
  const n = Number(value)
  const pct = formatReturn(n)
  if (!pct) return null
  const up = n >= 0
  const Icon = up ? TrendingUp : TrendingDown

  return (
    <span className={`plan-return ${up ? 'pos' : 'neg'}`} title="Rate Of Return" aria-label={`Rate of return ${pct} year to date`}>
      <Icon size={13} strokeWidth={2.4} aria-hidden="true" />
      <b>{pct}</b>
      <i>YTD</i>
    </span>
  )
}
