import { formatMoney } from '../../data/transactions.js'

// Current-holding vs after-transfer/after-rebalance grid used by both the
// Transfer and Rebalance wizards. `editable` drives whether the target
// percentage is an input (Source Selection) or plain text (Summary).
export default function InvestmentAllocationTable({ rows, sourceTotal, afterLabel, editable, onChangePct }) {
  const currentPctTotal = rows.reduce((sum, r) => sum + (r.pct || 0), 0)
  const currentAmountTotal = rows.reduce((sum, r) => sum + (r.amount || 0), 0)
  const afterPctTotal = rows.reduce((sum, r) => sum + (+r.afterPct || 0), 0)
  const afterAmountTotal = rows.reduce((sum, r) => sum + afterAmountOf(r, sourceTotal), 0)
  const totalsMatch = Math.round(afterPctTotal) === 100

  return (
    <div className="table-scroll">
      <table className="alloc-table">
        <thead>
          <tr className="alloc-group-row">
            <th rowSpan={2} className="alloc-name-col">
              Investments
            </th>
            <th colSpan={3} className="alloc-group">
              Current holding
            </th>
            <th colSpan={3} className="alloc-group alloc-after">
              {afterLabel}
            </th>
          </tr>
          <tr>
            <th className="num">Units</th>
            <th className="num">Percentage</th>
            <th className="num">Amount</th>
            <th className="num alloc-after">Units</th>
            <th className="num alloc-after">Percentage</th>
            <th className="num alloc-after">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const afterAmount = afterAmountOf(r, sourceTotal)
            const afterUnits = r.nav ? afterAmount / r.nav : 0
            return (
              <tr key={r.id}>
                <td className="alloc-name-col">
                  <span className="alloc-name">{r.name}</span>
                  <span className="alloc-nav">
                    Nav <b>{formatMoney(r.nav)}</b>
                  </span>
                </td>
                <td className="num">{r.units.toFixed(2)}</td>
                <td className="num">{r.pct} %</td>
                <td className="num">{formatMoney(r.amount)}</td>
                <td className="num alloc-after">{afterUnits.toFixed(2)}</td>
                <td className="num alloc-after">
                  {editable ? (
                    <span className="alloc-pct-input">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        aria-label={`${afterLabel} percentage for ${r.name}`}
                        value={r.afterPct}
                        onChange={(e) => onChangePct(r.id, e.target.value)}
                      />
                      <i>%</i>
                    </span>
                  ) : (
                    `${r.afterPct} %`
                  )}
                </td>
                <td className="num alloc-after">{formatMoney(afterAmount)}</td>
              </tr>
            )
          })}
          <tr className="alloc-total">
            <td className="alloc-name-col">Total</td>
            <td className="num" />
            <td className="num">{Math.round(currentPctTotal)} %</td>
            <td className="num">{formatMoney(currentAmountTotal)}</td>
            <td className="num alloc-after" />
            <td className={`num alloc-after${totalsMatch ? '' : ' alloc-off'}`}>{Math.round(afterPctTotal)} %</td>
            <td className="num alloc-after">{formatMoney(afterAmountTotal)}</td>
          </tr>
        </tbody>
      </table>
      {editable && !totalsMatch && (
        <p className="alloc-warn">Target percentages must add up to 100%. Currently {Math.round(afterPctTotal)}%.</p>
      )}
    </div>
  )
}

function afterAmountOf(row, sourceTotal) {
  return ((+row.afterPct || 0) / 100) * sourceTotal
}
