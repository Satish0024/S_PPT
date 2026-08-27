import { AlertTriangle } from 'lucide-react'
import { useEscapeToClose } from '../../hooks/useEscapeToClose'

// Centered confirmation dialog — distinct from Slideover (a side panel).
// Used for interruptive confirmations like "Outstanding loan detected!".
export default function ConfirmDialog({ title, body, confirmLabel = 'Okay', cancelLabel = 'Cancel', onConfirm, onCancel }) {
  useEscapeToClose(true, onCancel)

  return (
    <div className="enroll-modal-bg" role="presentation" onClick={onCancel}>
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="confirm-dialog-ico" aria-hidden="true">
          <AlertTriangle size={22} strokeWidth={2.2} />
        </span>
        <h4 id="confirm-title">{title}</h4>
        <p>{body}</p>
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
