import { useId } from 'react'
import { X } from 'lucide-react'
import { useEscapeToClose } from '../../hooks/useEscapeToClose'
import { useFocusTrap } from '../../hooks/useFocusTrap'

// Reusable right-side slideover panel — used by the loan calculator, edit
// allocation, and buy/sell-details flows in the transaction wizards.
// `width`: 'narrow' (~420px, e.g. calculators) or 'wide' (~640px, e.g.
// tables/allocation editors). `actions` renders in the header, to the right
// of the title (e.g. Cancel + Save, or just a Close button).
export default function Slideover({ title, width = 'narrow', onClose, actions, children }) {
  useEscapeToClose(true, onClose)
  const trapRef = useFocusTrap(true)
  const titleId = useId()

  return (
    <div className="slideover-bg" role="presentation" onClick={onClose}>
      <div
        ref={trapRef}
        className={`slideover-panel slideover-${width}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="slideover-head">
          <h3 id={titleId}>{title}</h3>
          <div className="slideover-head-actions">
            {actions}
            <button type="button" className="slideover-close" onClick={onClose} aria-label="Close">
              <X size={18} strokeWidth={2.2} />
            </button>
          </div>
        </div>
        <div className="slideover-body">{children}</div>
      </div>
    </div>
  )
}
