import { useMemo, useState } from 'react'
import { useParticipant } from '../context/ParticipantContext.jsx'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'deferral', label: 'My Deferral' },
  { id: 'employer', label: 'Employer' },
  { id: 'other', label: 'Other' }
]

export default function Transactions() {
  const { participant } = useParticipant()
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
    <div className="page-body">
      <div className="hi-bar">
        <h1>Transactions</h1>
      </div>

      <section className="panel tx-page">
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
          <select
            className="tx-plan-select"
            aria-label="Filter by plan"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
          >
            <option value="all">All Plans</option>
            {plans.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
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
      </section>
    </div>
  )
}
