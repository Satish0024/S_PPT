export default function Transactions({ rows }) {
  return (
    <>
      <h2 className="section-title">Recent transactions</h2>
      <section className="section-card tx-compact">
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
    </>
  )
}
