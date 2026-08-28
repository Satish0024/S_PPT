import { useId } from 'react'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { useEscapeToClose } from '../../hooks/useEscapeToClose'

// Lightweight fund-info popup opened by clicking a hyperlinked investment
// name — wherever investments are listed (Investment Portfolio, the
// enrollment Investment Election step, the Transfer wizard) they're
// supposed to link somewhere rather than sit as plain text (Prototype
// review #6). `fields` is an ordered list of {label, value} pairs; only
// truthy values render, so each caller can pass whatever it actually knows
// about the fund.
export default function FundDetailDialog({ name, fields = [], onClose }) {
  useEscapeToClose(true, onClose)
  const trapRef = useFocusTrap(true)
  const titleId = useId()

  return (
    <div className="enroll-modal-bg" role="presentation" onClick={onClose}>
      <div
        ref={trapRef}
        className="fund-detail-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <h4 id={titleId}>{name}</h4>
        <dl className="fund-detail-list">
          {fields
            .filter((f) => f.value !== undefined && f.value !== null && f.value !== '')
            .map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
        </dl>
        <div className="txn-actions" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
