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
import { useTheme } from '../context/ThemeContext.jsx'
import FundDetailDialog from '../components/common/FundDetailDialog.jsx'
import '../styles/portfolio.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

// 'si' (Since inception) stays out of the graph's own period toggle — it's
// still available as a column in the holdings table below.
const PERIODS = ['1m', '3m', '6m', 'ytd', '1y', '3y', '5y', '10y']
const PERIOD_LABELS = { '1m': '1M', '3m': '3M', '6m': '6M', ytd: 'YTD', '1y': '1Y', '3y': '3Y', '5y': '5Y', '10y': '10Y', si: 'Since inception' }

const SERIES = [
  { key: 'total', label: 'Total portfolio', color: '#e05a4f' },
  { key: 'equity', label: 'U.S. Equity', color: '#1a9d63' },
  { key: 'bond', label: 'U.S. Bond', color: '#0284c7' },
  { key: 'target', label: 'Target-Date', color: '#d4a017' }
]

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
  const { theme } = useTheme()
  const [tab, setTab] = useState('overview')
  const [openFund, setOpenFund] = useState(null)
  const [period, setPeriod] = useState('1y')
  const [planId, setPlanId] = useState('lendguard-401k')
  const [sort, setSort] = useState({ key: null, dir: 1 })
  const [ytdDir, setYtdDir] = useState(null)
  const [visible, setVisible] = useState({ total: true, equity: false, bond: false, target: false })
  const plan = PLAN_STATS[planId]

  // Re-read the resolved CSS variables whenever the theme flips so the grid
  // lines and axis labels stay legible instead of the old hardcoded
  // light-mode-only palette.
  const chartOptions = useMemo(() => {
    const css = getComputedStyle(document.documentElement)
    return buildChartOptions({
      axisTitle: css.getPropertyValue('--ink-soft').trim() || '#5c6078',
      gridLine: css.getPropertyValue('--line').trim() || '#e8eaf2',
      tick: css.getPropertyValue('--muted').trim() || '#8a8da3'
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme])

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

  const planFunds = useMemo(() => {
    const rows = [...PLAN_FUNDS]
    if (!ytdDir) return rows
    rows.sort((a, b) => (parsePct(a.ytd) - parsePct(b.ytd)) * ytdDir)
    return rows
  }, [ytdDir])

  const chart = useMemo(() => {
    const ends = ENDS[period]
    const labs = labelsFor(period)
    const n = labs.length
    const equity = cumSeries(n, ends.equity, 1)
    const bond = cumSeries(n, ends.bond, 4)
    const target = cumSeries(n, ends.target, 7)
    const total = equity.map((e, i) => Math.round((e * 0.64 + bond[i] * 0.23 + target[i] * 0.13) * 100) / 100)
    const byKey = {
      total: line('Total portfolio', total, '#e05a4f', 0),
      equity: line('U.S. Equity', equity, '#1a9d63'),
      bond: line('U.S. Bond', bond, '#0284c7'),
      target: line('Target-Date', target, '#d4a017')
    }
    return {
      labels: labs,
      datasets: SERIES.map((s) => ({ ...byKey[s.key], hidden: !visible[s.key] }))
    }
  }, [period, visible])

  const toggleSeries = (key) => {
    setVisible((v) => ({ ...v, [key]: !v[key] }))
  }

  const toggleSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir * -1 } : { key, dir: 1 }))
  }

  const toggleYtd = () => {
    setYtdDir((d) => (d === 1 ? -1 : 1))
  }

  return (
    <>
      <div className="page-head">
        <div className="page-head-row">
          <h1>Investment portfolio</h1>
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
          My portfolio
        </button>
        <button type="button" className={`tab${tab === 'investments' ? ' on' : ''}`} onClick={() => setTab('investments')}>
          Plan investments
        </button>
      </div>
      <div className="page-body">
        {tab === 'overview' && (
          <div className="tab-panel on">
            <div className="overview-row">
              <aside className="overall-card" aria-label="Portfolio summary">
                <div className="overall-body">
                  <div className="stat-block hero">
                    <div className="stat-k">Current balance</div>
                    <div className="stat-v">{plan.current}</div>
                  </div>
                  <div className="overall-grid">
                    <div className="stat-block">
                      <div className="stat-k">Invested balance</div>
                      <div className="stat-v">{plan.invested}</div>
                    </div>
                    <div className="stat-block">
                      <div className="stat-k">Gain / loss</div>
                      <div className="stat-v pos">{plan.gain}</div>
                    </div>
                    <div className="stat-block">
                      <div className="stat-k">Fund return</div>
                      <div className="stat-v pos">{plan.ret}</div>
                    </div>
                  </div>
                </div>
              </aside>
              <section className="chart-panel">
                <div className="chart-top">
                  <h2>Asset class performance</h2>
                  <div className="legend">
                    {SERIES.map((s) => (
                      <label key={s.key} className={visible[s.key] ? 'on' : ''} style={{ '--series-color': s.color }}>
                        <input
                          type="checkbox"
                          checked={visible[s.key]}
                          onChange={() => toggleSeries(s.key)}
                        />
                        {s.label}
                      </label>
                    ))}
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
              <h2>Investments</h2>
              <div className="table-wrap">
                <table className="holdings-table">
                  <thead>
                    <tr>
                      {[
                        ['name', 'Investment name', 'text'],
                        ['asset', 'Asset class', 'text'],
                        ['cusip', 'CUSIP', 'text'],
                        ['return', 'Fund return %', 'num']
                      ].map(([key, label, type]) => (
                        <th scope="col"
                          key={key}
                          className={`sortable${type === 'num' ? ' num' : ''}${sort.key === key ? (sort.dir === 1 ? ' asc' : ' desc') : ''}`}
                          onClick={() => toggleSort(key)}
                        >
                          {label}
                        </th>
                      ))}
                      {/* Not sortable — every fund's return here is YTD, so this
                          just calls that out per-row instead of leaving the
                          timeframe implicit in the "Fund return %" header. */}
                      <th scope="col">Period of return</th>
                      {[
                        ['invested', 'Invested balance', 'num'],
                        ['current', 'Current balance', 'num'],
                        ['gain', 'Gain/loss', 'num'],
                        ['units', 'Unit balance', 'num']
                      ].map(([key, label, type]) => (
                        <th scope="col"
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
                        <td className="name">
                          <button type="button" className="fund-link" onClick={() => setOpenFund(h)}>
                            {h.name}
                          </button>
                        </td>
                        <td>{h.asset}</td>
                        <td className="muted">{h.cusip}</td>
                        <td className="num pos">{h.returnPct.toFixed(2)}%</td>
                        <td className="muted">YTD</td>
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
              <h2>Plan investments</h2>
              <p className="sub">Browse and compare the funds available within your retirement plan.</p>
              <div className="table-wrap">
                <table className="plan-table">
                  <thead>
                    <tr>
                      <th scope="col" className="fund-col" rowSpan={2}>
                        Fund name / category
                      </th>
                      <th scope="col"
                        rowSpan={2}
                        className={`sortable${ytdDir === 1 ? ' asc' : ytdDir === -1 ? ' desc' : ''}`}
                        aria-sort={ytdDir === 1 ? 'ascending' : ytdDir === -1 ? 'descending' : 'none'}
                      >
                        <button type="button" onClick={toggleYtd}>
                          Return YTD
                        </button>
                      </th>
                      <th scope="col" className="group-h" colSpan={4}>
                        Average annual total return
                      </th>
                      <th scope="col" className="group-h" colSpan={2}>
                        Total annual operating expenses
                      </th>
                      <th scope="col" rowSpan={2}>
                        Shareholder-
                        <br />
                        type fees
                      </th>
                    </tr>
                    <tr>
                      <th scope="col" className="sub-h">1 yr.</th>
                      <th scope="col" className="sub-h">5 yr.</th>
                      <th scope="col" className="sub-h">10 yr.</th>
                      <th scope="col" className="sub-h">Since inception</th>
                      <th scope="col" className="sub-h">As a %</th>
                      <th scope="col" className="sub-h">Per $1,000</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planFunds.map((f) => (
                      <Fragment key={f.name}>
                        <tr className="fund-row">
                          <td className="fund-cell">
                            <button type="button" className="fund-link fund-title" onClick={() => setOpenFund(f)}>
                              {f.name}
                            </button>
                            <div className="fund-meta">
                              <span className="fund-cat">{f.cat}</span>
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

      {openFund && (
        <FundDetailDialog
          name={openFund.name}
          onClose={() => setOpenFund(null)}
          fields={[
            { label: 'Asset class / category', value: openFund.asset || openFund.cat },
            { label: 'CUSIP', value: openFund.cusip },
            { label: 'Fund return %', value: openFund.returnPct != null ? `${openFund.returnPct.toFixed(2)}%` : openFund.ytd },
            { label: 'Current balance', value: openFund.current != null ? money(openFund.current) : undefined },
            { label: 'Unit balance', value: openFund.units != null ? openFund.units.toFixed(2) : undefined },
            { label: '1 yr. return', value: openFund.y1 },
            { label: '5 yr. return', value: openFund.y5 },
            { label: '10 yr. return', value: openFund.y10 },
            { label: 'Total annual operating expenses', value: openFund.exp }
          ]}
        />
      )}
    </>
  )
}

function parsePct(value) {
  const n = parseFloat(String(value).replace(/[^0-9.-]/g, ''))
  return Number.isFinite(n) ? n : Number.NEGATIVE_INFINITY
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

// Chart.js reads plain color strings, not CSS variables, so its palette has
// to be rebuilt whenever the theme flips rather than defined once at import
// time — this factory is called from the component with each render's
// resolved --ink-soft/--line/--muted values.
function buildChartOptions({ axisTitle, gridLine, tick }) {
  return {
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
          color: axisTitle,
          font: { size: 12, weight: '600', family: 'Inclusive Sans, sans-serif' },
          padding: { top: 8 }
        },
        grid: { display: true, color: gridLine, borderDash: [4, 4], drawTicks: false },
        border: { display: false },
        ticks: { color: tick, maxRotation: 0, autoSkip: true, maxTicksLimit: 12 }
      },
      y: {
        min: 0,
        grace: '8%',
        title: {
          display: true,
          text: 'Rate of return (%)',
          color: axisTitle,
          font: { size: 12, weight: '600', family: 'Inclusive Sans, sans-serif' },
          padding: { bottom: 6 }
        },
        grid: { color: gridLine, borderDash: [4, 4] },
        border: { display: false },
        ticks: { color: tick, stepSize: 5, callback: (v) => v + '%' }
      }
    }
  }
}
