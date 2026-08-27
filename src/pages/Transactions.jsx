import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Landmark, Shuffle, TrendingDown } from 'lucide-react'
import { useParticipant } from '../context/ParticipantContext.jsx'
import { formatMoney, planBalance, planVested } from '../lib/accountSummary'
import { TRANSACTION_TYPES, canRequest, requestStatusTone, requestsFor, transactablePlans } from '../data/transactions.js'
import '../styles/documents.css'
import '../styles/transactions.css'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'deferral', label: 'My Deferral' },
  { id: 'employer', label: 'Employer' },
  { id: 'other', label: 'Other' }
]

const TYPE_ICON = { loan: Landmark, withdrawal: TrendingDown, transfer: Shuffle }

function NewRequestMenu({ plan }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <div className="new-request">
      <button type="button" className="btn btn-primary" onClick={() => setOpen((v) => !v)}>
        + New Request
      </button>
      {open && (
        <>
          <div className="new-request-scrim" onClick={() => setOpen(false)} />
          <div className="new-request-menu" role="menu">
            {TRANSACTION_TYPES.map((t) => {
              const Icon = TYPE_ICON[t.id]
              const enabled = canRequest(plan, t.id)
              return (
                <button
                  key={t.id}
                  type="button"
                  role="menuitem"
                  className="new-request-item"
                  disabled={!enabled}
                  title={enabled ? undefined : 'Not available for this plan right now'}
                  onClick={() => {
                    setOpen(false)
                    navigate(t.to(plan.id))
                  }}
                >
                  <span className="new-request-ico" aria-hidden="true">
                    <Icon size={16} strokeWidth={2.1} />
                  </span>
                  <span>
                    <b>{t.label}</b>
                    <small>{t.hint}</small>
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function RequestsPanel({ participant }) {
  const plans = useMemo(() => transactablePlans(participant), [participant])
  const [planId, setPlanId] = useState(plans[0]?.id)
  const plan = plans.find((p) => p.id === planId) || plans[0]
  const requests = useMemo(() => requestsFor(participant), [participant])

  if (!plans.length) {
    return (
      <div className="tx-empty">
        You don&apos;t have a plan balance to raise a transaction request against yet.
      </div>
    )
  }

  return (
    <>
      <div className="req-plan-tabs" role="tablist" aria-label="Plan">
        {plans.map((p) => (
          <button
            key={p.id}
            type="button"
            className={p.id === plan.id ? 'on' : ''}
            role="tab"
            aria-selected={p.id === plan.id}
            onClick={() => setPlanId(p.id)}
          >
            <span className="req-plan-badge">Plan ID {p.meta?.match(/ID\s+(\S+)/i)?.[1] || p.id}</span>
            {p.name}
          </button>
        ))}
      </div>

      <div className="req-plan-strip">
        <div>
          <span className="eyebrow">Plan details</span>
          <h3>{plan.name}</h3>
          <p className="plan-meta">
            Plan ID {plan.meta?.match(/ID\s+(\S+)/i)?.[1] || plan.id} · Type {plan.type}
          </p>
        </div>
        <div className="req-plan-stats">
          <div>
            <span>Plan balance</span>
            <b>{formatMoney(planBalance(plan))}</b>
          </div>
          <div>
            <span>Vested balance</span>
            <b>{formatMoney(planVested(plan))}</b>
          </div>
        </div>
        <NewRequestMenu plan={plan} />
      </div>

      {!requests.length ? (
        <div className="tx-empty">No transaction requests yet for this plan.</div>
      ) : (
        <div className="table-wrap">
          <table className="tx-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Plan</th>
                <th>Date</th>
                <th>Status</th>
                <th className="num">Amount</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.typeLabel}</td>
                  <td>{r.plan}</td>
                  <td>{r.date}</td>
                  <td>
                    <span className={`req-status ${requestStatusTone(r.status)}`}>{r.status}</span>
                  </td>
                  <td className="num">{r.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function HistoryPanel({ participant }) {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [plan, setPlan] = useState('all')

  const plans = useMemo(() => {
    const names = [...new Set(participant.transactions.map((t) => t.plan))]
    return names
  }, [participant])

  const rows = useMemo(() => {
    return participant.transactions.filter((t) => {
      const kindOk =
        filter === 'all' ||
        (filter === 'other' ? !['deferral', 'employer'].includes(t.kind) : t.kind === filter)
      const planOk = plan === 'all' || t.plan === plan
      return kindOk && planOk
    })
  }, [participant, filter, plan])

  return (
    <>
      <div className="tx-toolbar">
        <div className="tx-filters" role="tablist" aria-label="Transaction type">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={filter === f.id ? 'on' : ''}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="tx-toolbar-actions">
          <select
            className="tx-plan-select"
            aria-label="Filter by plan"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
          >
            <option value="all">All plans</option>
            {plans.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <button type="button" className="text-link" onClick={() => navigate('/reports')}>
            Generate Statement
          </button>
        </div>
      </div>

      {!rows.length ? (
        <div className="tx-empty">No transactions yet.</div>
      ) : (
        <div className="table-wrap">
          <table className="tx-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Plan</th>
                <th className="num">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.date}-${r.type}-${i}`} className={r.kind}>
                  <td>{r.date}</td>
                  <td>{r.type}</td>
                  <td>{r.plan}</td>
                  <td className={`num tx-amt ${r.kind}`}>{r.amt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default function Transactions() {
  const { participant } = useParticipant()
  const [tab, setTab] = useState('requests')

  return (
    <div className="page-body">
      <div className="hi-bar">
        <div>
          <h1>Transactions</h1>
          <p className="pr-intro">View, edit, and raise transaction requests</p>
        </div>
      </div>

      <section className="panel tx-page">
        <div className="tabs" role="tablist" aria-label="Transactions view">
          <button type="button" className={`tab${tab === 'requests' ? ' on' : ''}`} onClick={() => setTab('requests')}>
            Requests
          </button>
          <button type="button" className={`tab${tab === 'history' ? ' on' : ''}`} onClick={() => setTab('history')}>
            History
          </button>
        </div>

        {tab === 'requests' ? <RequestsPanel participant={participant} /> : <HistoryPanel participant={participant} />}
      </section>
    </div>
  )
}
