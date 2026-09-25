import { useEffect } from 'react'

// Every full-viewport scrim in the app. .confirm-dialog and .fund-detail-dialog
// are panels rendered *inside* .enroll-modal-bg, so they're covered by it and
// must not be listed separately.
const OVERLAY_SELECTOR = '.enroll-modal-bg, .slideover-bg'

// Freezes background scrolling while any overlay is open.
//
// Driven by the presence of a scrim in the DOM rather than by a prop on each
// dialog, and mounted once at the app root. There are 16 inline
// `.enroll-modal-bg` dialogs spread across the pages and only five of them
// remember to call useFocusTrap, so a per-call-site flag would have been
// missed in most of them today and in every dialog added later. Keying off the
// scrim means a dialog gets scroll locking simply by rendering one.
//
// Deliberately not applied to dropdown/menu popovers (the account menu, the
// demo scenario switcher, Select) — those are dismissed by scrolling, and
// locking the page under them would feel broken.
export function useOverlayScrollLock() {
  useEffect(() => {
    const { body, documentElement: html } = document
    let locked = false

    const sync = () => {
      const shouldLock = Boolean(document.querySelector(OVERLAY_SELECTOR))
      if (shouldLock === locked) return
      locked = shouldLock
      if (shouldLock) {
        // Reserve the width of the scrollbar we're about to remove, otherwise
        // the page behind the scrim shifts sideways as the dialog opens.
        const gutter = window.innerWidth - html.clientWidth
        // Both elements, not just body: the document's scrolling element is
        // <html>, so hiding overflow on <body> alone left the page scrollable
        // behind the scrim.
        html.style.overflow = 'hidden'
        body.style.overflow = 'hidden'
        if (gutter > 0) body.style.paddingRight = `${gutter}px`
      } else {
        html.style.overflow = ''
        body.style.overflow = ''
        body.style.paddingRight = ''
      }
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      html.style.overflow = ''
      body.style.overflow = ''
      body.style.paddingRight = ''
    }
  }, [])
}
