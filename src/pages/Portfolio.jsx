import { useMemo, useState, Fragment } from 'react'
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { HOLDINGS, PLAN_FUNDS, PLAN_STATS, cumSeries, labelsFor, ENDS, money } from '../data/portfolio'
import '../styles/portfolio.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const PERIODS = ['1m', '3m', '6m', 'ytd', '1y', '3y', '5y', '10y', 'si']
const PERIOD_LABELS = { '1m': '1M', '3m': '3M', '6m': '6M', ytd: 'YTD', '1y': '1Y', '3y': '3Y', '5y': '5Y', '10y': '10Y', si: 'Since Inception' }

const COLS = {
  name: { key: 'name', type: 'text' },
  asset: { key: 'asset', type: 'text' },
  cusip: { key: 'cusip', type: 'text' },
  return: { key: 'returnPct', type: 'num' },
  invested: { key: 'invested', type: 'num' },
  current: { key: 'current', type: 'num' },
  gain: { key: 'gain', type: 'num' },
  units: { key: 'units', type: 'num' }
}

export default function Portfolio() {
  const [tab, setTab] = useState('overview')
  const [period, setPeriod] = useState('1y')
  const [planId, setPlanId] = useState('saturna-401k')
  const [sort, setSort] = useState({ key: null, dir: 1 })
  const plan = PLAN_STATS[planId]

  const holdings = useMemo(() => {
    const rows = [...HOLDINGS]
    if (!sort.key) return rows
    const col = COLS[sort.key]
    rows.sort((a, b) => {
      const av = a[col.key]
      const bv = b[col.key]
      if (col.type === 'num') return (av - bv) * sort.dir
      return String(av).localeCompare(String(bv), undefined, { sensitivity: 'base' }) * sort.dir
    })
    return rows
  }, [sort])

  const chart = useMemo(() => {
    const ends = ENDS[period]
    const labs = labelsFor(period)
    const n = labs.length
    const equity = cumSeries(n, ends.equity, 1)
    const bond = cumSeries(n, ends.bond, 4)
    const target = cumSeries(n, ends.target, 7)
    const total = equity.map((e, i) => Math.round((e * 0.64 + bond[i] * 0.23 + target[i] * 0.13) * 100) / 100)
    return {
      labels: labs,
      datasets: [
        line('Total Portfolio', total, '#e05a4f', 0),
        line('U.S. Equity', equity, '#1a9d63'),
        line('U.S. Bond', bond, '#2e3192'),
        line('Target-Date', target, '#d4a017')
      ]
    }
  }, [period])

  const toggleSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir * -1 } : { key, dir: 1 }))
  }

  return (
    <>
      <div className="page-head">
        <div className="page-head-row">
          <h1>Investment Portfolio</h1>
          <div className="plan-select-wrap">
            <select
              className="plan-select"
              aria-label="Select plan"
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
            >
              {Object.entries(PLAN_STATS).map(([id, p]) => (
                <option key={id} value={id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="tabs" role="tablist" aria-label="Portfolio views">
        <button type="button" className={`tab${tab === 'overview' ? ' on' : ''}`} onClick={() => setTab('overview')}>
          My Portfolio
        </button>
        <button type="button" className={`tab${tab === 'investments' ? ' on' : ''}`} onClick={() => setTab('investments')}>
          Plan Investments
        </button>
      </div>
      <div className="page-body">
        {tab === 'overview' && (
          <div className="tab-panel on">
            <div className="overview-row">
              <aside className="overall-card" aria-label="Portfolio summary">
                <div className="overall-body">
                  <div className="stat-block hero">
                    <div className="stat-k">Current Balance</div>
                    <div className="stat-v">{plan.current}</div>
                  </div>
                  <div className="overall-grid">
                    <div className="stat-block">
                      <div className="stat-k">Invested Balance</div>
                      <div className="stat-v">{plan.invested}</div>
                    </div>
                    <div className="stat-block">
                      <div className="stat-k">Gain / Loss</div>
                      <div className="stat-v pos">{plan.gain}</div>
                    </div>
                    <div className="stat-block">
                      <div className="stat-k">Fund Return</div>
                      <div className="stat-v pos">{plan.ret}</div>
                    </div>
                  </div>
                </div>
              </aside>
              <section className="chart-panel">
                <div className="chart-top">
                  <h2>Asset Class Performance</h2>
                  <div className="legend">
                    <span>
                      <i style={{ background: '#e05a4f' }} />
                      Total Portfolio
                    </span>
                    <span>
                      <i style={{ background: '#1a9d63' }} />
                      U.S. Equity
                    </span>
                    <span>
                      <i style={{ background: '#2e3192' }} />
                      U.S. Bond
                    </span>
                    <span>
                      <i style={{ background: '#d4a017' }} />
                      Target-Date
                    </span>
                  </div>
                </div>
                <div className="period" role="tablist" aria-label="Chart period">
                  {PERIODS.map((p) => (
                    <button key={p} type="button" className={period === p ? 'on' : ''} onClick={() => setPeriod(p)}>
                      {PERIOD_LABELS[p]}
                    </button>
                  ))}
                </div>
                <div className="chart-wrap">
                  <Line data={chart} options={chartOptions} />
                </div>
              </section>
            </div>
            <section className="section">
              <h2>Holdings</h2>
              <p className="sub">Funds you currently hold in your account.</p>
              <div className="table-wrap">
                <table className="holdings-table">
                  <thead>
                    <tr>
                      {[
                        ['name', 'Investment Name', 'text'],
                        ['asset', 'Asset Class', 'text'],
                        ['cusip', 'CUSIP', 'text'],
                        ['return', 'Fund Return %', 'num'],
                        ['invested', 'Invested Balance', 'num'],
                        ['current', 'Current Balance', 'num'],
                        ['gain', 'Gain/Loss', 'num'],
                        ['units', 'Unit Balance', 'num']
                      ].map(([key, label, type]) => (
                        <th
                          key={key}
                          className={`sortable${type === 'num' ? ' num' : ''}${sort.key === key ? (sort.dir === 1 ? ' asc' : ' desc') : ''}`}
                          onClick={() => toggleSort(key)}
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((h) => (
                      <tr key={h.cusip}>
                        <td className="name">{h.name}</td>
                        <td>{h.asset}</td>
                        <td className="muted">{h.cusip}</td>
                        <td className="num pos">{h.returnPct.toFixed(2)}%</td>
                        <td className="num">{money(h.invested)}</td>
                        <td className="num">{money(h.current)}</td>
                        <td className="num pos">+{money(h.gain).slice(1)}</td>
                        <td className="num">{h.units.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
        {tab === 'investments' && (
          <div className="tab-panel on">
            <section className="section">
              <h2>Plan Investments</h2>
              <p className="sub">Compare fund performance, expenses, and fees against each fund’s benchmark.</p>
              <div className="table-wrap">
                <table className="plan-table">
                  <thead>
                    <tr>
                      <th className="fund-col" rowSpan={2}>
                        Fund Name / Category
                      </th>
                      <th rowSpan={2}>
                        Return YTD
                        <br />
                        As Of 03/10/2025
                      </th>
                      <th className="group-h" colSpan={4}>
                        Average Annual Total Return
                        <br />
                        As Of 12/31/2024
                      </th>
                      <th className="group-h" colSpan={2}>
                        Total Annual Operating Expenses
                        <br />
                        As Of 12/31/2024
                      </th>
                      <th rowSpan={2}>
                        Shareholder-
                        <br />
                        Type Fees
                      </th>
                    </tr>
                    <tr>
                      <th className="sub-h">1 Yr.</th>
                      <th className="sub-h">5 Yr.</th>
                      <th className="sub-h">10 Yr.</th>
                      <th className="sub-h">Since Inception</th>
                      <th className="sub-h">As A %</th>
                      <th className="sub-h">Per $1,000</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PLAN_FUNDS.map((f) => (
                      <Fragment key={f.name}>
                        <tr className="fund-row">
                          <td className="fund-cell">
                            <div className="fund-title">{f.name}</div>
                            <div className="fund-meta">
                              <span className="fund-cat">{f.cat}</span>
                              <span className={`risk ${f.risk}`}>{f.risk[0].toUpperCase() + f.risk.slice(1)}</span>
                            </div>
                          </td>
                          <td>{f.ytd}</td>
                          <td>{f.y1}</td>
                          <td>{f.y5}</td>
                          <td>{f.y10}</td>
                          <td>{f.si}</td>
                          <td>{f.exp}</td>
                          <td>{f.perK}</td>
                          <td>{f.fees}</td>
                        </tr>
                        <tr className="bench-row group-end">
                          <td className="fund-cell">
                            <div className="fund-title">{f.bench}</div>
                          </td>
                          {f.b.map((v, i) => (
                            <td key={`${f.name}-b-${i}`}>{v}</td>
                          ))}
                          <td>—</td>
                          <td>—</td>
                          <td>N/A</td>
                        </tr>
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </>
  )
}

function line(label, data, color, order) {
  return {
    label,
    data,
    borderColor: color,
    backgroundColor: color,
    tension: 0.3,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBackgroundColor: '#fff',
    pointBorderColor: color,
    pointBorderWidth: 2,
    borderWidth: 2.5,
    order
  }
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  clip: false,
  interaction: { mode: 'index', intersect: false },
  layout: { padding: { top: 8, right: 8 } },
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${c.parsed.y.toFixed(2)}%` } }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Time Period',
        color: '#5c6078',
        font: { size: 12, weight: '600', family: 'Inclusive Sans, sans-serif' },
        padding: { top: 8 }
      },
      grid: { display: true, color: '#e8eaf2', borderDash: [4, 4], drawTicks: false },
      border: { display: false },
      ticks: { color: '#8a8da3', maxRotation: 0, autoSkip: true, maxTicksLimit: 12 }
    },
    y: {
      min: 0,
      grace: '8%',
      title: {
        display: true,
        text: 'Return (%)',
        color: '#5c6078',
        font: { size: 12, weight: '600', family: 'Inclusive Sans, sans-serif' },
        padding: { bottom: 6 }
      },
      grid: { color: '#eef0f6', borderDash: [4, 4] },
      border: { display: false },
      ticks: { color: '#8a8da3', stepSize: 5, callback: (v) => v + '%' }
    }
  }
}
