import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

// A chart legend that stays usable whether there are 4 series or 40.
//
// Below `maxInline` items it renders exactly like a plain inline legend
// (every item visible, wraps naturally) — no behavior change for today's
// 4-series portfolio chart. Once there are more items than that, showing
// them all inline would either wrap into several rows (pushing the chart
// down and reading as clutter) or overflow — so instead it shows the first
// few plus a "+N more" toggle that opens a compact, scrollable checklist of
// every series, same dropdown pattern already used elsewhere in the app
// (Accessibility menu, New request menu) rather than inventing a new one.
export default function ChartLegend({ items, onToggle, maxInline = 6 }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const overflow = items.length > maxInline
  const inlineItems = overflow ? items.slice(0, maxInline - 1) : items
  const hiddenItems = overflow ? items.slice(maxInline - 1) : []
  const hiddenActiveCount = hiddenItems.filter((i) => i.checked).length

  useEffect(() => {
    if (!open) return
    const onPointer = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="legend">
      {inlineItems.map((item) => (
        <LegendItem key={item.key} item={item} onToggle={onToggle} />
      ))}

      {overflow && (
        <div className="legend-more-wrap" ref={wrapRef}>
          <button
            type="button"
            className={`legend-more${hiddenActiveCount ? ' on' : ''}`}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            +{hiddenItems.length} more
            {hiddenActiveCount > 0 && <span className="legend-more-badge">{hiddenActiveCount}</span>}
            <ChevronDown size={13} strokeWidth={2.4} aria-hidden="true" />
          </button>
          {open && (
            <div className="legend-panel" role="dialog" aria-label="All series">
              {hiddenItems.map((item) => (
                <LegendItem key={item.key} item={item} onToggle={onToggle} stacked />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function LegendItem({ item, onToggle, stacked }) {
  const cls = [stacked && 'legend-panel-row', item.checked && 'on', item.disabled && 'disabled'].filter(Boolean).join(' ')
  return (
    <label className={cls} style={{ '--series-color': item.color }}>
      <input
        type="checkbox"
        checked={item.checked}
        disabled={item.disabled}
        onChange={() => onToggle(item.key)}
      />
      {/* Series' own line sample: colour + dash are unique per series,
          where marker shapes had to repeat across 12 series. */}
      <svg className="legend-line" width="24" height="10" viewBox="0 0 24 10" aria-hidden="true">
        <line
          x1="1"
          y1="5"
          x2="23"
          y2="5"
          style={{ stroke: item.color }}
          strokeWidth={item.key === 'total' ? 3 : 2.5}
          strokeLinecap="round"
          strokeDasharray={item.dash?.length ? item.dash.join(' ') : undefined}
        />
      </svg>
      {item.label}
    </label>
  )
}
