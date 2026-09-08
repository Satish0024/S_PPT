import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../lib/icons'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'

// Asset-class performance can show up to 11 series. An inline legend
// cannot fit that many checkboxes in the chart header, so the control
// is always a dropdown multi-select: one trigger, a scrollable checklist
// of every series, click-outside / Escape to close.
export default function ChartLegend({ items, onToggle, label = 'Asset classes' }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const checkedCount = items.filter((i) => i.checked).length

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
    <div className="legend-dd" ref={wrapRef}>
      <button
        type="button"
        className={`legend-dd-btn${open ? ' on' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}, ${checkedCount} of ${items.length} selected`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="legend-dd-label">{label}</span>
        <span className="legend-dd-count">{checkedCount}/{items.length}</span>
        <Icon icon={faChevronDown} size={13} aria-hidden="true" />
      </button>
      {open && (
        <div className="legend-panel" role="listbox" aria-multiselectable="true" aria-label={label}>
          {items.map((item) => (
            <LegendItem key={item.key} item={item} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  )
}

function LegendItem({ item, onToggle }) {
  const cls = ['legend-panel-row', item.checked && 'on', item.disabled && 'disabled'].filter(Boolean).join(' ')
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
