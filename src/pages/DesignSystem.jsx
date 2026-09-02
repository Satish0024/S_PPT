import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  faArrowRight, faCheck, faChevronDown, faCopy, faDesktop, faGear, faLayerGroup, faMagnifyingGlass,
  faMoon, faPenRuler, faPrint, faPuzzlePiece, faRocket, faSun, faTriangleExclamation,
  faUniversalAccess, faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { Icon } from '../lib/icons.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import '../styles/design-system.css'

// Rebuilt from scratch (previous version had unverified claims — e.g.
// documented .btn-sm as a real "small" button size when it's actually dead,
// unrelated CSS with zero real usages). Every class/value referenced below
// was grepped against the real app source before being written down.

const NAV = [
  { group: 'Get started', items: [
    { id: 'overview', label: 'Overview' },
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
    { id: 'badges', label: 'Badges' },
    { id: 'table', label: 'Tables (zebra)' },
    { id: 'dialog', label: 'Dialogs & modals' },
    { id: 'header', label: 'Header' },
    { id: 'sidebar', label: 'Sidebar navigation' },
  ] },
  { group: 'Accessibility', items: [
    { id: 'wcag', label: 'WCAG 2.2 AA checklist' },
    { id: 'keyboard', label: 'Keyboard interaction' },
  ] },
]

const GROUP_META = {
  'Get started': { icon: faRocket, desc: 'What this system is and how to read it.' },
  'Foundations': { icon: faLayerGroup, desc: 'Color, typography, spacing, and elevation.' },
  'Components': { icon: faPuzzlePiece, desc: 'Every UI building block, as it actually renders.' },
  'Accessibility': { icon: faUniversalAccess, desc: 'WCAG 2.2 AA checklist and keyboard contract.' },
}

// Verified against styles/index.css :root / [data-theme="dark"].
const COLOR_GROUPS = [
  { title: 'Brand', tokens: [
    ['Brand', '--brand'], ['Brand dark (hover)', '--brand-dark'], ['Brand fill (solid surfaces)', '--brand-fill'],
    ['Accent', '--accent'], ['Link', '--link'],
  ] },
  { title: 'Neutrals', tokens: [
    ['Ink (primary text)', '--ink'], ['Ink soft (secondary text)', '--ink-soft'], ['Muted (tertiary text)', '--muted'],
    ['Line (border)', '--line'], ['Line strong', '--line-strong'], ['Background', '--bg'],
    ['Panel', '--panel'], ['Surface 2', '--surface-2'], ['Surface 3', '--surface-3'], ['Active bg', '--active-bg'],
  ] },
  { title: 'Status', tokens: [
    ['Green', '--green'], ['Green bg', '--green-bg'], ['Amber', '--amber'], ['Amber bg', '--amber-bg'],
    ['Red', '--red'], ['Red bg', '--red-bg'],
  ] },
]

const TYPE_SCALE = [
  { tag: 'H1', cls: 'ds-type-h1', size: '34px', weight: 800, use: 'Page title (one per page)' },
  { tag: 'H2', cls: 'ds-type-h2', size: '26px', weight: 800, use: 'Section heading' },
  { tag: 'H3', cls: 'ds-type-h3', size: '20px', weight: 700, use: 'Subsection / card group heading' },
  { tag: 'Body', cls: 'ds-type-p2', size: '15px', weight: 400, use: 'Body text (app default)' },
  { tag: 'Label', cls: 'ds-type-p3', size: '13.5px', weight: 600, use: 'Form labels, body-soft text' },
  { tag: 'Caption', cls: 'ds-type-caption', size: '11.5px', weight: 700, use: 'Meta text, table headers, timestamps' },
]

const WCAG_CHECKS = [
  ['1.4.3', 'Contrast (Minimum)', 'Text vs. background meets 4.5:1 in both themes.'],
  ['2.1.1', 'Keyboard', 'Every interactive control is reachable and operable via keyboard alone.'],
  ['2.4.7', 'Focus Visible', 'A visible focus indicator is drawn for every focusable element.'],
  ['3.3.1', 'Error Identification', 'Form errors use role="alert", described in text, not color alone.'],
  ['4.1.2', 'Name, Role, Value', 'Custom components expose an accessible name/role/state.'],
]

const KEYBOARD_ROWS = [
  ['Tab / Shift+Tab', 'Move focus to next / previous interactive element'],
  ['Enter / Space', 'Activate a button or link'],
  ['Escape', 'Close an open dialog or menu'],
]

function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text)
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

function CopyButton({ text, label = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className={`ds-copy-btn ${copied ? 'copied' : ''} ${className}`}
      onClick={async () => { await copyToClipboard(text); setCopied(true); setTimeout(() => setCopied(false), 1400) }}
      aria-label={copied ? `${label} copied` : label}
    >
      <Icon icon={copied ? faCheck : faCopy} size={12} />
      <span>{copied ? 'Copied!' : label}</span>
    </button>
  )
}

function Code({ children }) {
  return (
    <div className="ds-code-wrap">
      <CopyButton text={children} label="Copy code" className="ds-code-copy" />
      <pre className="ds-code">{children}</pre>
    </div>
  )
}

function useResolvedTokens(varNames) {
  const { theme } = useTheme()
  const [values, setValues] = useState({})
  const depKey = varNames.join(',')
  useEffect(() => {
    // Deferred with a macrotask, not requestAnimationFrame: ThemeProvider
    // (an ancestor) is what flips [data-theme] on <html>, and child effects
    // fire before ancestor effects in the same commit, so a synchronous or
    // rAF-deferred read here sees the outgoing theme's colors — rAF is also
    // paused entirely while this tab is backgrounded, e.g. in a preview pane.
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

// Component card: Anatomy (optional) / Preview / Usage (optional) / Tokens
// (optional) / Code (optional) tabs — only the tabs a component actually has
// data for render, matching the reference Figma style guide's own page
// structure rather than one long stacked card.
function Component({ id, title, desc, tags = [], demo, dos = [], donts = [], code, extra, colors = [], anatomy }) {
  const tokenValues = useResolvedTokens(colors.map(([, v]) => v))
  const tabs = [
    anatomy && 'Anatomy', 'Preview', (dos.length > 0 || donts.length > 0) && 'Usage',
    colors.length > 0 && 'Tokens', code && 'Code',
  ].filter(Boolean)
  const [view, setView] = useState(anatomy ? 'Anatomy' : 'Preview')
  return (
    <div id={id} className="ds-card">
      <div className="ds-card-head">
        <div><h3>{title}</h3><p>{desc}</p></div>
        <div className="ds-card-tags">{tags.map((t) => <span key={t} className="ds-tag">{t}</span>)}</div>
      </div>
      {tabs.length > 1 && (
        <div className="ds-view-tabs" role="tablist" aria-label={`${title} view`}>
          {tabs.map((t) => (
            <button key={t} type="button" role="tab" aria-selected={view === t} className={view === t ? 'on' : ''} onClick={() => setView(t)}>{t}</button>
          ))}
        </div>
      )}
      {view === 'Anatomy' && anatomy}
      {view === 'Preview' && (<><div className="ds-demo">{demo}</div>{extra}</>)}
      {view === 'Usage' && (
        <div className="ds-usage-grid">
          {dos.map((d, i) => (
            <div key={`do-${i}`} className="ds-usage-box do"><span className="ds-usage-badge"><Icon icon={faCheck} size={12} /></span><p>{d}</p></div>
          ))}
          {donts.map((d, i) => (
            <div key={`dont-${i}`} className="ds-usage-box dont"><span className="ds-usage-badge"><Icon icon={faXmark} size={12} /></span><p>{d}</p></div>
          ))}
        </div>
      )}
      {view === 'Tokens' && (
        <div className="ds-comp-colors">
          {colors.map(([name, varName]) => {
            const hex = tokenValues[varName]
            return (
              <button key={varName} type="button" className="ds-color-chip" onClick={() => hex && copyToClipboard(hex)} title="Copy color value">
                <span className="ds-color-chip-dot" style={{ background: `var(${varName})` }} />{name} <code>{hex}</code>
              </button>
            )
          })}
        </div>
      )}
      {view === 'Code' && code && <Code>{code}</Code>}
    </div>
  )
}

export default function DesignSystem() {
  const ids = NAV.flatMap((g) => g.items.map((i) => i.id))
  const active = useScrollSpy(ids)
  const { theme, toggle } = useTheme()
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)
  const q = query.trim().toLowerCase()
  const filteredNav = q
    ? NAV.map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(q)) })).filter((g) => g.items.length > 0)
    : NAV
  const [openGroups, setOpenGroups] = useState(() => new Set(['Get started']))
  const toggleGroup = (g) => setOpenGroups((prev) => { const next = new Set(prev); next.has(g) ? next.delete(g) : next.add(g); return next })
  const dualTokens = useDualThemeTokens(COLOR_GROUPS.flatMap((g) => g.tokens.map(([, v]) => v)))

  useEffect(() => {
    const activeGroup = NAV.find((g) => g.items.some((i) => i.id === active))?.group
    if (activeGroup) setOpenGroups((prev) => (prev.has(activeGroup) ? prev : new Set(prev).add(activeGroup)))
  }, [active])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement !== searchRef.current) { e.preventDefault(); searchRef.current?.focus() }
      if (e.key === 'Escape' && document.activeElement === searchRef.current) { setQuery(''); searchRef.current?.blur() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="ds">
      <header className="ds-top">
        <div className="ds-logo">
          <img src="/core-logo.svg" alt="CORE" className="ds-logo-mark" />
          <span className="ds-logo-div" />
          CORE Participant Portal Design System
        </div>
        <div className="ds-meta">
          <button type="button" className="ds-theme-toggle" onClick={toggle} aria-pressed={theme === 'dark'} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <Icon icon={theme === 'dark' ? faSun : faMoon} size={16} />
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <Link to="/" className="ds-back">← Back to app</Link>
        </div>
      </header>

      <div className="ds-shell">
        <nav className="ds-nav" aria-label="Design system sections">
          <div className="ds-nav-search">
            <Icon icon={faMagnifyingGlass} size={13} />
            <input ref={searchRef} type="search" placeholder="Search sections…" aria-label="Search design system sections" value={query} onChange={(e) => setQuery(e.target.value)} />
            {query ? <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><Icon icon={faXmark} size={12} /></button> : <kbd>/</kbd>}
          </div>
          {filteredNav.length === 0 && <p className="ds-nav-empty">No sections match "{query}".</p>}
          {filteredNav.map((g) => {
            const isOpen = q ? true : openGroups.has(g.group)
            const hasActive = g.items.some((i) => i.id === active)
            return (
              <div key={g.group} className="ds-nav-group">
                <button type="button" className={`ds-nav-group-head${hasActive ? ' has-active' : ''}`} aria-expanded={isOpen} onClick={() => toggleGroup(g.group)}>
                  <span>{g.group}</span>
                  <Icon icon={faChevronDown} size={11} className={`ds-nav-chevron${isOpen ? ' open' : ''}`} />
                </button>
                {isOpen && (
                  <div className="ds-nav-group-items">
                    {g.items.map((i) => <a key={i.id} href={`#${i.id}`} className={active === i.id ? 'active' : ''}>{i.label}</a>)}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <main className="ds-main">
          <div className="ds-hero">
            <div className="eyebrow">CORE Participant Portal · Design System v2.0</div>
            <h1>One system, three brands, zero rework.</h1>
            <p>
              Rebuilt from scratch. Every component fact on this page — every class name, every
              padding value, every claimed size — is verified directly against the real app source,
              not assumed from a plausible-looking pattern.
            </p>
          </div>

          <div className="ds-category-grid">
            {NAV.map((g) => {
              const meta = GROUP_META[g.group]
              return (
                <a key={g.group} href={`#${g.items[0]?.id}`} className="ds-category-card">
                  <span className="ds-category-ico"><Icon icon={meta.icon} size={18} /></span>
                  <span className="ds-category-body">
                    <b>{g.group}</b><span>{meta.desc}</span><em>{g.items.length} {g.items.length === 1 ? 'page' : 'pages'}</em>
                  </span>
                  <Icon icon={faArrowRight} size={13} className="ds-category-arrow" />
                </a>
              )
            })}
          </div>

          {/* ---------------- OVERVIEW ---------------- */}
          <section id="overview" className="ds-section">
            <h2>Overview</h2>
            <p className="ds-lede">
              The portal ships as one React codebase with three brand skins selected by build
              branch. Every component below is pulled from the real app CSS — verified via grep
              against the actual stylesheet, not written from memory of what the pattern
              "should" look like.
            </p>
          </section>

          {/* ---------------- COLOR ---------------- */}
          <section id="color" className="ds-section">
            <h2>Color</h2>
            <p className="ds-lede">Every value below is read live from the running app's CSS custom properties — both light and dark, regardless of which theme this page is currently in.</p>
            {COLOR_GROUPS.map((g) => (
              <div key={g.title}>
                <h3 className="ds-sub">{g.title}</h3>
                <div className="ds-card">
                  <table className="ds-type-table">
                    <thead><tr><th>Token</th><th>Variable</th><th>Light</th><th>Dark</th></tr></thead>
                    <tbody>
                      {g.tokens.map(([name, varName]) => {
                        const light = dualTokens.light[varName]
                        const dark = dualTokens.dark[varName]
                        return (
                          <tr key={varName}>
                            <td><b>{name}</b></td>
                            <td><code>{varName}</code></td>
                            <td><button type="button" className="ds-hex-cell" onClick={() => light && copyToClipboard(light)}><span className="ds-hex-dot" style={{ background: light }} />{light}</button></td>
                            <td><button type="button" className="ds-hex-cell" onClick={() => dark && copyToClipboard(dark)}><span className="ds-hex-dot" style={{ background: dark }} />{dark}</button></td>
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
            <p className="ds-lede">System font stack ("Inclusive Sans") at a 15px base.</p>
            <div className="ds-card">
              <table className="ds-type-table">
                <thead><tr><th>Style</th><th>Usage</th><th>Size</th><th>Weight</th></tr></thead>
                <tbody>
                  {TYPE_SCALE.map((t) => (
                    <tr key={t.tag}>
                      <td><span className={`ds-type-sample ${t.cls}`}>{t.tag}</span></td>
                      <td>{t.use}</td>
                      <td><code>{t.size}</code></td>
                      <td><code>{t.weight}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ---------------- SPACE ---------------- */}
          <section id="space" className="ds-section">
            <h2>Spacing & radius</h2>
            <p className="ds-lede">A 4px-based spacing scale keeps rhythm consistent.</p>
            <div className="ds-card">
              <div className="ds-demo ds-demo-col">
                {[4, 8, 12, 16, 20, 24, 32, 48].map((s) => (
                  <div key={s} className="ds-space-row"><span>{s}px</span><div className="ds-space-bar" style={{ width: s * 4 }} /></div>
                ))}
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
          {/* Verified: styles/index.css .btn (11px 16px padding, radius 10px,
              14px/700 font — line 1116), .btn-primary/.btn-secondary/.btn-ghost
              (enrollment.css only for ghost), .icon-btn (36x36, radius 50%).
              .btn-sm exists but is dead CSS (width:100%, pairs with .primary
              not .btn-primary, zero real usages) — deliberately not shown as
              a size variant. */}
          <Component
            id="buttons" title="Buttons"
            desc="The standard button used across Dashboard, Portfolio, Transactions, and Profile."
            anatomy={
              <div className="ds-anatomy">
                <div className="ds-spec-frame">
                  <div className="ds-spec-cell ds-spec-top"><span className="ds-spec-tick" /><b>Padding-top</b> 11px</div>
                  <div className="ds-spec-row">
                    <div className="ds-spec-cell ds-spec-left"><span className="ds-spec-tick" /><b>Padding-left</b> 16px</div>
                    <button type="button" className="btn btn-primary" tabIndex={-1}>Save changes</button>
                    <div className="ds-spec-cell ds-spec-right"><span className="ds-spec-tick" /><b>Padding-right</b> 16px</div>
                  </div>
                  <div className="ds-spec-cell ds-spec-bottom"><span className="ds-spec-tick" /><b>Padding-bottom</b> 11px</div>
                </div>
                <div className="ds-spec-facts">
                  <span><b>Corner radius</b> 10px</span><span><b>Font</b> 14px / 700</span><span><b>Icon size</b> 36×36px</span>
                </div>
                <p className="ds-anatomy-caption">a. Standard button (styles/index.css .btn.btn-primary)</p>
              </div>
            }
            demo={<div className="ds-demo-row" style={{ alignItems: 'center' }}>
              <button type="button" className="btn btn-primary">Primary</button>
              <button type="button" className="btn btn-secondary">Secondary</button>
              <button type="button" className="btn btn-ghost">Ghost</button>
              <button type="button" className="btn btn-primary" disabled>Disabled</button>
              <button type="button" className="icon-btn" aria-label="Settings"><Icon icon={faGear} size={18} /></button>
              <button type="button" className="icon-btn" aria-label="Print"><Icon icon={faPrint} size={18} /></button>
            </div>}
            dos={['Give every icon-only button an aria-label.', 'Keep one primary button per view.']}
            donts={["Don't combine .btn with .btn-sm — .btn-sm is dead CSS with zero real usages and its own padding loses the cascade to .btn."]}
            code={`<button type="button" className="btn btn-primary">Save changes</button>
<button type="button" className="btn btn-ghost">Ghost</button>
<button type="button" className="icon-btn" aria-label="Print"><Icon icon={faPrint} /></button>`}
            colors={[['Brand fill', '--brand-fill'], ['Brand dark (hover)', '--brand-dark'], ['Line', '--line']]}
          />

          {/* ---------------- FORMS ---------------- */}
          {/* Verified: transactions.css .txn-field input,select (min-height
              40px, border 1px solid var(--line), radius 9px, padding
              8px 12px, 14px/600 font — line 107). index.css .tx-plan-select
              for the custom-chevron dropdown (appearance:none, 36px right
              padding for the arrow — line 1315). */}
          <Component
            id="forms" title="Forms & inputs"
            desc="Text fields and selects, from styles/transactions.css and styles/index.css."
            demo={<div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 340 }}>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-soft)' }}>Account nickname
                <input
                  style={{ marginTop: 6, width: '100%', minHeight: 40, border: '1px solid var(--line)', borderRadius: 9, padding: '8px 12px', font: 'inherit', fontSize: 14, fontWeight: 600, color: 'var(--ink)', background: 'var(--panel)' }}
                  placeholder="e.g. My 401(k)"
                />
              </label>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-soft)' }}>Distribution plan type
                <select className="tx-plan-select" style={{ marginTop: 6, width: '100%' }}>
                  <option>401(k)</option><option>403(b)</option>
                </select>
              </label>
              <p role="alert" style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12.5, color: 'var(--red)', fontWeight: 600 }}>
                <Icon icon={faTriangleExclamation} size={14} /> Target percentages must add up to 100%.
              </p>
            </div>}
            dos={['Associate every input with a <label>.', 'Announce validation errors with role="alert".']}
            code={`<label>Account nickname
  <input placeholder="e.g. My 401(k)" />
</label>
<select className="tx-plan-select">...</select>
{error && <p role="alert">{error}</p>}`}
            colors={[['Border', '--line'], ['Focus ring', '--brand'], ['Error text', '--red']]}
          />

          {/* ---------------- SELECTION ---------------- */}
          {/* Verified: native <input type=checkbox/radio>. .a11y-switch from
              index.css line 266 (36x20px, real toggle used in the
              accessibility menu). */}
          <Component
            id="selection" title="Checkbox, radio & switch"
            desc="Native inputs for checkbox/radio; .a11y-switch (styles/index.css) for the toggle."
            demo={<div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13.5 }}><input type="checkbox" defaultChecked /> Email statements</label>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13.5 }}><input type="radio" name="ds-r" defaultChecked /> Direct deposit</label>
              <label className="a11y-switch" style={{ display: 'inline-flex' }}>
                <input type="checkbox" defaultChecked /><span className="a11y-switch-track"><span className="a11y-switch-thumb" /></span>
              </label>
            </div>}
            dos={['Use native <input> elements so keyboard and screen-reader support come for free.']}
            code={`<label className="a11y-switch">
  <input type="checkbox" checked={on} onChange={toggle} />
  <span className="a11y-switch-track"><span className="a11y-switch-thumb" /></span>
</label>`}
          />

          {/* ---------------- BADGES ---------------- */}
          {/* Verified: transactions.css .req-status (line 56) — the one
              genuinely reusable status pill in the app. .badge is NOT a
              standalone class (redefined 3x under different page scopes with
              different padding each time) — not documented as if it were. */}
          <Component
            id="badges" title="Badges"
            desc=".req-status (styles/transactions.css) — the one reusable, unscoped status pill in the app."
            demo={<div style={{ display: 'flex', gap: 10 }}>
              <span className="req-status good">Active</span>
              <span className="req-status ok">Pending</span>
              <span className="req-status warn">Action needed</span>
            </div>}
            dos={['Pair every status color with a text label — never color alone.']}
            donts={["Don't reach for a bare .badge class — it isn't a real standalone rule; it's redefined 3 separate times under different page scopes."]}
            code={`<span className="req-status good">Active</span>
<span className="req-status ok">Pending</span>
<span className="req-status warn">Action needed</span>`}
            colors={[['Success', '--green'], ['Warning', '--amber'], ['Danger', '--red']]}
          />

          {/* ---------------- TABLE ---------------- */}
          {/* Verified: index.css .table-wrap + .tx-table (line 1320),
              zebra via tbody tr:nth-child(even). */}
          <Component
            id="table" title="Tables (zebra)"
            desc=".table-wrap > table.tx-table (styles/index.css) — the Transactions page's own table."
            demo={<div className="table-wrap" style={{ width: '100%' }}>
              <table className="tx-table">
                <thead><tr><th>Type</th><th>Status</th><th className="num">Amount</th></tr></thead>
                <tbody>
                  <tr><td>Rollover</td><td><span className="req-status good">Approved</span></td><td className="num">$18,400.00</td></tr>
                  <tr><td>Rebalance</td><td><span className="req-status ok">Pending</span></td><td className="num">—</td></tr>
                </tbody>
              </table>
            </div>}
            code={`tbody tr:nth-child(even){ background: var(--surface-2); }`}
            colors={[['Zebra row', '--surface-2'], ['Row border', '--line']]}
          />

          {/* ---------------- DIALOG ---------------- */}
          {/* Verified: index.css .confirm-dialog (line 1527) — centered
              icon/heading/body/actions, the app's real confirm pattern. */}
          <Component
            id="dialog" title="Dialogs & modals"
            desc=".confirm-dialog (styles/index.css) — used for every destructive confirmation prompt."
            demo={<div className="confirm-dialog" style={{ margin: '0 auto' }}>
              <div className="confirm-dialog-ico"><Icon icon={faTriangleExclamation} size={20} /></div>
              <h4>Cancel this request?</h4>
              <p>This rollover request will be withdrawn.</p>
              <div className="confirm-dialog-actions">
                <button type="button" className="btn btn-secondary">Keep it</button>
                <button type="button" className="btn btn-primary">Cancel request</button>
              </div>
            </div>}
            dos={['Trap focus inside the dialog while open, return focus to the trigger on close.']}
            code={`<div className="confirm-dialog" role="dialog" aria-modal="true">
  <div className="confirm-dialog-ico"><Icon icon={faTriangleExclamation} /></div>
  <h4>Cancel this request?</h4>
  <div className="confirm-dialog-actions">...</div>
</div>`}
            colors={[['Panel bg', '--panel'], ['Border', '--line']]}
          />

          {/* ---------------- HEADER ---------------- */}
          {/* Verified against components/layout/Header.jsx + index.css
              lines 185-206: .topbar, .brand, .top-right, .icon-btn,
              .user-chip > .chip-text > .chip-name, .chev. */}
          <Component
            id="header" title="Header"
            desc="components/layout/Header.jsx — the real app-wide top bar."
            demo={<header className="topbar" style={{ width: '100%', borderRadius: 12, border: '1px solid var(--line)' }}>
              <div className="brand"><div style={{ height: 26, width: 100, borderRadius: 4, background: 'var(--surface-3)' }} /></div>
              <div className="top-right">
                <button type="button" className="icon-btn" aria-label="Switch theme"><Icon icon={faMoon} size={19} /></button>
                <div className="user-chip">
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--active-bg)' }} />
                  <span className="chip-text"><span className="chip-name">Jordan Lee</span></span>
                  <Icon icon={faChevronDown} size={14} className="chev" />
                </div>
              </div>
            </header>}
            code={`<header className="topbar">
  <div className="brand"><img src={BRAND.logo} alt={BRAND.name} /></div>
  <div className="top-right">
    <button className="icon-btn theme-toggle">...</button>
    <div className="user-chip">...</div>
  </div>
</header>`}
          />

          {/* ---------------- SIDEBAR ---------------- */}
          {/* Verified against components/layout/Sidebar.jsx + index.css
              .nav, .ico, .nav-label, .nav-bottom, .nav-cta (line 1421). */}
          <Component
            id="sidebar" title="Sidebar navigation"
            desc="components/layout/Sidebar.jsx — the real frozen left rail."
            demo={<nav className="nav" aria-label="Primary (sample)" style={{ width: 110, height: 260, border: '1px solid var(--line)', borderRadius: 12, position: 'static' }}>
              <a href="#sidebar" onClick={(e) => e.preventDefault()} className="active">
                <span className="ico" aria-hidden="true"><Icon icon={faGear} size={20} /></span>
                <span className="nav-label">Dashboard</span>
              </a>
              <a href="#sidebar" onClick={(e) => e.preventDefault()}>
                <span className="ico" aria-hidden="true"><Icon icon={faPrint} size={20} /></span>
                <span className="nav-label">Reports</span>
              </a>
            </nav>}
            code={`<nav className="nav" aria-label="Primary">
  <NavLink to="/" className={({isActive}) => isActive ? 'active' : ''}>
    <span className="ico"><Icon icon={faGear} /></span>
    <span className="nav-label">Dashboard</span>
  </NavLink>
</nav>`}
            colors={[['Active text', '--brand'], ['Active bg', '--active-bg']]}
          />

          {/* ---------------- WCAG ---------------- */}
          <section id="wcag" className="ds-section">
            <h2>WCAG 2.2 AA checklist</h2>
            <div className="ds-card">
              <table className="ds-type-table">
                <thead><tr><th>SC</th><th>Criterion</th><th>How it's met</th></tr></thead>
                <tbody>{WCAG_CHECKS.map(([sc, name, how]) => (<tr key={sc}><td><code>{sc}</code></td><td><b>{name}</b></td><td>{how}</td></tr>))}</tbody>
              </table>
            </div>
          </section>

          <section id="keyboard" className="ds-section">
            <h2>Keyboard interaction</h2>
            <div className="ds-card">
              <table className="ds-type-table">
                <thead><tr><th>Key</th><th>Behavior</th></tr></thead>
                <tbody>{KEYBOARD_ROWS.map(([k, b]) => (<tr key={k}><td><code>{k}</code></td><td>{b}</td></tr>))}</tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
