import { useEffect } from 'react'
import { Check, TriangleAlert } from 'lucide-react'
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
    <div
      className={`toast toast-${tone}`}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
    >
      <span className="toast-ico" aria-hidden="true">
        {tone === 'error' ? <TriangleAlert size={14} strokeWidth={2.4} /> : <Check size={14} strokeWidth={2.6} />}
      </span>
      {message}
    </div>
  )
}
