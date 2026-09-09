import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../lib/icons'
import { faCalendarAlt, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function toDateInput(d) {
  return d.toISOString().slice(0, 10)
}

function parseInput(v) {
  if (!v) return null
  const [y, m, d] = v.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function sameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

// A brand-styled replacement for <input type="date"> -- the native picker
// renders as an OS control outside the DOM (Chrome's blue accent, Safari's
// system UI) that CSS can never restyle. This one is themeable like every
// other control in the app.
export default function DatePicker({ id, value, onChange, min, max, placeholder = 'Select date', disabled }) {
  const [open, setOpen] = useState(false)
  const selected = parseInput(value)
  const [viewDate, setViewDate] = useState(selected || new Date())
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (open) setViewDate(selected || new Date())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const minDate = min ? parseInput(min) : null
  const maxDate = max ? parseInput(max) : null

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const startWeekday = firstOfMonth.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const cells = []
  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, outside: true, date: new Date(year, month - 1, daysInPrevMonth - i) })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, outside: false, date: new Date(year, month, d) })
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const n = cells.length - (startWeekday + daysInMonth)
    cells.push({ day: n + 1, outside: true, date: new Date(year, month + 1, n + 1) })
    if (cells.length >= 42) break
  }

  const disabledDate = (d) => (minDate && d < minDate) || (maxDate && d > maxDate)

  const pick = (d) => {
    if (disabledDate(d)) return
    onChange?.({ target: { value: toDateInput(d) } })
    setOpen(false)
  }

  const label = selected
    ? selected.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : placeholder

  return (
    <div className={`ui-datepicker${disabled ? ' disabled' : ''}`} ref={ref}>
      <button
        type="button"
        id={id}
        className="ui-select-btn ui-datepicker-btn"
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        <span className="ui-select-value">{label}</span>
        <Icon icon={faCalendarAlt} size={13} aria-hidden="true" className="ui-select-caret" />
      </button>
      {open && (
        <div className="ui-datepicker-panel" role="dialog" aria-label="Choose date">
          <div className="ui-datepicker-head">
            <button type="button" aria-label="Previous month" onClick={() => setViewDate(new Date(year, month - 1, 1))}>
              <Icon icon={faChevronLeft} size={12} aria-hidden="true" />
            </button>
            <span>{viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            <button type="button" aria-label="Next month" onClick={() => setViewDate(new Date(year, month + 1, 1))}>
              <Icon icon={faChevronRight} size={12} aria-hidden="true" />
            </button>
          </div>
          <div className="ui-datepicker-weekdays">
            {WEEKDAYS.map((w, i) => (
              <span key={`${w}-${i}`}>{w}</span>
            ))}
          </div>
          <div className="ui-datepicker-grid">
            {cells.map((c, i) => {
              const isSelected = sameDay(c.date, selected)
              const isToday = sameDay(c.date, new Date())
              const isDisabled = disabledDate(c.date)
              return (
                <button
                  key={i}
                  type="button"
                  className={`ui-datepicker-day${c.outside ? ' outside' : ''}${isSelected ? ' selected' : ''}${isToday && !isSelected ? ' today' : ''}`}
                  disabled={isDisabled}
                  onClick={() => pick(c.date)}
                >
                  {c.day}
                </button>
              )
            })}
          </div>
          <div className="ui-datepicker-foot">
            <button type="button" className="text-link" onClick={() => onChange?.({ target: { value: '' } })}>
              Clear
            </button>
            <button
              type="button"
              className="text-link"
              onClick={() => {
                const t = new Date()
                if (!disabledDate(t)) pick(t)
                else setViewDate(t)
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
