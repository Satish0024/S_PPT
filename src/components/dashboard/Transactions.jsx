import { Link } from 'react-router-dom'

export default function Transactions({ rows }) {
  return (
    <section className="section-card tx-compact">
      <div className="section-head">
        <h3>Recent transactions</h3>
        {!!rows?.length && (
          <Link to="/reports" className="text-link">
            Generate statement
          </Link>
        )}
      </div>
      <div className="tx-list">
        {!rows?.length ? (
          <div className="tx-empty">No transactions yet.</div>
        ) : (
          rows.map((r, i) => (
            <div className={`tx-row ${r.kind}`} key={`${r.date}-${r.type}-${i}`}>
              <div className="tx-date">{r.date}</div>
              <div>
                <span className="tx-type">{r.type}</span>
                <span className="tx-plan">{r.plan}</span>
              </div>
              <div className="tx-amt">{r.amt}</div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
