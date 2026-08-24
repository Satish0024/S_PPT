import { Eye, EyeOff } from 'lucide-react'

export function Row({ label, value, hint, children }) {
  const empty = value == null || String(value).trim() === ''
  return (
    <div className="pr-row">
      <span>{label}</span>
      <div>
        {children || <b className={empty ? 'empty' : ''}>{empty ? '—' : value}</b>}
        {hint ? <small>{hint}</small> : null}
      </div>
    </div>
  )
}

export function SsnRow({ label, value, revealed, onToggle }) {
  return (
    <div className="pr-row">
      <span>{label}</span>
      <div>
        <b className="pr-ssn">
          {value}
          <button type="button" className="pr-eye inline" aria-label={revealed ? 'Hide SSN' : 'Show SSN'} onClick={onToggle}>
            {revealed ? <EyeOff size={14} strokeWidth={2.2} /> : <Eye size={14} strokeWidth={2.2} />}
          </button>
        </b>
      </div>
    </div>
  )
}

export function TextField({ label, value, onChange, required, placeholder, type = 'text', hint, wide }) {
  return (
    <label className={`pr-field${wide ? ' wide' : ''}`}>
      <span>
        {label}
        {required ? <i>*</i> : null}
      </span>
      <div>
        <input type={type} value={value} placeholder={placeholder || ''} onChange={(e) => onChange(e.target.value)} />
        {hint ? <small>{hint}</small> : null}
      </div>
    </label>
  )
}

export function NameFields({ first, middle, last, onFirst, onMiddle, onLast }) {
  return (
    <div className="pr-field">
      <span>Name</span>
      <div className="pr-name-trio">
        <input value={first} placeholder="First" aria-label="First Name" onChange={(e) => onFirst(e.target.value)} />
        <input value={middle} placeholder="Middle" aria-label="Middle Name" onChange={(e) => onMiddle(e.target.value)} />
        <input value={last} placeholder="Last" aria-label="Last Name" onChange={(e) => onLast(e.target.value)} />
      </div>
    </div>
  )
}

export function SplitField({ label, left, right }) {
  return (
    <div className="pr-field">
      <span>{label}</span>
      <div className="pr-pair">
        <input
          value={left.value}
          placeholder={left.placeholder || ''}
          aria-label={left.aria}
          onChange={(e) => left.onChange(e.target.value)}
        />
        <input
          value={right.value}
          placeholder={right.placeholder || ''}
          aria-label={right.aria}
          onChange={(e) => right.onChange(e.target.value)}
        />
      </div>
    </div>
  )
}

export function SelectField({ label, value, onChange, options, required, placeholder, wide }) {
  return (
    <label className={`pr-field${wide ? ' wide' : ''}`}>
      <span>
        {label}
        {required ? <i>*</i> : null}
      </span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  )
}

export function SsnField({ label, value, revealed, onToggle, onChange, required, placeholder }) {
  return (
    <label className="pr-field">
      <span>
        {label}
        {required ? <i>*</i> : null}
      </span>
      <div className="pr-input-ico">
        <input
          type={revealed ? 'text' : 'password'}
          value={value}
          placeholder={placeholder || ''}
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="button" className="pr-eye" aria-label={revealed ? 'Hide SSN' : 'Show SSN'} onClick={onToggle}>
          {revealed ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
        </button>
      </div>
    </label>
  )
}

export function PhoneField({ label, country, number, onCountry, onNumber, required, placeholder }) {
  return (
    <div className="pr-field">
      <span>
        {label}
        {required ? <i>*</i> : null}
      </span>
      <div className="pr-phone">
        <input value={country} onChange={(e) => onCountry(e.target.value)} aria-label="Country code" />
        <input value={number} placeholder={placeholder || ''} onChange={(e) => onNumber(e.target.value)} />
      </div>
    </div>
  )
}

export function RadioYesNo({ label, value, onChange }) {
  const on = value === true || value === 'Yes'
  return (
    <div className="pr-field wide">
      <span>{label}</span>
      <div className="pr-radios">
        {['Yes', 'No'].map((opt) => (
          <label key={opt} className={on === (opt === 'Yes') ? 'on' : ''}>
            <input type="radio" name={label} checked={on === (opt === 'Yes')} onChange={() => onChange(opt === 'Yes')} />
            {opt}
          </label>
        ))}
      </div>
    </div>
  )
}

export function ProfileBlock({ title, children, form }) {
  return (
    <section className="pr-block">
      {title ? <h3>{title}</h3> : null}
      {form ? <div className="pr-form">{children}</div> : children}
    </section>
  )
}

export function SectionBar({ title, action }) {
  return (
    <div className="pr-sec-h">
      <h3>{title}</h3>
      {action ? <div className="pr-sec-actions">{action}</div> : null}
    </div>
  )
}

export function Flag({ label, on }) {
  const yes = on === true || on === 'Yes'
  return (
    <span className={`pr-flag${yes ? ' yes' : ''}`}>
      {label}
      <b>{yes ? 'Yes' : 'No'}</b>
    </span>
  )
}
