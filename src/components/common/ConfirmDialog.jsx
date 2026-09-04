import { useId } from 'react'
import { Icon } from '../../lib/icons'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { useEscapeToClose } from '../../hooks/useEscapeToClose'
import { useFocusTrap } from '../../hooks/useFocusTrap'

// Centered confirmation dialog — distinct from Slideover (a side panel).
// Used for interruptive confirmations like "Outstanding loan detected!".
export default function ConfirmDialog({ title, body, confirmLabel = 'Okay', cancelLabel = 'Cancel', onConfirm, onCancel }) {
  useEscapeToClose(true, onCancel)
  const trapRef = useFocusTrap(true)
  const titleId = useId()
  const bodyId = `${titleId}-body`

  return (
    <div className="enroll-modal-bg" role="presentation" onClick={onCancel}>
      <div
        ref={trapRef}
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="confirm-dialog-ico" aria-hidden="true">
          <Icon icon={faExclamationTriangle} size={22} />
        </span>
        <h4 id={titleId}>{title}</h4>
        <p id={bodyId}>{body}</p>
        <div className="confirm-dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn-primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
