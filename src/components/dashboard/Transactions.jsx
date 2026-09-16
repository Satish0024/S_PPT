import { useMemo } from 'react'
import SortTh from '../common/SortTh.jsx'
import { useSortableRows } from '../../hooks/useSortableRows'

export default function Transactions({ rows }) {
  // SortTh/useSortableRows compare raw values, so give them parseable
  // numbers alongside the display strings (amt is "$1,234.00", date is
  // "Feb 28, 2026") instead of sorting those strings lexically.
  const sortable = useMemo(
    () =>
      (rows || []).map((r, i) => ({
        ...r,
        _key: `${r.date}-${r.type}-${i}`,
        dateValue: new Date(r.date).getTime() || 0,
        amtValue: Number(String(r.amt).replace(/[^0-9.-]/g, '')) || 0
      })),
    [rows]
  )
  const { sortedRows, sortKey, sortDir, toggleSort } = useSortableRows(sortable)

  return (
    <section>
      <h2 className="section-title">Recent Transactions</h2>
      <div className="section-card tx-compact">
        {!rows?.length ? (
          <div className="tx-empty">No transactions yet.</div>
        ) : (
          <div className="table-wrap">
            <table className="tx-table">
              <thead>
                <tr>
                  <SortTh label="Date" sortKeyName="dateValue" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortTh label="Type" sortKeyName="type" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortTh label="Plan" sortKeyName="plan" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortTh
                    label="Amount"
                    sortKeyName="amtValue"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={toggleSort}
                    className="num"
                  />
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((r) => (
                  <tr key={r._key} className={r.kind}>
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
      </div>
    </section>
  )
}
