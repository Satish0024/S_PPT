import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const THEME_KEY = 'saturnaTheme'
const ThemeContext = createContext(null)

// 'system' follows the OS setting and keeps following it as the OS changes;
// 'light'/'dark' are explicit user overrides that persist across sessions.
function readStored() {
  try {
    const v = localStorage.getItem(THEME_KEY)
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'system'
  } catch {
    return 'system'
  }
}

function systemPrefersDark() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(readStored)
  const [systemDark, setSystemDark] = useState(systemPrefersDark)

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mq) return
    const onChange = (e) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolved = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved)
    try {
      localStorage.setItem(THEME_KEY, preference)
    } catch {
      /* storage unavailable (private mode) — the theme still applies for this session */
    }
  }, [resolved, preference])

  const toggle = useCallback(() => {
    // Toggling from "system" commits to the opposite of what's showing, so
    // one click always visibly flips the theme.
    setPreference(resolved === 'dark' ? 'light' : 'dark')
  }, [resolved])

  const value = useMemo(
    () => ({ preference, setPreference, theme: resolved, toggle }),
    [preference, resolved, toggle]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
