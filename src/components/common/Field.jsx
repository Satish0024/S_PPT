import { cloneElement, useId } from 'react'

// A labelled form row. Generates an id and wires the <label> to the control,
// so assistive tech announces them together — the plain sibling
// <label> + <input> pattern this replaces left the control unlabelled.
export default function Field({ label, required, note, noteClass, children }) {
  const id = useId()
  return (
    <div className="txn-field">
      <label htmlFor={id}>
        {label}
        {required && <i aria-hidden="true">*</i>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {cloneElement(children, { id, ...(required ? { required: true } : null) })}
      {note && <span className={`note${noteClass ? ` ${noteClass}` : ''}`}>{note}</span>}
    </div>
  )
}

// Grouped controls (radios, checkboxes, or a multi-input row like a term
// split across years/months). A fieldset+legend is what lets a screen reader
// announce the group's name before each individual option.
export function FieldGroup({ label, required, note, noteClass, children }) {
  return (
    <fieldset className="txn-field txn-fieldset">
      <legend>
        {label}
        {required && <i aria-hidden="true">*</i>}
        {required && <span className="sr-only"> (required)</span>}
      </legend>
      {children}
      {note && <span className={`note${noteClass ? ` ${noteClass}` : ''}`}>{note}</span>}
    </fieldset>
  )
}
