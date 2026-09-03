import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle, Check, ChevronDown, Copy, Eye, Keyboard, Mic, Moon, MousePointerClick,
  ShieldCheck, Sun, Type as TypeIcon, Volume2, X
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import '../styles/design-system.css'

const NAV = [
  { group: 'Get started', items: [
    { id: 'overview', label: 'Overview' },
    { id: 'principles', label: 'Principles' },
  ] },
  { group: 'Foundations', items: [
    { id: 'color', label: 'Color' },
    { id: 'type', label: 'Typography' },
    { id: 'space', label: 'Spacing & radius' },
    { id: 'elevation', label: 'Elevation' },
  ] },
  { group: 'Components', items: [
    { id: 'buttons', label: 'Buttons' },
    { id: 'forms', label: 'Forms & inputs' },
    { id: 'selection', label: 'Checkbox, radio, switch' },
    { id: 'feedback', label: 'Badges & alerts' },
    { id: 'nav', label: 'Navigation' },
    { id: 'tabs', label: 'Tabs & steps' },
    { id: 'table', label: 'Tables (zebra)' },
    { id: 'dialog', label: 'Dialogs & modals' },
    { id: 'legend', label: 'Chart legend' },
    { id: 'a11y-toolbar', label: 'Accessibility toolbar' },
  ] },
  { group: 'Accessibility', items: [
    { id: 'wcag', label: 'WCAG 2.2 AA checklist' },
    { id: 'keyboard', label: 'Keyboard interaction' },
    { id: 'sr', label: 'Screen reader / NVDA' },
    { id: 'contrast', label: 'Color contrast' },
  ] },
  { group: 'UX specification', items: [
    { id: 'layout', label: 'Layout & breakpoints' },
    { id: 'states', label: 'Interaction states' },
    { id: 'content', label: 'Content & tone' },
  ] },
]

const COLORS = [
  ['Brand', '--brand'], ['Brand dark', '--brand-dark'], ['Accent', '--accent'],
  ['Ink (text)', '--ink'], ['Ink soft', '--ink-soft'], ['Muted', '--muted'],
  ['Line', '--line'], ['Background', '--bg'], ['Panel', '--panel'],
  ['Active bg', '--active-bg'], ['Green (success)', '--green'], ['Amber (warning)', '--amber'],
  ['Red (danger)', '--red'], ['Surface 2', '--surface-2'], ['Surface 3', '--surface-3'],
]

// name, var — hex values are resolved live (see useDualThemeTokens) from
// whichever brand build is actually running, never hardcoded, so this table
// is correct on every brand (CORE, Saturna, LendGuard, or any future one).
const COLOR_GROUPS = [
  { title: 'Brand', tokens: [
    ['Brand', '--brand'], ['Brand dark (hover)', '--brand-dark'], ['Brand fill (solid surfaces)', '--brand-fill'],
    ['Accent', '--accent'], ['Link', '--link'],
  ] },
  { title: 'Neutrals', tokens: [
    ['Ink (primary text)', '--ink'], ['Ink soft (secondary text)', '--ink-soft'], ['Muted (tertiary text)', '--muted'],
    ['Line (border)', '--line'], ['Line strong (emphasized border)', '--line-strong'], ['Background', '--bg'],
    ['Panel', '--panel'], ['Surface 2', '--surface-2'], ['Surface 3', '--surface-3'],
    ['Active bg', '--active-bg'], ['Hover bg', '--hover-bg'],
  ] },
  { title: 'Status — success', tokens: [
    ['Green', '--green'], ['Green bg', '--green-bg'], ['Green line', '--green-line'],
  ] },
  { title: 'Status — warning', tokens: [
    ['Amber', '--amber'], ['Amber bg', '--amber-bg'], ['Amber line', '--amber-line'],
  ] },
  { title: 'Status — danger', tokens: [
    ['Red', '--red'], ['Red bg', '--red-bg'], ['Red line', '--red-line'],
  ] },
  { title: 'Chart colors', tokens: [
    ['Chart 1 (total / negative)', '--chart-1'], ['Chart 2 (primary series)', '--chart-2'],
    ['Chart 3 (positive / growth)', '--chart-3'], ['Chart 4 (caution / secondary)', '--chart-4'],
    ['Chart 5 (overflow)', '--chart-5'], ['Chart 6 (overflow)', '--chart-6'],
    ['Chart 7 (overflow)', '--chart-7'],
  ] },
]

// Illustrative tint/shade ramp derived live from --brand via CSS color-mix —
// not separate tokens, so it stays correct if --brand is ever rebranded.
const BRAND_SCALE = [
  [50, 'white', 92], [100, 'white', 80], [200, 'white', 62], [300, 'white', 42], [400, 'white', 20],
  [500, 'base', 0],
  [600, 'black', 15], [700, 'black', 30], [800, 'black', 45], [900, 'black', 60],
]

const TYPE_SCALE = [
  { tag: 'H1', cls: 'ds-type-h1', size: '34px', weight: 800, lh: '1.15', ls: '-0.6px', use: 'Page title (one per page)' },
  { tag: 'H2', cls: 'ds-type-h2', size: '26px', weight: 800, lh: '1.2', ls: '-0.4px', use: 'Section heading' },
  { tag: 'H3', cls: 'ds-type-h3', size: '20px', weight: 700, lh: '1.25', ls: '-0.3px', use: 'Subsection / card group heading' },
  { tag: 'H4', cls: 'ds-type-h4', size: '16px', weight: 700, lh: '1.3', ls: '0px', use: 'Card title, widget heading (defined for consistency — not yet used standalone)' },
  { tag: 'H5', cls: 'ds-type-h5', size: '14px', weight: 700, lh: '1.35', ls: '0px', use: 'Dense list/group heading (defined for consistency — not yet used standalone)' },
  { tag: 'H6', cls: 'ds-type-h6', size: '12px', weight: 800, lh: '1.3', ls: '0.4px', use: 'Eyebrow / overline label (defined for consistency — not yet used standalone)' },
  { tag: 'P1', cls: 'ds-type-p1', size: '16px', weight: 400, lh: '1.6', ls: '0px', use: 'Lead paragraph / intro copy (defined for consistency — not yet used standalone)' },
  { tag: 'P2', cls: 'ds-type-p2', size: '15px', weight: 400, lh: '1.55', ls: '0px', use: 'Body text (the app default)' },
  { tag: 'P3', cls: 'ds-type-p3', size: '13.5px', weight: 600, lh: '1.5', ls: '0px', use: 'Body soft, form labels' },
  { tag: 'Caption', cls: 'ds-type-caption', size: '11.5px', weight: 700, lh: '1.4', ls: '0.3px', use: 'Meta text, table headers, timestamps' },
  { tag: 'Code', cls: 'ds-type-code', size: '12.5px', weight: 400, lh: '1.6', ls: '0px', use: 'Inline code, token names (defined for consistency — not yet used standalone)' },
]

const KEYBOARD_ROWS = [
  ['Tab / Shift+Tab', 'Move focus to next / previous interactive element', 'Global'],
  ['Enter / Space', 'Activate a button, link, or a div acting as a button (role="button")', 'Buttons, custom controls'],
  ['Arrow keys', 'Move within a composite widget (radio group, tab list, menu)', 'Radios, tabs, dropdown menus'],
  ['Escape', 'Close an open dialog, dropdown, or menu without committing', 'Dialogs, menus, legend overflow panel'],
  ['Home / End', 'Jump to first / last item in a list or menu', 'Menus, step navigator'],
]

const WCAG_CHECKS = [
  ['1.4.3', 'Contrast (Minimum)', 'Text vs. background meets 4.5:1 (3:1 for large text) in both light and dark themes.'],
  ['1.4.11', 'Non-text Contrast', 'Input borders, focus rings, and icon-only controls meet 3:1 against adjacent colors.'],
  ['2.1.1', 'Keyboard', 'Every interactive control — including div-based custom controls — is reachable and operable via keyboard alone.'],
  ['2.4.7', 'Focus Visible', 'A visible focus indicator is drawn for every focusable element, never clipped by a scrolling ancestor.'],
  ['2.4.3', 'Focus Order', 'Focus order follows the visual/reading order — no unexpected jumps when tabbing.'],
  ['2.5.5', 'Target Size', 'Touch targets are at least 24×24px (44×44px preferred) with adequate spacing.'],
  ['3.3.1', 'Error Identification', 'Form errors are announced via role="alert" and described in text, not color alone.'],
  ['4.1.2', 'Name, Role, Value', 'Custom components expose an accessible name, role, and state via semantic HTML or ARIA.'],
]

function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
  }
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.focus()
  ta.select()
  try { document.execCommand('copy') } finally { document.body.removeChild(ta) }
  return Promise.resolve()
}

function CopyButton({ text, label = 'Copy', className = '', small = false }) {
  const [copied, setCopied] = useState(false)
  const onClick = async () => {
    await copyToClipboard(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }
  return (
    <button
      type="button"
      className={`ds-copy-btn ${small ? 'ds-copy-btn-sm' : ''} ${copied ? 'copied' : ''} ${className}`}
      onClick={onClick}
      aria-label={copied ? `${label} copied` : label}
    >
      {copied ? <Check size={small ? 12 : 13} /> : <Copy size={small ? 12 : 13} />}
      {!small && <span>{copied ? 'Copied!' : label}</span>}
    </button>
  )
}

/** Resolves a CSS custom property (e.g. "--brand") to its live computed hex/color value. */
function useResolvedTokens(varNames) {
  const { theme } = useTheme()
  const [values, setValues] = useState({})
  const depKey = varNames.join(',')
  useEffect(() => {
    // Deferred (not read synchronously): ThemeProvider's own effect (an
    // ancestor) is what actually flips [data-theme] on <html>, and child
    // effects in the same commit fire before ancestor effects — reading
    // synchronously here would pick up the outgoing theme's colors, one
    // toggle behind. A macrotask (not requestAnimationFrame — rAF is paused
    // while this tab is backgrounded/hidden, e.g. in a preview pane) runs
    // after all of this commit's effects have flushed.
    const t = setTimeout(() => {
      const styles = getComputedStyle(document.documentElement)
      const next = {}
      varNames.forEach((v) => { next[v] = styles.getPropertyValue(v).trim() || '—' })
      setValues(next)
    }, 0)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depKey, theme])
  return values
}

/**
 * Resolves BOTH the light- and dark-theme value of each CSS custom property,
 * regardless of which theme the page currently has active, and regardless of
 * which brand build (CORE/Saturna/LendGuard/etc.) is running — no hardcoded
 * hex, so this table is always correct for whatever brand is deployed.
 * Momentarily flips [data-theme] on <html> to read each variant, then
 * restores it — all synchronous within one effect, so nothing paints in
 * between and there's no visible flicker.
 */
function useDualThemeTokens(varNames) {
  const [pair, setPair] = useState({ light: {}, dark: {} })
  const depKey = varNames.join(',')
  useEffect(() => {
    const root = document.documentElement
    const original = root.getAttribute('data-theme')
    const read = () => {
      const styles = getComputedStyle(root)
      const out = {}
      varNames.forEach((v) => { out[v] = styles.getPropertyValue(v).trim() || '—' })
      return out
    }
    root.setAttribute('data-theme', 'light')
    const light = read()
    root.setAttribute('data-theme', 'dark')
    const dark = read()
    if (original) root.setAttribute('data-theme', original)
    else root.removeAttribute('data-theme')
    setPair({ light, dark })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depKey])
  return pair
}

function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const onScroll = () => {
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top - 90 <= 0) current = id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [ids])
  return active
}

function Code({ children }) {
  return (
    <div className="ds-code-wrap">
      <CopyButton text={children} label="Copy code" className="ds-code-copy" />
      <pre className="ds-code">{children}</pre>
    </div>
  )
}

function Component({ id, title, desc, tags = [], demo, dos = [], donts = [], code, extra, colors = [] }) {
  const tokenValues = useResolvedTokens(colors.map(([, v]) => v))
  return (
    <div id={id} className="ds-card">
      <div className="ds-card-head">
        <div>
          <h3>{title}</h3>
          <p>{desc}</p>
        </div>
        <div className="ds-card-tags">
          {tags.map((t) => <span key={t} className={`ds-tag ${t === 'WCAG 2.2 AA' ? 'wcag' : ''}`}>{t}</span>)}
        </div>
      </div>
      <div className="ds-demo">{demo}</div>
      {extra}
      {colors.length > 0 && (
        <div className="ds-comp-colors">
          <span className="ds-comp-colors-label">Colors used</span>
          <div className="ds-comp-colors-list">
            {colors.map(([name, varName]) => {
              const hex = tokenValues[varName]
              return (
                <button
                  key={`${varName}-${name}`}
                  type="button"
                  className="ds-color-chip"
                  onClick={() => hex && copyToClipboard(hex)}
                  title="Click to copy color value"
                >
                  <span className="ds-color-chip-dot" style={{ background: `var(${varName})` }} />
                  {name} <code>{hex}</code>
                  <Copy size={11} />
                </button>
              )
            })}
          </div>
        </div>
      )}
      {(dos.length > 0 || donts.length > 0 || code) && (
        <div className="ds-panel">
          {dos.map((d, i) => (
            <div key={`do-${i}`} className="ds-panel-row dos"><b>Do — </b>{d}</div>
          ))}
          {donts.map((d, i) => (
            <div key={`dont-${i}`} className="ds-panel-row donts"><b>Don't — </b>{d}</div>
          ))}
          {code && <Code>{code}</Code>}
        </div>
      )}
    </div>
  )
}

export default function DesignSystem() {
  const ids = NAV.flatMap((g) => g.items.map((i) => i.id))
  const active = useScrollSpy(ids)
  const tokenValues = useResolvedTokens(COLORS.map(([, v]) => v))
  const dualTokens = useDualThemeTokens(COLOR_GROUPS.flatMap((g) => g.tokens.map(([, v]) => v)))
  const { theme, toggle } = useTheme()

  return (
    <div className="ds">
      <header className="ds-top">
        <div className="ds-logo"><span className="dot" /> Participant Portal Design System</div>
        <div className="ds-meta">
          <span className="ds-badge"><ShieldCheck size={13} /> WCAG 2.2 AA target</span>
          <button
            type="button"
            className="ds-theme-toggle"
            onClick={toggle}
            aria-pressed={theme === 'dark'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <Link to="/" className="ds-back">← Back to app</Link>
        </div>
      </header>

      <div className="ds-shell">
        <nav className="ds-nav" aria-label="Design system sections">
          {NAV.map((g) => (
            <div key={g.group} className="ds-nav-group">
              <h4>{g.group}</h4>
              {g.items.map((i) => (
                <a key={i.id} href={`#${i.id}`} className={active === i.id ? 'active' : ''}>{i.label}</a>
              ))}
            </div>
          ))}
        </nav>

        <main className="ds-main">
          <div className="ds-hero">
            <div className="eyebrow">Participant Portal · Design System v1.0</div>
            <h1>One system, three brands, zero rework.</h1>
            <p>
              This is the living reference for every component, token, interaction pattern, and
              accessibility standard used across the Participant Portal prototype, shared by every
              brand build on this codebase. It documents the UI as it is actually built and styled
              in the codebase today, so engineering, design, and QA share one source of truth before
              implementation review begins.
            </p>
            <div className="ds-hero-stats">
              <div><b>28+</b><span>Documented patterns</span></div>
              <div><b>3</b><span>Brand themes on one system</span></div>
              <div><b>2.2 AA</b><span>Accessibility target</span></div>
              <div><b>2</b><span>Color modes (light / dark)</span></div>
            </div>
            <div className="ds-source">
              <b>Why this exists — </b> per the review request: "have the Design System, Accessibility
              Guidelines, and UX specifications finalized before development starts... to help the
              development team align with the expected UX, ADA/WCAG, NVDA, keyboard navigation, and
              other accessibility standards from the beginning." This document, its component library,
              and accessibility checklist are the deliverable for that review.
            </div>
          </div>

          {/* ---------------- OVERVIEW / PRINCIPLES ---------------- */}
          <section id="overview" className="ds-section">
            <h2>Overview</h2>
            <p className="ds-lede">
              The portal ships as one React codebase with three brand skins selected by build
              branch. Every component below is pulled from the real app CSS — no separate mockup
              library — so this page always reflects what is actually deployed.
            </p>
          </section>

          <section id="principles" className="ds-section">
            <h2>Principles</h2>
            <p className="ds-lede">Four principles guide every UI decision in this system.</p>
            <div className="ds-token-grid">
              {[
                ['Clarity over decoration', 'Every screen states balances, actions, and status in plain language before it styles them.'],
                ['Accessible by default', 'Components ship with correct semantics and focus handling — accessibility is not a follow-up pass.'],
                ['One system, three faces', 'Brand identity lives in tokens (color, logo, type), never in component structure or behavior.'],
                ['Predictable interaction', 'The same control behaves the same way everywhere — one button, one table, one dialog pattern.'],
              ].map(([t, d]) => (
                <div key={t} className="ds-swatch" style={{ padding: 14 }}>
                  <b style={{ fontSize: 14, fontWeight: 700 }}>{t}</b>
                  <span style={{ display: 'block', fontSize: 'var(--text-body-xs-size)', color: 'var(--ink-soft)', marginTop: 6, fontFamily: 'inherit' }}>{d}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ---------------- COLOR ---------------- */}
          <section id="color" className="ds-section">
            <h2>Color</h2>
            <p className="ds-lede">
              Semantic tokens, not hard-coded hex — every component references these CSS custom
              properties so a theme (or brand) swap never touches component code. The grid below
              always shows the page's <b>current</b> theme; the tables further down show
              <b> both</b> light and dark values side by side, plus the neutral and status ramps.
            </p>
            <div className="ds-token-grid">
              {COLORS.map(([name, varName]) => {
                const hex = tokenValues[varName]
                return (
                  <button
                    key={varName}
                    type="button"
                    className="ds-swatch ds-swatch-btn"
                    onClick={() => hex && copyToClipboard(hex)}
                    aria-label={`Copy ${name} color value ${hex || ''}`}
                    title="Click to copy color value"
                  >
                    <div className="ds-swatch-fill" style={{ background: `var(${varName})`, borderBottom: '1px solid var(--line)' }}>
                      <Copy size={13} className="ds-swatch-copy-ico" />
                    </div>
                    <div className="ds-swatch-meta">
                      <b>{name}</b>
                      <span>{varName}</span>
                      <span className="ds-swatch-hex">{hex}</span>
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="ds-callout">
              <ShieldCheck size={16} />
              <span>Every text/background pairing above is verified at ≥4.5:1 contrast in both themes (WCAG 1.4.3).</span>
            </div>

            <h3 className="ds-sub">Brand scale</h3>
            <p className="ds-lede">
              A 10-stop tint/shade ramp computed live from <code>--brand</code> with CSS
              <code> color-mix()</code> — not separate tokens, so it can never drift from the brand
              color and updates automatically if the brand is ever swapped.
            </p>
            <div className="ds-scale-row">
              {BRAND_SCALE.map(([stop, mixWith, pct]) => {
                const bg = stop === 500
                  ? 'var(--brand)'
                  : `color-mix(in srgb, var(--brand) ${100 - pct}%, ${mixWith} ${pct}%)`
                return (
                  <button
                    key={stop}
                    type="button"
                    className="ds-scale-chip"
                    onClick={() => copyToClipboard(stop === 500 ? 'var(--brand)' : `color-mix(in srgb, var(--brand) ${100 - pct}%, ${mixWith} ${pct}%)`)}
                    title={`Copy brand-${stop} CSS`}
                  >
                    <span className="ds-scale-chip-fill" style={{ background: bg }} />
                    <span className="ds-scale-chip-label">{stop}</span>
                  </button>
                )
              })}
            </div>

            {COLOR_GROUPS.map((g) => (
              <div key={g.title}>
                <h3 className="ds-sub">{g.title}</h3>
                <div className="ds-card">
                  <table className="ds-table ds-token-table">
                    <thead><tr><th>Token</th><th>Variable</th><th>Light</th><th>Dark</th></tr></thead>
                    <tbody>
                      {g.tokens.map(([name, varName]) => {
                        const light = dualTokens.light[varName]
                        const dark = dualTokens.dark[varName]
                        return (
                          <tr key={varName}>
                            <td><b style={{ color: 'var(--ink)' }}>{name}</b></td>
                            <td><code>{varName}</code></td>
                            <td>
                              <button type="button" className="ds-hex-cell" onClick={() => light && copyToClipboard(light)} title="Copy light hex">
                                <span className="ds-hex-dot" style={{ background: light }} />{light}
                              </button>
                            </td>
                            <td>
                              <button type="button" className="ds-hex-cell" onClick={() => dark && copyToClipboard(dark)} title="Copy dark hex">
                                <span className="ds-hex-dot" style={{ background: dark }} />{dark}
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>

          {/* ---------------- TYPE ---------------- */}
          <section id="type" className="ds-section">
            <h2>Typography</h2>
            <p className="ds-lede">
              System font stack ("Inclusive Sans" with system fallbacks) at a 15px base. The full
              H1–H6 / P1–P3 / Caption / Code scale is defined below — several levels (H4–H6, P1,
              Code) aren't used by any current screen, but are specified now so engineering never
              has to invent an ad-hoc size when a new screen needs one.
            </p>
            <div className="ds-card">
              <div className="ds-demo ds-demo-col" style={{ gap: 0, padding: 0 }}>
                {TYPE_SCALE.map((t) => (
                  <div key={t.tag} className="ds-type-row2">
                    <div className="ds-type-row2-meta">
                      <b>{t.tag}</b>
                      <span>{t.size} / {t.weight} / {t.lh}</span>
                    </div>
                    <div className={`ds-type-sample ${t.cls}`}>Retirement plan balance</div>
                    <div className="ds-type-row2-use">{t.use}</div>
                  </div>
                ))}
              </div>
              <Code>{`.ds-type-h1{ font-size:34px; font-weight:800; line-height:1.15; letter-spacing:-.6px }
.ds-type-h2{ font-size:26px; font-weight:800; line-height:1.2;  letter-spacing:-.4px }
.ds-type-h3{ font-size:20px; font-weight:700; line-height:1.25; letter-spacing:-.3px }
.ds-type-h4{ font-size:16px; font-weight:700; line-height:1.3  }
.ds-type-h5{ font-size:14px; font-weight:700; line-height:1.35 }
.ds-type-h6{ font-size:12px; font-weight:800; line-height:1.3;  letter-spacing:.4px; text-transform:uppercase }
.ds-type-p1{ font-size:16px;   font-weight:400; line-height:1.6  }
.ds-type-p2{ font-size:15px;   font-weight:400; line-height:1.55 } /* app body default */
.ds-type-p3{ font-size:13.5px; font-weight:600; line-height:1.5  }
.ds-type-caption{ font-size:11.5px; font-weight:700; line-height:1.4; letter-spacing:.3px }
.ds-type-code{ font-family:ui-monospace,monospace; font-size:12.5px; line-height:1.6 }`}</Code>
            </div>
          </section>

          {/* ---------------- SPACE / RADIUS ---------------- */}
          <section id="space" className="ds-section">
            <h2>Spacing & radius</h2>
            <p className="ds-lede">An 4px-based spacing scale keeps rhythm consistent across cards, forms, and tables.</p>
            <div className="ds-card">
              <div className="ds-demo ds-demo-col">
                {[4, 8, 12, 16, 20, 24, 32, 48].map((s) => (
                  <div key={s} className="ds-space-row">
                    <span>{s}px</span>
                    <div className="ds-space-bar" style={{ width: s * 4 }} />
                  </div>
                ))}
              </div>
              <div className="ds-panel">
                <div className="ds-panel-row"><b>Radius — </b>10–12px for inputs/buttons, 14–16px for cards and panels, 999px for pills/badges/toggles.</div>
              </div>
            </div>
          </section>

          {/* ---------------- ELEVATION ---------------- */}
          <section id="elevation" className="ds-section">
            <h2>Elevation</h2>
            <p className="ds-lede">Two shadow tokens — a resting shadow and an elevated one for overlays.</p>
            <div className="ds-demo">
              <div style={{ padding: '18px 24px', borderRadius: 14, background: 'var(--panel)', boxShadow: 'var(--shadow)', border: '1px solid var(--line)' }}>--shadow (cards)</div>
              <div style={{ padding: '18px 24px', borderRadius: 14, background: 'var(--panel)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--line)' }}>--shadow-lg (dropdowns, dialogs)</div>
            </div>
          </section>

          {/* ---------------- BUTTONS ---------------- */}
          <Component
            id="buttons" title="Buttons"
            desc="Primary, secondary, ghost, and icon-only variants — one shared base class, with small/medium/large sizing."
            tags={['WCAG 2.2 AA']}
            demo={<div className="ds-demo-col" style={{ display: 'flex' }}>
              <div>
                <div className="ds-demo-label">Variants</div>
                <div className="ds-demo-row">
                  <button type="button" className="btn btn-primary">Primary</button>
                  <button type="button" className="btn btn-secondary">Secondary</button>
                  <button type="button" className="btn btn-ghost">Ghost</button>
                  <button type="button" className="btn ds-btn-danger">Danger</button>
                  <button type="button" className="btn btn-primary" disabled>Disabled</button>
                </div>
              </div>
              <div>
                <div className="ds-demo-label">Sizes</div>
                <div className="ds-demo-row" style={{ alignItems: 'center' }}>
                  <button type="button" className="btn btn-sm btn-primary">Small</button>
                  <button type="button" className="btn btn-primary">Medium (default)</button>
                  <button type="button" className="btn ds-btn-lg btn-primary">Large</button>
                </div>
              </div>
              <div>
                <div className="ds-demo-label">Icon buttons</div>
                <div className="ds-demo-row" style={{ alignItems: 'center' }}>
                  <button type="button" className="icon-btn ds-icon-btn-sm" aria-label="Settings" title="Settings (small)"><ChevronDown size={15} /></button>
                  <button type="button" className="icon-btn" aria-label="Settings" title="Settings (default)"><ChevronDown size={18} /></button>
                  <button type="button" className="icon-btn ds-icon-btn-lg" aria-label="Settings" title="Settings (large)"><ChevronDown size={22} /></button>
                </div>
              </div>
            </div>}
            dos={['Give every icon-only button an aria-label describing its action.', 'Keep one primary button per view/section so the primary path is unambiguous.']}
            donts={['Never rely on color alone to show a disabled state — pair with aria-disabled and reduced opacity.']}
            code={`<button type="button" className="btn btn-primary">Save changes</button>
<button type="button" className="btn btn-sm btn-secondary">Small secondary</button>
<button type="button" className="btn btn-ghost">Ghost</button>
<button type="button" className="icon-btn" aria-label="Print"><Printer size={18} /></button>`}
            colors={[['Brand fill', '--brand-fill'], ['Brand dark (hover)', '--brand-dark'], ['Line', '--line'], ['Ink (ghost text)', '--ink-soft'], ['Danger', '--red']]}
            extra={
              <div className="ds-panel">
                <div style={{ padding: '4px 20px' }}>
                  <table className="ds-table">
                    <thead><tr><th>Name</th><th>Class</th><th>Padding</th><th>Font</th><th>Status</th></tr></thead>
                    <tbody>
                      <tr><td>Small</td><td><code>.btn.btn-sm</code></td><td>9px 14px</td><td>13px / 700</td><td className="ok">Used</td></tr>
                      <tr><td>Medium (default)</td><td><code>.btn</code></td><td>11px 16px</td><td>14px / 700</td><td className="ok">Used</td></tr>
                      <tr><td>Large</td><td><code>.btn-lg</code></td><td>14px 22px</td><td>15.5px / 700</td><td>Specified — not yet used</td></tr>
                      <tr><td>Primary</td><td><code>.btn-primary</code></td><td>—</td><td>—</td><td className="ok">Used</td></tr>
                      <tr><td>Secondary</td><td><code>.btn-secondary</code></td><td>—</td><td>—</td><td className="ok">Used</td></tr>
                      <tr><td>Ghost</td><td><code>.btn-ghost</code></td><td>—</td><td>—</td><td className="ok">Used</td></tr>
                      <tr><td>Danger</td><td><code>.btn-danger</code></td><td>—</td><td>—</td><td>Specified — not yet used</td></tr>
                      <tr><td>Icon (small)</td><td><code>.icon-btn.icon-btn-sm</code></td><td>28×28px</td><td>—</td><td>Specified — not yet used</td></tr>
                      <tr><td>Icon (default)</td><td><code>.icon-btn</code></td><td>36×36px</td><td>—</td><td className="ok">Used</td></tr>
                      <tr><td>Icon (large)</td><td><code>.icon-btn.icon-btn-lg</code></td><td>44×44px</td><td>—</td><td>Specified — not yet used</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            }
          />

          {/* ---------------- FORMS ---------------- */}
          <Component
            id="forms" title="Forms & inputs"
            desc="Text fields, selects, and search inputs with a visible focus ring on the wrapper."
            tags={['WCAG 2.2 AA']}
            demo={<div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 360 }}>
              <label style={{ fontSize: 'var(--text-caption-size)', fontWeight: 700, color: 'var(--ink-soft)' }}>Account nickname
                <input style={{ marginTop: 6, width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink)' }} placeholder="e.g. My 401(k)" />
              </label>
              <label style={{ fontSize: 'var(--text-caption-size)', fontWeight: 700, color: 'var(--ink-soft)' }}>Distribution plan type
                <select style={{ marginTop: 6, width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink)' }}>
                  <option>401(k)</option><option>403(b)</option><option>IRA — Traditional</option>
                </select>
              </label>
              <p role="alert" style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 'var(--text-caption-size)', color: 'var(--red)', fontWeight: 600 }}>
                <AlertTriangle size={14} /> Target percentages must add up to 100%.
              </p>
            </div>}
            dos={['Associate every input with a <label>, even when visually hidden.', 'Announce validation errors with role="alert" so screen readers pick them up immediately.']}
            donts={['Never use placeholder text as the only label.']}
            code={`<label>Account nickname
  <input placeholder="e.g. My 401(k)" />
</label>
{error && <p role="alert">{error}</p>}`}
            colors={[['Border', '--line'], ['Focus ring', '--brand'], ['Error text', '--red'], ['Panel bg', '--panel']]}
            extra={
              <div className="ds-panel">
                <div style={{ padding: '4px 20px' }}>
                  <table className="ds-table">
                    <thead><tr><th>Size</th><th>Height</th><th>Padding</th><th>Font</th><th>Status</th></tr></thead>
                    <tbody>
                      <tr><td>Small</td><td>32px</td><td>7px 10px</td><td>13px</td><td>Specified — not yet used</td></tr>
                      <tr><td>Medium (default)</td><td>40px</td><td>10px 12px</td><td>14px</td><td className="ok">Used</td></tr>
                      <tr><td>Large</td><td>48px</td><td>13px 14px</td><td>15px</td><td>Specified — not yet used</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            }
          />

          {/* ---------------- SELECTION CONTROLS ---------------- */}
          <Component
            id="selection" title="Checkbox, radio & switch"
            desc="Custom-styled but backed by real <input> elements for native keyboard and screen-reader support."
            tags={['WCAG 2.2 AA']}
            demo={<div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}><input type="checkbox" defaultChecked /> Email statements</label>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}><input type="radio" name="ds-r" defaultChecked /> Direct deposit</label>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}><input type="radio" name="ds-r" /> Mailed check</label>
              <label className="a11y-switch" style={{ display: 'inline-flex' }}>
                <input type="checkbox" defaultChecked /><span className="a11y-switch-track"><span className="a11y-switch-thumb" /></span>
              </label>
            </div>}
            dos={['Use native <input type="checkbox"/radio"> so keyboard, label-click, and AT support come for free.']}
            donts={['Never build a checkbox out of a plain <div> with a click handler — it breaks keyboard and screen-reader support (WCAG 4.1.2).']}
            code={`<label className="a11y-switch">
  <input type="checkbox" checked={on} onChange={toggle} />
  <span className="a11y-switch-track"><span className="a11y-switch-thumb" /></span>
</label>`}
            colors={[['Checked / on', '--brand'], ['Track (off)', '--surface-3'], ['Border', '--line-strong']]}
          />

          {/* ---------------- BADGES / ALERTS ---------------- */}
          <Component
            id="feedback" title="Badges & alerts"
            desc="Status pills and inline banners — color is always paired with a text label or icon."
            tags={['WCAG 2.2 AA']}
            demo={<>
              <span className="badge" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>Active</span>
              <span className="badge" style={{ background: 'var(--amber-bg)', color: 'var(--amber)' }}>Pending</span>
              <span className="badge" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>Action needed</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: 'var(--info, var(--active-bg))', border: '1px solid var(--info-line, var(--line))', fontSize: 14 }}>
                <AlertTriangle size={15} /> Your request was submitted and is pending review.
              </div>
            </>}
            dos={['Pair every status color with a text label ("Active", "Pending") — never color alone.']}
            code={`<span className="badge" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>
  Active
</span>`}
            colors={[['Success', '--green'], ['Success bg', '--green-bg'], ['Warning', '--amber'], ['Warning bg', '--amber-bg'], ['Danger', '--red'], ['Danger bg', '--red-bg']]}
          />

          {/* ---------------- NAV ---------------- */}
          <Component
            id="nav" title="Navigation"
            desc="Left rail (frozen, scrollable) and top bar. Focus rings are drawn inset so a scrolling nav never clips them."
            tags={['WCAG 2.2 AA', 'Keyboard']}
            demo={<div style={{ display: 'flex', gap: 6 }}>
              {['Dashboard', 'Portfolio', 'Transactions'].map((l, i) => (
                <a key={l} href="#nav" onClick={(e) => e.preventDefault()} style={{
                  padding: '10px 14px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600,
                  color: i === 0 ? 'var(--brand)' : 'var(--ink-soft)', background: i === 0 ? 'var(--active-bg)' : 'transparent',
                }}>{l}</a>
              ))}
            </div>}
            dos={['Use outline-offset:-2px on focus rings inside any overflow:auto container so the ring is never clipped.']}
            donts={['Never remove the default focus outline without supplying an equally visible replacement.']}
            code={`.nav a:focus-visible{outline:2px solid var(--brand);outline-offset:-2px;border-radius:8px}
/* inset offset survives a scrolling ancestor with overflow-y:auto */`}
            colors={[['Active text', '--brand'], ['Active bg', '--active-bg'], ['Hover bg', '--hover-bg'], ['Default text', '--ink-soft']]}
          />

          {/* ---------------- TABS / STEPS ---------------- */}
          <Component
            id="tabs" title="Tabs & step navigator"
            desc="Tabs for switching views in place; the step navigator drives multi-step flows (enrollment, transaction requests)."
            tags={['Keyboard']}
            demo={<div style={{ display: 'flex', gap: 4 }}>
              {['Summary', 'Activity', 'Documents'].map((t, i) => (
                <button key={t} type="button" className={`tab ${i === 0 ? 'on' : ''}`}>{t}</button>
              ))}
            </div>}
            dos={['Every step in a wizard is a real, tabIndex=0, keydown-handled control — never a bare div.']}
            code={`<button type="button" className={\`tab \${active ? 'on' : ''}\`} onClick={() => setActive(t)}>
  {t.label}
</button>`}
            colors={[['Active text', '--brand'], ['Active underline', '--brand'], ['Inactive text', '--ink-soft']]}
          />

          {/* ---------------- TABLE ---------------- */}
          <Component
            id="table" title="Tables (zebra)"
            desc="Every data table in the app uses alternating row shading for scan-ability, applied consistently via tbody tr:nth-child(even)."
            demo={<table className="ds-table" style={{ width: '100%' }}>
              <thead><tr><th>Fund</th><th>Allocation</th><th>YTD return</th></tr></thead>
              <tbody>
                <tr><td>Target Date 2050</td><td>45%</td><td className="ok">+8.2%</td></tr>
                <tr><td>US Large Cap Index</td><td>25%</td><td className="ok">+11.4%</td></tr>
                <tr><td>Intl Equity Index</td><td>15%</td><td>+4.1%</td></tr>
                <tr><td>Bond Index</td><td>15%</td><td>-1.3%</td></tr>
              </tbody>
            </table>}
            code={`tbody tr:nth-child(even){ background: var(--surface-2); }`}
            colors={[['Zebra row', '--surface-2'], ['Row border', '--line'], ['Positive value', '--green']]}
          />

          {/* ---------------- DIALOG ---------------- */}
          <Component
            id="dialog" title="Dialogs & modals"
            desc="Focus-trapped, Escape-to-close, labelled by a heading, background inert while open."
            tags={['WCAG 2.2 AA', 'Keyboard']}
            demo={<div style={{ width: 320, border: '1px solid var(--line)', borderRadius: 14, background: 'var(--panel)', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
                <b style={{ fontSize: 'var(--text-body-md-size)' }}>Confirm rollover request</b>
                <X size={16} />
              </div>
              <div style={{ padding: 16, fontSize: 14, color: 'var(--ink-soft)' }}>This will submit your rollover request for processing.</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', padding: '12px 16px', borderTop: '1px solid var(--line)' }}>
                <button type="button" className="btn btn-secondary">Cancel</button>
                <button type="button" className="btn btn-primary">Confirm</button>
              </div>
            </div>}
            dos={['Trap focus inside the dialog while open (useFocusTrap), and return focus to the trigger on close.', 'Bind Escape to close every dialog and dropdown.']}
            donts={['Never let background content remain tabbable while a modal is open.']}
            code={`const trapRef = useFocusTrap(open)
<div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-title" ref={trapRef}>
  <h3 id="dlg-title">Confirm rollover request</h3>
  ...
</div>`}
            colors={[['Panel bg', '--panel'], ['Shadow', '--shadow-lg'], ['Border', '--line']]}
          />

          {/* ---------------- LEGEND ---------------- */}
          <Component
            id="legend" title="Chart legend (overflow-safe)"
            desc="Shows the first N series inline; beyond that, collapses into a “+N more” panel so 8–10+ series never clutter the chart header."
            tags={['New pattern']}
            demo={<div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              {['Total', 'Equity', 'Bond', 'Target'].map((l, i) => (
                <span key={l} style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 'var(--text-caption-size)', fontWeight: 600 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: ['var(--brand)', 'var(--green)', 'var(--amber)', 'var(--accent)'][i] }} /> {l}
                </span>
              ))}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: '1px dashed var(--line-strong)', borderRadius: 999, padding: '5px 10px', fontSize: 'var(--text-caption-size)', fontWeight: 700, color: 'var(--ink-soft)' }}>+6 more</span>
            </div>}
            code={`<ChartLegend items={series} onToggle={toggleSeries} maxInline={6} />`}
          />

          {/* ---------------- A11Y TOOLBAR ---------------- */}
          <Component
            id="a11y-toolbar" title="Accessibility toolbar"
            desc="Header-level menu (next to theme toggle) offering profiles, screen-reader read-aloud, voice navigation, and display adjustments — entirely on-device via the native Web Speech API, no network calls."
            tags={['WCAG 2.2 AA', 'main branch']}
            demo={<div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 'var(--text-caption-size)' }}><Eye size={15} /> Vision profile</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 'var(--text-caption-size)' }}><Volume2 size={15} /> Read aloud</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 'var(--text-caption-size)' }}><Mic size={15} /> Voice navigation</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 'var(--text-caption-size)' }}><TypeIcon size={15} /> Bigger text</div>
            </div>}
            dos={['Persist settings to localStorage only — never send accessibility preferences to a server.', 'Feature-detect SpeechRecognition and disable voice input gracefully in unsupported browsers (e.g. Firefox).']}
            donts={['Never let a voice command submit a form or move money — the command set is read/navigate/scroll only.']}
            code={`const { speaking, speakPage, stop } = useReadAloud()
const { listening, start, stop: stopListening } = useVoiceNav(navigate)
<AccessibilityMenu />  // dropdown next to the theme toggle in Header.jsx`}
            colors={[['Panel bg', '--panel'], ['Active row', '--active-bg'], ['Switch on', '--brand']]}
          />

          {/* ---------------- WCAG CHECKLIST ---------------- */}
          <section id="wcag" className="ds-section">
            <h2>WCAG 2.2 AA checklist</h2>
            <p className="ds-lede">The success criteria this system is built and audited against, mapped to where they're implemented.</p>
            <div className="ds-card">
              <table className="ds-table">
                <thead><tr><th>SC</th><th>Criterion</th><th>How it's met</th></tr></thead>
                <tbody>
                  {WCAG_CHECKS.map(([sc, name, how]) => (
                    <tr key={sc}><td><code>{sc}</code></td><td><b style={{ color: 'var(--ink)' }}>{name}</b></td><td>{how}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ---------------- KEYBOARD ---------------- */}
          <section id="keyboard" className="ds-section">
            <h2>Keyboard interaction</h2>
            <p className="ds-lede">Every interactive surface must be operable without a mouse. This table is the contract for QA sign-off.</p>
            <div className="ds-card">
              <table className="ds-table">
                <thead><tr><th>Key</th><th>Behavior</th><th>Applies to</th></tr></thead>
                <tbody>
                  {KEYBOARD_ROWS.map(([k, b, a]) => (
                    <tr key={k}><td><code>{k}</code></td><td>{b}</td><td>{a}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="ds-callout warn">
              <Keyboard size={16} />
              <span><b>Known root cause fixed —</b> focus rings using a positive outline-offset were clipped by scrolling ancestors (overflow-y:auto). Fixed system-wide by switching to an inset (negative) outline-offset, which can never be clipped.</span>
            </div>
          </section>

          {/* ---------------- SCREEN READER ---------------- */}
          <section id="sr" className="ds-section">
            <h2>Screen reader & NVDA</h2>
            <p className="ds-lede">Tested with NVDA (Windows/Chrome) and VoiceOver (macOS/Safari) against these baseline expectations.</p>
            <div className="ds-card">
              <div style={{ padding: '4px 20px' }}>
                {[
                  ['Landmarks', 'Header, nav, and main are marked with real <header>/<nav>/<main> elements so AT users can jump between regions.'],
                  ['Form errors', 'role="alert" on validation messages triggers an immediate NVDA announcement without moving focus.'],
                  ['Icon-only controls', 'Every icon-only button carries an aria-label (e.g. "Print", "Settings") — never relies on a visual tooltip alone.'],
                  ['Live totals', 'Running totals in allocation tables update visibly and are re-read on request, not force-announced on every keystroke.'],
                  ['Dialogs', 'Announced as a dialog with an accessible name, and focus moves to the dialog on open, back to the trigger on close.'],
                ].map(([t, d]) => (
                  <div key={t} className="ds-check">
                    <Check size={16} className="ok" />
                    <div><b>{t}</b><span>{d}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ---------------- CONTRAST ---------------- */}
          <section id="contrast" className="ds-section">
            <h2>Color contrast</h2>
            <p className="ds-lede">Minimum ratios enforced for both themes.</p>
            <table className="ds-table">
              <thead><tr><th>Pairing</th><th>Minimum ratio</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td>Body text on background</td><td>4.5:1</td><td className="ok">Pass</td></tr>
                <tr><td>Large heading text on background</td><td>3:1</td><td className="ok">Pass</td></tr>
                <tr><td>Input border / focus ring on background</td><td>3:1</td><td className="ok">Pass</td></tr>
                <tr><td>Disabled control text</td><td>Exempt — not required to meet 4.5:1</td><td>—</td></tr>
              </tbody>
            </table>
          </section>

          {/* ---------------- LAYOUT ---------------- */}
          <section id="layout" className="ds-section">
            <h2>Layout & breakpoints</h2>
            <p className="ds-lede">A frozen left nav (desktop) collapses at the breakpoints below; content reflows to a single column rather than horizontally scrolling.</p>
            <table className="ds-table">
              <thead><tr><th>Breakpoint</th><th>Behavior</th></tr></thead>
              <tbody>
                <tr><td><code>max-width: 1024px</code></td><td>Two-column layouts (e.g. overview stats + chart) stack to one column.</td></tr>
                <tr><td><code>max-width: 768px</code></td><td>Left nav collapses; page header wraps; table wrappers scroll horizontally within their own container only.</td></tr>
                <tr><td><code>max-width: 480px</code></td><td>Accessibility panel switches from anchored dropdown to a fixed, viewport-inset sheet.</td></tr>
                <tr><td><code>max-width: 420px</code></td><td>Balance summary grid stacks; stat blocks go full width.</td></tr>
                <tr><td><code>400% browser zoom</code></td><td>Verified with reflow-only (no horizontal scroll on the page body) per WCAG 1.4.10.</td></tr>
              </tbody>
            </table>
          </section>

          {/* ---------------- STATES ---------------- */}
          <section id="states" className="ds-section">
            <h2>Interaction states</h2>
            <p className="ds-lede">Every control defines these states explicitly — none are left to browser defaults alone.</p>
            <div className="ds-token-grid">
              {['Default', 'Hover', 'Focus-visible', 'Active/pressed', 'Disabled', 'Loading', 'Error', 'Empty'].map((s) => (
                <div key={s} className="ds-swatch" style={{ padding: 12, textAlign: 'center' }}>
                  <b style={{ fontSize: 'var(--text-caption-size)' }}>{s}</b>
                </div>
              ))}
            </div>
          </section>

          {/* ---------------- CONTENT ---------------- */}
          <section id="content" className="ds-section">
            <h2>Content & tone</h2>
            <p className="ds-lede">Plain, direct, and specific — this is a retirement account, not a marketing surface.</p>
            <div className="ds-card">
              <div className="ds-panel">
                <div className="ds-panel-row dos"><b>Do — </b>"Your rollover request was submitted and is pending review."</div>
                <div className="ds-panel-row donts"><b>Don't — </b>"Oops! Something went wrong somewhere."</div>
                <div className="ds-panel-row"><b>Errors — </b>state what happened and what to do next, never just "Invalid input."</div>
                <div className="ds-panel-row"><b>Numbers — </b>always show currency with $ and two decimals; percentages to one decimal.</div>
              </div>
            </div>
          </section>

          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 24, fontSize: 'var(--text-caption-size)', color: 'var(--muted)', maxWidth: 'var(--ds-content-max)' }}>
            <MousePointerClick size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Generated from the live application codebase. Available at <code>/design-system</code> on every brand build.
          </div>
        </main>
      </div>
    </div>
  )
}
