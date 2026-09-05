import { Fragment, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArcElement, Chart as ChartJS, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { Icon } from '../lib/icons'
import { faArrowLeft, faChevronDown, faDatabase, faChartPie } from '@fortawesome/free-solid-svg-icons'
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

// Funds are priced once per business day, not live — showing when that
// price was struck matters for a NAV figure to be trustworthy.
const NAV_AS_OF = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

function formatUnits(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
}
import '../styles/account-summary.css'

ChartJS.register(ArcElement, Tooltip)

// The old literal "Investments" tab (per-fund rows) was removed — the
// asset-class-grouped view now carries the "Investments" label instead,
// since that's the view participants actually want when they click it.
// Icons use the app's shared Font Awesome set (see lib/icons) -- these two
// were still referencing pre-migration Lucide components (Database,
// PieChart) that no longer exist, which threw at render.
const TABS = [
  { id: 'sources', label: 'Sources', icon: faDatabase },
  { id: 'assetclass', label: 'Investments', icon: faChartPie }
]

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
  const summary = useMemo(
    () => (plan ? summaryForPlan(plan) : { balance: 0, vested: 0, sources: [], investments: [], assetClasses: [] }),
    [plan]
  )
  const rows = tab === 'sources' ? summary.sources : tab === 'investments' ? summary.investments : summary.assetClasses
  const highlight = rows[active] || null

  // Segments stay full-color regardless of hover -- no dimming/fade effect
  // on the other slices, per feedback that the hover treatment felt like
  // an unwanted animation.
  const chart = useMemo(() => {
    if (!rows.length) return null
    return {
      labels: rows.map((r) => r.name),
      datasets: [
        {
          data: rows.map((r) => r.amount),
          backgroundColor: rows.map((r) => r.color),
          borderWidth: 0,
          spacing: 0,
          hoverOffset: 0,
          borderRadius: 0
        }
      ]
    }
  }, [rows])

  const options = useMemo(
    () => ({
      cutout: '68%',
      maintainAspectRatio: false,
      layout: { padding: 0 },
      // No animated transition on hover/redraw -- segments and the
      // center label update instantly instead of tweening.
      animation: false,
      hover: { mode: 'nearest', intersect: true },
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
            <Icon icon={faArrowLeft} size={16} />
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
          {/* Plan name, account balance, and vested balance are dropped here —
              they're already shown for this plan in the left-side panel. */}

          <div className="as-tabs" role="tablist" aria-label="Balance view">
            {TABS.map((item) => {
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
                    <Icon icon={item.icon} size={15} />
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
                <div className="as-legend-wrap">
                  <div className="as-legend-head" aria-hidden="true">
                    <span>{tab === 'sources' ? 'Source' : 'Asset class'}</span>
                    <span>Balance</span>
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
              </div>

              <div className="as-table-wrap">
                <table className={tab === 'investments' || tab === 'assetclass' ? 'as-table-accordion' : ''}>
                  <thead>
                    <tr>
                      <th scope="col">{tab === 'sources' ? 'Source' : tab === 'assetclass' ? 'Asset class' : 'Investment'}</th>
                      {tab === 'investments' ? <th scope="col" className="num">Units</th> : null}
                      <th scope="col" className="num">Balance</th>
                      <th scope="col" className="num">{tab === 'investments' ? 'Election Percentage' : 'Percent'}</th>
                      {tab === 'sources' ? <th scope="col" className="num">Vested</th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => {
                      const isInvestment = tab === 'investments'
                      const isAssetClass = tab === 'assetclass'
                      const isExpandable = isInvestment || isAssetClass
                      const isOpen = isExpandable && expandedRow === row.id
                      return (
                        <Fragment key={row.id}>
                          <tr
                            className={`${active === i ? 'on' : ''} ${isOpen ? 'as-row-open' : ''}`.trim()}
                            onMouseEnter={() => setActive(i)}
                            onMouseLeave={() => setActive(null)}
                          >
                            <td>
                              {isExpandable ? (
                                <button
                                  type="button"
                                  className="as-row-toggle"
                                  onClick={() => setExpandedRow(isOpen ? null : row.id)}
                                  aria-expanded={isOpen}
                                  aria-controls={`${row.id}-detail`}
                                >
                                  <Icon
                                    icon={faChevronDown}
                                    size={15}
                                    className="as-row-chevron"
                                    aria-hidden="true"
                                  />
                                  <span className="as-swatch" style={{ background: row.color }} aria-hidden="true" />
                                  {row.name}
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
                          {isOpen && isInvestment ? (
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
                                </div>
                              </td>
                            </tr>
                          ) : null}
                          {isOpen && isAssetClass ? (
                            <tr className="as-row-detail" id={`${row.id}-detail`}>
                              <td colSpan={3}>
                                {/* The old standalone Investments tab used to be the only place
                                    a participant could see a fund's NAV (price per unit) — now
                                    that view lives here instead, so it's carried over rather than
                                    lost, alongside when that price was last priced. */}
                                <p className="as-class-asof">NAV as of {NAV_AS_OF}</p>
                                <ul className="as-class-members">
                                  {row.members.map((m) => (
                                    <li key={m.id}>
                                      <span className="as-swatch" style={{ background: m.color }} aria-hidden="true" />
                                      <span className="as-class-member-name">
                                        {m.name}
                                        {m.price != null && <small className="as-class-member-nav">NAV {formatMoney(m.price)}</small>}
                                      </span>
                                      <span className="as-class-member-units">
                                        {m.units != null ? `${formatUnits(m.units)} units` : ''}
                                      </span>
                                      <b>{formatMoney(m.amount)}</b>
                                    </li>
                                  ))}
                                </ul>
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
