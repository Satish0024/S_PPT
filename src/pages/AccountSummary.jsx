import { Fragment, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArcElement, Chart as ChartJS, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { ArrowLeft, ChevronDown, Database, Wallet } from 'lucide-react'
import { useParticipant } from '../context/ParticipantContext.jsx'
import {
  assetCategory,
  formatMoney,
  formatPct,
  isSummaryPlan,
  planBalance,
  planCode,
  planVested,
  summaryForPlan
} from '../lib/accountSummary'

const CATEGORY_CLASS = { Stock: 'is-stock', Bond: 'is-bond', Other: 'is-other' }

function formatUnits(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
}
import '../styles/account-summary.css'

ChartJS.register(ArcElement, Tooltip)

const TABS = [
  { id: 'sources', label: 'Sources', icon: Database },
  { id: 'investments', label: 'Investments', icon: Wallet }
]

function fade(hex, on) {
  if (on) return hex
  const n = hex.replace('#', '')
  const r = parseInt(n.slice(0, 2), 16)
  const g = parseInt(n.slice(2, 4), 16)
  const b = parseInt(n.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, 0.22)`
}

export default function AccountSummary() {
  const { participant } = useParticipant()
  const [params] = useSearchParams()
  const plans = useMemo(
    () => participant.plans.filter(isSummaryPlan),
    [participant]
  )
  const requested = params.get('plan')
  const fallback = plans[0]?.id
  const [planId, setPlanId] = useState(
    plans.some((p) => p.id === requested) ? requested : fallback
  )
  const [tab, setTab] = useState('sources')
  const [active, setActive] = useState(null)
  const [expandedRow, setExpandedRow] = useState(null)

  const plan = plans.find((p) => p.id === planId) || plans[0]
  const summary = useMemo(() => (plan ? summaryForPlan(plan) : { balance: 0, vested: 0, sources: [], investments: [] }), [plan])
  const rows = tab === 'sources' ? summary.sources : summary.investments
  const highlight = rows[active] || null

  const chart = useMemo(() => {
    if (!rows.length) return null
    return {
      labels: rows.map((r) => r.name),
      datasets: [
        {
          data: rows.map((r) => r.amount),
          backgroundColor: rows.map((r, i) => fade(r.color, active == null || active === i)),
          borderWidth: 0,
          spacing: 0,
          hoverOffset: 0,
          borderRadius: 0
        }
      ]
    }
  }, [rows, active])

  const options = useMemo(
    () => ({
      cutout: '68%',
      maintainAspectRatio: false,
      layout: { padding: 0 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const row = rows[ctx.dataIndex]
              if (!row) return ''
              return ` ${formatMoney(row.amount)}  ${formatPct(row.pct)}`
            }
          }
        }
      },
      onHover: (_, elements) => {
        const next = elements[0]?.index ?? null
        setActive((prev) => (prev === next ? prev : next))
      }
    }),
    [rows]
  )

  const empty = !rows.length

  return (
    <div className="page-body as-page">
      <div className="hi-bar">
        <div>
          <Link to="/" className="text-link pr-back">
            <ArrowLeft size={16} strokeWidth={2.2} />
            Dashboard
          </Link>
          <h1>Account summary</h1>
          <p className="pr-intro">View balances by sources or by investments</p>
        </div>
      </div>

      <div className="as-shell">
        <nav className="as-plans" aria-label="Plans">
          {plans.length === 0 ? (
            <p className="as-plans-empty">No plans with a balance to show.</p>
          ) : (
            plans.map((item) => {
            const on = item.id === plan.id
            const bal = planBalance(item)
            const vest = planVested(item)
            return (
              <button
                key={item.id}
                type="button"
                className={on ? 'on' : ''}
                onClick={() => {
                  setPlanId(item.id)
                  setActive(null)
                  setExpandedRow(null)
                }}
              >
                <div className="as-plan-top">
                  <strong>{item.name}</strong>
                  <span className={`plan-badge ${item.badgeClass || ''}`}>{item.badge}</span>
                </div>
                <div className="as-plan-meta">
                  Plan ID {planCode(item.meta)} · Type {item.type}
                </div>
                <div className="as-plan-stats">
                  <div>
                    <span>Account balance</span>
                    <b>{formatMoney(bal)}</b>
                  </div>
                  <div>
                    <span>Vested balance</span>
                    <b className="vested">{formatMoney(vest)}</b>
                  </div>
                </div>
              </button>
            )
          })
          )}
        </nav>

        {plan ? (
          <section className="panel as-main">
          <div className="as-main-h">
            <div>
              <h2>{plan.name}</h2>
              <p>
                Account {formatMoney(summary.balance)}
                <span aria-hidden="true"> · </span>
                Vested {formatMoney(summary.vested)}
              </p>
            </div>
            {plan.noticeLink?.details ? (
              <Link to={`/plans/${plan.id}`} className="text-link">
                View plan details
              </Link>
            ) : null}
          </div>

          <div className="as-tabs" role="tablist" aria-label="Balance view">
            {TABS.map((item) => {
              const Icon = item.icon
              const on = tab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  className={on ? 'on' : ''}
                  onClick={() => {
                    setTab(item.id)
                    setActive(null)
                    setExpandedRow(null)
                  }}
                >
                  <span className="pr-nav-ico" aria-hidden="true">
                    <Icon size={15} strokeWidth={2.1} />
                  </span>
                  {item.label}
                </button>
              )
            })}
          </div>

          {empty ? (
            <div className="as-empty">
              <p>No balance to show for this plan yet.</p>
            </div>
          ) : (
            <>
              <div className="as-viz">
                <div className="as-donut" onMouseLeave={() => setActive(null)}>
                  <Doughnut data={chart} options={options} />
                  <div className="as-donut-center">
                    <small>{highlight ? highlight.name : 'Account balance'}</small>
                    <b>{formatMoney(highlight ? highlight.amount : summary.balance)}</b>
                    <em>{highlight ? formatPct(highlight.pct) : '100.00%'}</em>
                  </div>
                </div>
                <ul className="as-legend">
                  {rows.map((row, i) => (
                    <li key={row.id}>
                      <button
                        type="button"
                        className={active === i ? 'on' : ''}
                        onMouseEnter={() => setActive(i)}
                        onMouseLeave={() => setActive(null)}
                        onFocus={() => setActive(i)}
                        onBlur={() => setActive(null)}
                      >
                        <i style={{ background: row.color }} aria-hidden="true" />
                        <span className="as-leg-copy">
                          <b>{row.name}</b>
                          {row.asset ? <small>{row.asset}</small> : null}
                        </span>
                        <span className="as-leg-amt">
                          <b>{formatMoney(row.amount)}</b>
                          <small>{formatPct(row.pct)}</small>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="as-table-wrap">
                <table className={tab === 'investments' ? 'as-table-accordion' : ''}>
                  <thead>
                    <tr>
                      <th>{tab === 'sources' ? 'Source' : 'Investment'}</th>
                      {tab === 'investments' ? <th className="num">Units</th> : null}
                      <th className="num">Balance</th>
                      <th className="num">Percent</th>
                      {tab === 'sources' ? <th className="num">Vested</th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => {
                      const isInvestment = tab === 'investments'
                      const isOpen = isInvestment && expandedRow === row.id
                      return (
                        <Fragment key={row.id}>
                          <tr
                            className={`${active === i ? 'on' : ''} ${isOpen ? 'as-row-open' : ''}`.trim()}
                            onMouseEnter={() => setActive(i)}
                            onMouseLeave={() => setActive(null)}
                          >
                            <td>
                              {isInvestment ? (
                                <button
                                  type="button"
                                  className="as-row-toggle"
                                  onClick={() => setExpandedRow(isOpen ? null : row.id)}
                                  aria-expanded={isOpen}
                                  aria-controls={`${row.id}-detail`}
                                >
                                  <span className="as-swatch" style={{ background: row.color }} aria-hidden="true" />
                                  {row.name}
                                  <ChevronDown
                                    size={15}
                                    strokeWidth={2.2}
                                    className="as-row-chevron"
                                    aria-hidden="true"
                                  />
                                </button>
                              ) : (
                                <>
                                  <span className="as-swatch" style={{ background: row.color }} aria-hidden="true" />
                                  {row.name}
                                </>
                              )}
                            </td>
                            {isInvestment ? (
                              <td className="num">{row.units != null ? formatUnits(row.units) : '—'}</td>
                            ) : null}
                            <td className="num">{formatMoney(row.amount)}</td>
                            <td className="num">{formatPct(row.pct)}</td>
                            {tab === 'sources' ? <td className="num">{formatMoney(row.vested)}</td> : null}
                          </tr>
                          {isOpen ? (
                            <tr className="as-row-detail" id={`${row.id}-detail`}>
                              <td colSpan={4}>
                                <div className="as-detail-grid">
                                  <div>
                                    <span>Asset class</span>
                                    <b>{row.asset || '—'}</b>
                                  </div>
                                  <div>
                                    <span>Category</span>
                                    <b className="as-cat-badges">
                                      {assetCategory(row.asset).map((cat) => (
                                        <span key={cat} className={`as-cat-badge ${CATEGORY_CLASS[cat] || 'is-other'}`}>
                                          {cat}
                                        </span>
                                      ))}
                                    </b>
                                  </div>
                                  <div>
                                    <span>Price per unit</span>
                                    <b>{row.price != null ? formatMoney(row.price) : '—'}</b>
                                  </div>
                                  <div>
                                    <span>Units held</span>
                                    <b>{row.units != null ? formatUnits(row.units) : '—'}</b>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total</td>
                      {tab === 'investments' ? <td /> : null}
                      <td className="num">{formatMoney(summary.balance)}</td>
                      <td className="num">100.00%</td>
                      {tab === 'sources' ? <td className="num">{formatMoney(summary.vested)}</td> : null}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </section>
        ) : (
          <section className="panel as-main">
            <div className="as-empty">
              <p>No plans with a balance to show.</p>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
