import { Children, isValidElement, useEffect, useRef, useState } from 'react'
import { Icon } from '../../lib/icons'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'

// A stand-in for the native <option> — Select reads its props to build the
// list, it never renders on its own.
export function Option() {
  return null
}

// A custom, document-styled dropdown that drop-in replaces a native
// <select>/<option> pair. Keeps the same children-as-options API and calls
// onChange with an { target: { value } } shape so existing
// `onChange={(e) => set(e.target.value)}` handlers work unchanged.
export default function Select({ id, value, onChange, disabled, placeholder, className = '', children, ...rest }) {
  const [open, setOpen] = useState(false)
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

  const opts = Children.toArray(children)
    .filter(isValidElement)
    .map((el) => ({
      value: el.props.value !== undefined ? el.props.value : el.props.children,
      label: el.props.children,
      disabled: el.props.disabled
    }))

  const current = opts.find((o) => String(o.value) === String(value))

  const choose = (v) => {
    onChange?.({ target: { value: v } })
    setOpen(false)
  }

  return (
    <div className={`ui-select${className ? ` ${className}` : ''}${disabled ? ' disabled' : ''}`} ref={ref}>
      <button
        type="button"
        id={id}
        className="ui-select-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        {...rest}
      >
        <span className="ui-select-value">{current ? current.label : placeholder || opts[0]?.label}</span>
        <Icon icon={faChevronDown} size={13} aria-hidden="true" className="ui-select-caret" />
      </button>
      {open && (
        <ul className="ui-select-menu" role="listbox" aria-labelledby={id}>
          {opts.map((o, i) => (
            <li key={`${o.value}-${i}`} role="option" aria-selected={String(o.value) === String(value)}>
              <button
                type="button"
                className={`ui-select-opt${String(o.value) === String(value) ? ' active' : ''}`}
                disabled={o.disabled}
                onClick={() => choose(o.value)}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
