import { useEffect } from 'react'
import { Icon } from '../../lib/icons'
import { faCheck, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import '../../styles/toast.css'

// tone: 'success' (default) or 'error' -- each reads its icon/color through
// the app's existing --green/--red theme tokens, so it recolors with the
// palette automatically instead of a hardcoded hex.
export default function Toast({ message, tone = 'success', onDismiss, duration = 3500 }) {
  useEffect(() => {
    if (!message) return undefined
    const id = window.setTimeout(() => onDismiss?.(), duration)
    return () => window.clearTimeout(id)
  }, [message, duration, onDismiss])

  if (!message) return null

  return (
    <div className={`toast toast-${tone}`} role={tone === 'error' ? 'alert' : 'status'} aria-live={tone === 'error' ? 'assertive' : 'polite'}>
      <span className="toast-ico" aria-hidden="true">
        <Icon icon={tone === 'error' ? faTriangleExclamation : faCheck} size={12} />
      </span>
      {message}
    </div>
  )
}
