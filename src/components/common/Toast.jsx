import { useEffect } from 'react'
import { Icon } from '../../lib/icons'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import '../../styles/toast.css'

export default function Toast({ message, onDismiss, duration = 3500 }) {
  useEffect(() => {
    if (!message) return undefined
    const id = window.setTimeout(() => onDismiss?.(), duration)
    return () => window.clearTimeout(id)
  }, [message, duration, onDismiss])

  if (!message) return null

  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast-ico" aria-hidden="true">
        <Icon icon={faCheck} size={12} />
      </span>
      {message}
    </div>
  )
}
