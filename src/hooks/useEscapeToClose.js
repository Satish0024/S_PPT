import { useEffect } from 'react'

// Closes an open modal/dialog when the participant presses Escape.
// Pass `active` (usually the modal's own open state) so the listener only
// attaches while the modal is actually visible.
export function useEscapeToClose(active, onClose) {
  useEffect(() => {
    if (!active) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [active, onClose])
}
