import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'saturnaA11y'

// Every toggle here is implemented with plain CSS applied via data-a11y-*
// attributes on <html> (see the "Accessibility" block in styles/index.css) —
// no third-party script, no injected iframe, nothing that can silently break
// or phone home. Font scale is a step index into FONT_SCALES rather than a
// free numeric value, so the UI can offer discrete "Normal / Large / Larger /
// Largest" steps like the reference (UserWay) without arbitrary float drift.
export const FONT_SCALES = [1, 1.125, 1.25, 1.4]

const DEFAULTS = {
  fontScaleIndex: 0,
  textSpacing: false,
  highlightLinks: false,
  pauseAnimations: false,
  hideImages: false,
  highContrast: false,
  dyslexiaFont: false,
  bigCursor: false
}

// One-click bundles, same idea as UserWay's "Accessibility Profiles" —
// each just sets several of the existing, already-implemented toggles at
// once rather than introducing any new behavior of its own.
export const PROFILES = [
  {
    id: 'vision',
    label: 'Vision impairment',
    hint: 'Bigger text, high contrast, underlined links',
    apply: (s) => ({ ...s, fontScaleIndex: 2, highContrast: true, highlightLinks: true })
  },
  {
    id: 'cognitive',
    label: 'Cognitive & reading',
    hint: 'Dyslexia-friendly font, extra spacing, no motion',
    apply: (s) => ({ ...s, dyslexiaFont: true, textSpacing: true, pauseAnimations: true })
  },
  {
    id: 'motor',
    label: 'Motor & keyboard',
    hint: 'Bigger cursor, bigger text, no motion',
    apply: (s) => ({ ...s, bigCursor: true, fontScaleIndex: 1, pauseAnimations: true })
  }
]

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw)
    // Merge over DEFAULTS rather than trusting the stored shape outright —
    // guards against a future release adding/renaming a field.
    return { ...DEFAULTS, ...parsed }
  } catch {
    return DEFAULTS
  }
}

const AccessibilityContext = createContext(null)

export function AccessibilityProvider({ children }) {
  const [settings, setSettings] = useState(readStored)

  useEffect(() => {
    const root = document.documentElement
    const scale = FONT_SCALES[settings.fontScaleIndex] ?? 1
    root.style.setProperty('--a11y-font-scale', String(scale))

    root.toggleAttribute('data-a11y-spacing', settings.textSpacing)
    root.toggleAttribute('data-a11y-links', settings.highlightLinks)
    root.toggleAttribute('data-a11y-pause', settings.pauseAnimations)
    root.toggleAttribute('data-a11y-hide-images', settings.hideImages)
    root.toggleAttribute('data-a11y-contrast', settings.highContrast)
    root.toggleAttribute('data-a11y-dyslexia', settings.dyslexiaFont)
    root.toggleAttribute('data-a11y-cursor', settings.bigCursor)

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      /* storage unavailable (private mode) — settings still apply for this session */
    }
  }, [settings])

  const set = useCallback((patch) => {
    setSettings((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }))
  }, [])

  const cycleFontScale = useCallback(() => {
    setSettings((s) => ({ ...s, fontScaleIndex: (s.fontScaleIndex + 1) % FONT_SCALES.length }))
  }, [])

  const toggle = useCallback((key) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }))
  }, [])

  const reset = useCallback(() => setSettings(DEFAULTS), [])

  const applyProfile = useCallback((profileId) => {
    const profile = PROFILES.find((p) => p.id === profileId)
    if (!profile) return
    setSettings((s) => profile.apply(s))
  }, [])

  const isActive = useMemo(
    () =>
      settings.fontScaleIndex !== 0 ||
      settings.textSpacing ||
      settings.highlightLinks ||
      settings.pauseAnimations ||
      settings.hideImages ||
      settings.highContrast ||
      settings.dyslexiaFont ||
      settings.bigCursor,
    [settings]
  )

  const value = useMemo(
    () => ({ settings, set, toggle, cycleFontScale, reset, applyProfile, isActive }),
    [settings, set, toggle, cycleFontScale, reset, applyProfile, isActive]
  )

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) throw new Error('useAccessibility must be used inside AccessibilityProvider')
  return ctx
}
