// Asset-class performance can show up to 11 series. Rather than hiding them
// behind a dropdown, every series gets its own checkbox laid out in a
// wrapping row below the chart -- always visible, one click to toggle.
export default function ChartLegend({ items, onToggle, label = 'Asset classes' }) {
  return (
    <div className="legend-row" role="group" aria-label={label}>
      {items.map((item) => (
        <LegendItem key={item.key} item={item} onToggle={onToggle} />
      ))}
    </div>
  )
}

function LegendItem({ item, onToggle }) {
  const cls = ['legend-chip', item.checked && 'on', item.disabled && 'disabled'].filter(Boolean).join(' ')
  return (
    <label className={cls} style={{ '--series-color': item.color }}>
      <input
        type="checkbox"
        checked={item.checked}
        disabled={item.disabled}
        onChange={() => onToggle(item.key)}
      />
      {item.pointStyle && <span className={`legend-swatch legend-swatch--${item.pointStyle}`} aria-hidden="true" />}
      {item.label}
    </label>
  )
}
