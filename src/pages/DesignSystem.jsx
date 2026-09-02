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
    { id: 'elevation', label: 'Shadows' },
  ] },
  { group: 'Examples', items: [
    { id: 'examples', label: 'Composed screen' },
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
  'Examples': { icon: faDesktop, desc: 'A full page built from real classes, fully annotated.' },
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
    ['Panel', '--panel'], ['Surface 2', '--surface-2'], ['Surface 3', '--surface-3'],
    ['Active bg', '--active-bg'], ['Hover bg', '--hover-bg'],
  ] },
  { title: 'Status — success', tokens: [
    ['Green', '--green'], ['Green bg', '--green-bg'], ['Green line (border)', '--green-line'],
  ] },
  { title: 'Status — warning', tokens: [
    ['Amber', '--amber'], ['Amber bg', '--amber-bg'], ['Amber line (border)', '--amber-line'],
  ] },
  { title: 'Status — danger', tokens: [
    ['Red', '--red'], ['Red bg', '--red-bg'], ['Red line (border)', '--red-line'],
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

// Composed-screen dots: small numbered markers only (no text on the
// screen itself — the earlier version put full text pins on top of
// real content and made both unreadable). Full descriptions live in
// the legend list below the screen instead.
const EXAMPLE_PINS = [
  { n: 1, pos: { top: 24, left: 100 }, label: '.topbar — sticky, --panel background' },
  { n: 2, pos: { top: 100, left: 46 }, label: '.nav a.active — --brand text, --active-bg fill' },
  { n: 3, pos: { top: 76, left: 120 }, label: 'H1 — 34px/800' },
  { n: 4, pos: { top: 76, right: 24 }, label: '.btn-primary — --brand-fill' },
  { n: 5, pos: { top: 160, left: 120 }, label: '--shadow — resting card elevation' },
  { n: 6, pos: { top: 216, left: 120 }, label: 'H2 — 26px/800' },
  { n: 7, pos: { top: 268, left: 380 }, label: '.req-status.good — --green / --green-bg' },
  { n: 8, pos: { top: 302, left: 380 }, label: '.req-status.warn — --red / --red-bg' },
  { n: 9, pos: { top: 285, left: 120 }, label: 'tbody even row — --surface-2 zebra stripe' },
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

// Pin callout — same pattern as the reference Figma file's Anatomy tab:
// a numbered badge sits directly above the real element it describes,
// connected to it by a short line, so the number visibly points at a
// specific pixel rather than floating in an unrelated list.
function Anno({ n, label, children, wrap }) {
  const Tag = wrap || 'span'
  return (
    <Tag className="ds-anno">
      <span className="ds-anno-callout">
        <span className="ds-anno-badge">{n}</span>
        <span className="ds-anno-text">{label}</span>
        <span className="ds-anno-line" />
      </span>
      {children}
    </Tag>
  )
}

// Groups a Preview tab's variants into "Live in the app" vs "Proposed"
// so a new, not-yet-built variant is never mistaken for a real class —
// the exact mistake .btn-sm caused earlier on this branch.
const VARIANT_TAG_LABEL = { live: 'Live in the app', proposed: 'Proposed', bug: 'Real bug' }
function VariantGroup({ tag = 'live', title, children }) {
  return (
    <div className="ds-variant-group">
      <div className="ds-variant-heading">
        <span className={`ds-variant-tag ${tag}`}>{VARIANT_TAG_LABEL[tag]}</span>
        <span>{title}</span>
      </div>
      <div className="ds-variant-row">{children}</div>
    </div>
  )
}

// Small numbered circle used inside a .ds-pin label, so a side-by-side
// pin (real element + pin text) still carries the same numbered-part
// identity as the floating callouts above horizontally-laid-out parts.
function Num({ children }) {
  return <span className="ds-pin-num">{children}</span>
}

// A tiny inline numbered marker that sits directly next to (never on
// top of) a real element inside a screen mockup — no absolute-position
// coordinate math, so it can never end up covering the content it's
// labeling. Pair with <DotLegend> below the mockup for the full text.
function Dot({ children }) {
  return <span className="ds-example-dot-inline">{children}</span>
}

function DotLegend({ items }) {
  return (
    <ol className="ds-example-legend">
      {items.map((label, i) => (
        <li key={i}><span className="ds-anno-badge" style={{ margin: 0 }}>{i + 1}</span>{label}</li>
      ))}
    </ol>
  )
}

// Wraps a set of Anno-pinned elements with the top padding they need to
// float their callouts above the content, plus the caption row below.
function AnatomyPins({ children, caption }) {
  return (
    <div className="ds-anatomy-pins">
      <div className="ds-anatomy-pins-row">{children}</div>
      {caption && <p className="ds-anatomy-caption" style={{ marginTop: 6 }}>{caption}</p>}
    </div>
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

            <h3 className="ds-sub">Applied in context</h3>
            <p className="ds-lede">The real Transactions screen — each numbered marker sits next to the real element it colors; the legend below spells out the token.</p>
            <div className="ds-example-screen" style={{ maxWidth: 560 }}>
              <div style={{ padding: '22px 24px' }}>
                <div className="table-wrap">
                  <table className="tx-table">
                    <thead><tr><th>Type</th><th>Status</th><th className="num">Amount</th></tr></thead>
                    <tbody>
                      <tr><td>Rollover</td><td><Dot>1</Dot><span className="req-status good">Approved</span></td><td className="num">$18,400.00</td></tr>
                      <tr><td><Dot>3</Dot>Rebalance</td><td><Dot>2</Dot><span className="req-status ok">Pending</span></td><td className="num">—</td></tr>
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Dot>4</Dot>
                  <button type="button" className="btn btn-primary" tabIndex={-1} style={{ width: 'auto', pointerEvents: 'none' }}>Primary action</button>
                </div>
              </div>
            </div>
            <DotLegend items={[
              '--green text / --green-bg fill',
              '--amber text / --amber-bg fill',
              '--surface-2 (zebra stripe on this row)',
              '--brand-fill (the one "interactive" color)',
            ]} />
          </section>

          {/* ---------------- TYPE ---------------- */}
          <section id="type" className="ds-section">
            <h2>Typography</h2>
            <p className="ds-lede">System font stack, verified from styles/index.css line 179.</p>

            <div className="ds-font-card">
              <b className="ds-font-name">Inclusive Sans</b>
              <div className="ds-font-sample">Ag</div>
              <p className="ds-font-about">
                Inclusive Sans is the only typeface used across the app — one family for every
                weight, no secondary/serif/mono display face. Loaded via Google Fonts
                (<code>@import</code>, styles/index.css line 1), variable weight 400–700, with a
                system <code>sans-serif</code> fallback stack for offline/blocked-font cases.
              </p>
              <div className="ds-font-weights">
                {[[400, 'Regular'], [500, 'Medium'], [600, 'SemiBold'], [700, 'Bold']].map(([w, name]) => (
                  <span key={w} style={{ fontWeight: w }}>{name} <em>{w}</em></span>
                ))}
              </div>
            </div>

            <h3 className="ds-sub">Type scale</h3>
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

            <h3 className="ds-sub">Applied in context</h3>
            <p className="ds-lede">Where each level actually lands on a real screen — numbered markers sit next to the real text, the legend spells each one out.</p>
            <div className="ds-example-screen" style={{ maxWidth: 560 }}>
              <div style={{ padding: '22px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                  <Dot>1</Dot>
                  <h4 className="ds-type-h1" style={{ margin: 0, fontSize: 26 }}>Retirement plan balance</h4>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                  <Dot>2</Dot>
                  <h5 className="ds-type-h2" style={{ margin: 0, fontSize: 18 }}>Recent requests</h5>
                </div>
                <div className="table-wrap">
                  <table className="tx-table">
                    <thead><tr><th>Type</th><th>Status</th><th className="num">Amount</th></tr></thead>
                    <tbody><tr><td className="ds-type-p2"><Dot>3</Dot>Rollover</td><td><span className="req-status good">Approved</span></td><td className="num ds-type-p2">$18,400.00</td></tr></tbody>
                  </table>
                </div>
                <div style={{ marginTop: 12 }}>
                  <Dot>4</Dot>
                  <span className="ds-type-p3" style={{ color: 'var(--ink-soft)' }}>Distribution plan type</span>
                </div>
              </div>
            </div>
            <DotLegend items={[
              'H1 · Page title · 34px/800',
              'H2 · Section heading · 26px/800',
              'Body · table cell text · 15px/400',
              'Label · secondary/meta text · 13.5px/600',
            ]} />
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
            <h2>Shadows</h2>
            <p className="ds-lede">Two shadow tokens, verified from styles/index.css lines 29–30 (light) / 75–76 (dark) — no third "overlay" tier exists in the app.</p>
            <div className="ds-card">
              <table className="ds-type-table">
                <thead><tr><th>Token</th><th>Value (light)</th><th>Value (dark)</th><th>Used for</th></tr></thead>
                <tbody>
                  <tr>
                    <td><code>--shadow</code></td>
                    <td><code style={{ fontSize: 11 }}>0 1px 2px rgba(20,30,60,.06)</code></td>
                    <td><code style={{ fontSize: 11 }}>0 1px 2px rgba(0,0,0,.4)</code></td>
                    <td>Resting elevation — cards, panels</td>
                  </tr>
                  <tr>
                    <td><code>--shadow-lg</code></td>
                    <td><code style={{ fontSize: 11 }}>0 8px 30px rgba(20,30,60,.10)</code></td>
                    <td><code style={{ fontSize: 11 }}>0 8px 30px rgba(0,0,0,.55)</code></td>
                    <td>Raised elevation — dropdowns, dialogs, the user menu</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="ds-demo">
              <div style={{ padding: '18px 24px', borderRadius: 14, background: 'var(--panel)', boxShadow: 'var(--shadow)', border: '1px solid var(--line)' }}>--shadow (cards)</div>
              <div style={{ padding: '18px 24px', borderRadius: 14, background: 'var(--panel)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--line)' }}>--shadow-lg (dropdowns, dialogs)</div>
            </div>

            <h3 className="ds-sub">Applied in context</h3>
            <p className="ds-lede">Both shown together the way they actually stack: a resting card holding a raised dropdown — each labeled with the exact token producing it.</p>
            <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
              <div style={{ position: 'relative', maxWidth: 320 }}>
                <div style={{ padding: 20, borderRadius: 14, background: 'var(--panel)', boxShadow: 'var(--shadow)', border: '1px solid var(--line)' }}>
                  <b style={{ fontSize: 13.5 }}>Account balance</b>
                  <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '4px 0 0' }}>Card resting on --shadow</p>
                </div>
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 40, marginTop: 8, padding: 12, borderRadius: 12, background: 'var(--panel)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-lg)' }}>
                  <b style={{ fontSize: 12.5 }}>Dropdown raised on --shadow-lg</b>
                </div>
              </div>
            </div>
            <div className="ds-usage-grid" style={{ padding: '20px 0 0' }}>
              <div className="ds-usage-box do"><span className="ds-usage-badge"><Icon icon={faCheck} size={12} /></span><p>Use --shadow for anything resting in the normal document flow (cards, panels).</p></div>
              <div className="ds-usage-box dont"><span className="ds-usage-badge"><Icon icon={faXmark} size={12} /></span><p>Don't invent a third, custom shadow value — only these two exist; a one-off box-shadow breaks the elevation system's meaning.</p></div>
            </div>
          </section>

          {/* ---------------- EXAMPLES (composed screen) ---------------- */}
          {/* One real page assembled from the exact same classes documented
              below (.topbar, .nav, .tx-table, .req-status, .btn-primary,
              type scale classes) so color, typography, and component
              choices can be seen together the way the reference Figma
              file's Usage tabs show them, not just in isolation. */}
          <section id="examples" className="ds-section">
            <h2>Composed screen</h2>
            <p className="ds-lede">
              A Transactions-style page assembled entirely from the classes documented on this
              page — nothing here is a one-off mockup style. Pins call out which foundation or
              component produced each piece.
            </p>
            <div className="ds-example-screen">
              <header className="topbar" style={{ borderRadius: '12px 12px 0 0' }}>
                <div className="brand"><div style={{ height: 24, width: 92, borderRadius: 4, background: 'var(--surface-3)' }} /></div>
                <div className="top-right">
                  <button type="button" className="icon-btn" aria-label="Switch theme" tabIndex={-1}><Icon icon={faMoon} size={18} /></button>
                  <div className="user-chip">
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--active-bg)' }} />
                    <span className="chip-text"><span className="chip-name">Jordan Lee</span></span>
                    <Icon icon={faChevronDown} size={13} className="chev" />
                  </div>
                </div>
              </header>
              <div className="ds-example-body">
                <nav className="nav" aria-label="Primary (example)" style={{ position: 'static', width: 92, flex: '0 0 92px', borderRight: '1px solid var(--line)' }}>
                  <a href="#examples" onClick={(e) => e.preventDefault()} className="active">
                    <span className="ico" aria-hidden="true"><Icon icon={faGear} size={19} /></span>
                    <span className="nav-label">Dashboard</span>
                  </a>
                  <a href="#examples" onClick={(e) => e.preventDefault()}>
                    <span className="ico" aria-hidden="true"><Icon icon={faPrint} size={19} /></span>
                    <span className="nav-label">Reports</span>
                  </a>
                </nav>
                <div className="ds-example-main">
                  <div className="ds-example-row">
                    <h1 className="ds-type-h1" style={{ fontSize: 24, margin: 0 }}>Retirement plan balance</h1>
                    <button type="button" className="btn btn-primary" tabIndex={-1}>New request</button>
                  </div>
                  <div style={{ padding: '16px 20px', borderRadius: 14, background: 'var(--panel)', border: '1px solid var(--line)', boxShadow: 'var(--shadow)', marginBottom: 18 }}>
                    <span className="ds-type-p3" style={{ color: 'var(--ink-soft)' }}>Total balance</span>
                    <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>$284,900.00</div>
                  </div>
                  <h2 className="ds-type-h2" style={{ fontSize: 16, margin: '0 0 10px' }}>Recent requests</h2>
                  <div className="table-wrap">
                    <table className="tx-table">
                      <thead><tr><th>Type</th><th>Status</th><th className="num">Amount</th></tr></thead>
                      <tbody>
                        <tr><td>Rollover</td><td><span className="req-status good">Approved</span></td><td className="num">$18,400.00</td></tr>
                        <tr><td>Rebalance</td><td><span className="req-status ok">Pending</span></td><td className="num">—</td></tr>
                        <tr><td>Distribution</td><td><span className="req-status warn">Action needed</span></td><td className="num">$2,000.00</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Small numbered dots only — never full text on top of real
                  content, which is what made this unreadable before. Each
                  dot's description lives in the legend list below instead. */}
              {EXAMPLE_PINS.map((p) => (
                <span key={p.n} className="ds-example-dot" style={p.pos} title={p.label}>{p.n}</span>
              ))}
            </div>
            <ol className="ds-example-legend">
              {EXAMPLE_PINS.map((p) => (
                <li key={p.n}><span className="ds-anno-badge" style={{ margin: 0 }}>{p.n}</span>{p.label}</li>
              ))}
            </ol>
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
                <AnatomyPins>
                  <Anno n={1} label="Label — 14px/700">
                    <button type="button" className="btn btn-primary" tabIndex={-1}>Save changes</button>
                  </Anno>
                  <Anno n={2} label="Icon-only · .icon-btn, 36×36px">
                    <button type="button" className="icon-btn" tabIndex={-1} aria-label="Settings"><Icon icon={faGear} size={18} /></button>
                  </Anno>
                </AnatomyPins>
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
            demo={<>
              <VariantGroup tag="bug" title="How .btn-primary actually renders on most real pages today">
                <div style={{ flex: '0 0 300px', width: 300 }}>
                  <button type="button" className="btn btn-primary" style={{ width: '100%' }}>Submit request</button>
                  <p style={{ fontSize: 11.5, color: 'var(--ink-soft)', margin: '8px 0 0' }}>enrollment.css's global .btn{'{'}width:100%{'}'} — see Usage tab.</p>
                </div>
              </VariantGroup>
              <VariantGroup tag="live" title="styles/index.css + enrollment.css — every button class actually in the app">
                <button type="button" className="btn btn-primary">Primary</button>
                <button type="button" className="btn btn-secondary">Secondary</button>
                <button type="button" className="btn btn-ghost">Ghost</button>
                <button type="button" className="btn btn-primary" disabled>Disabled</button>
                <button type="button" className="btn-tertiary" style={{ width: 'auto' }}>Tertiary (enrollment.css)</button>
                <button type="button" className="icon-btn" aria-label="Settings"><Icon icon={faGear} size={18} /></button>
                <button type="button" className="icon-btn" aria-label="Print"><Icon icon={faPrint} size={18} /></button>
              </VariantGroup>
              <VariantGroup tag="proposed" title="Not built yet — inline styles only, for when these are needed">
                <button type="button" className="btn btn-primary" style={{ background: 'var(--red)', borderColor: 'var(--red)' }}>Destructive</button>
                <button type="button" className="btn btn-primary" style={{ padding: '7px 12px', fontSize: 12.5 }}>Small</button>
                <button type="button" className="btn btn-primary" style={{ padding: '15px 22px', fontSize: 15.5 }}>Large</button>
                <button type="button" className="btn btn-primary" disabled style={{ display: 'inline-flex', gap: 8, alignItems: 'center', opacity: .75 }}>
                  <span style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', display: 'inline-block' }} />
                  Loading…
                </button>
              </VariantGroup>
            </>}
            dos={['Give every icon-only button an aria-label.', 'Keep one primary button per view.']}
            donts={[
              "Don't combine .btn with .btn-sm — .btn-sm is dead CSS with zero real usages and its own padding loses the cascade to .btn.",
              "Don't assume a page-scoped stylesheet (enrollment.css, transactions.css, etc.) only applies on that page — Vite bundles every statically-imported CSS file into one global stylesheet. enrollment.css's own .btn{width:100%} is live everywhere, all the time, including here, and wins over index.css's .btn on whichever loaded later.",
              "Don't treat the \"Proposed\" row as existing CSS — Destructive/Small/Large/Loading are inline-styled mockups for a variant that hasn't been built. Add a real .btn-danger / .btn-sm-v2 / .btn-lg / .btn-loading class before using one in a page.",
            ]}
            code={`<button type="button" className="btn btn-primary">Save changes</button>
<button type="button" className="btn btn-ghost">Ghost</button>
<button type="button" className="icon-btn" aria-label="Print"><Icon icon={faPrint} /></button>`}
            colors={[['Brand fill', '--brand-fill'], ['Brand dark (hover)', '--brand-dark'], ['Line', '--line']]}
            extra={
              <div className="ds-panel-row donts" style={{ borderTop: '1px solid var(--line)', padding: '14px 20px', fontSize: 13, lineHeight: 1.6 }}>
                <b>Real bug found while building this page — </b> these standard buttons render full-width
                by default. Root cause: <code>enrollment.css</code> (imported by <code>PlanDetails.jsx</code> and
                <code> EnrollmentLayout.jsx</code>) defines its own <code>.btn{'{'}width:100%{'}'}</code>. Because
                every page component is statically imported from <code>App.jsx</code>, Vite bundles that CSS
                globally — it is not actually scoped to enrollment pages, despite living in a file named for
                them. The demo above works around it with a scoped override; the app itself does not.
              </div>
            }
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
            anatomy={
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div className="ds-annotated-frame" style={{ maxWidth: 380, margin: '0 auto 20px' }}>
                  <div className="ds-annotated-row">
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-soft)' }}>Account nickname</label>
                    <span className="ds-pin"><Num>1</Num>Label · 12.5px/700</span>
                  </div>
                  <div className="ds-annotated-row">
                    <input readOnly value="e.g. My 401(k)" style={{ minHeight: 40, border: '1px solid var(--line)', borderRadius: 9, padding: '8px 12px', font: 'inherit', fontSize: 14, fontWeight: 600, background: 'var(--panel)', width: 180 }} />
                    <span className="ds-pin"><Num>2</Num>Field · 40px min-height</span>
                  </div>
                  <div className="ds-annotated-row">
                    <p role="alert" style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12.5, color: 'var(--red)', fontWeight: 600, margin: 0 }}>
                      <Icon icon={faTriangleExclamation} size={14} /> Required
                    </p>
                    <span className="ds-pin"><Num>3</Num>Error text · --red, role="alert"</span>
                  </div>
                </div>
                <div className="ds-spec-frame">
                  <div className="ds-spec-cell ds-spec-top"><span className="ds-spec-tick" /><b>Padding-top</b> 8px</div>
                  <div className="ds-spec-row">
                    <div className="ds-spec-cell ds-spec-left"><span className="ds-spec-tick" /><b>Padding-left</b> 12px</div>
                    <input readOnly value="e.g. My 401(k)" style={{ minHeight: 40, border: '1px solid var(--line)', borderRadius: 9, padding: '8px 12px', font: 'inherit', fontSize: 14, fontWeight: 600, color: 'var(--ink)', background: 'var(--panel)', width: 200 }} />
                    <div className="ds-spec-cell ds-spec-right"><span className="ds-spec-tick" /><b>Padding-right</b> 12px</div>
                  </div>
                  <div className="ds-spec-cell ds-spec-bottom"><span className="ds-spec-tick" /><b>Padding-bottom</b> 8px</div>
                </div>
                <div className="ds-spec-facts">
                  <span><b>Min-height</b> 40px</span><span><b>Corner radius</b> 9px</span><span><b>Border</b> 1px solid --line</span><span><b>Font</b> 14px / 600</span>
                </div>
                <p className="ds-anatomy-caption">a. Text input (styles/transactions.css .txn-field input, line 107)</p>
              </div>
            }
            demo={<>
              <VariantGroup tag="live" title="transactions.css .txn-field — every real input state">
                <div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 340 }}>
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
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-soft)' }}>Locked field (disabled)
                    <input
                      disabled value="Direct deposit"
                      style={{ marginTop: 6, width: '100%', minHeight: 40, border: '1px solid var(--line)', borderRadius: 9, padding: '8px 12px', font: 'inherit', fontSize: 14, fontWeight: 600, background: 'var(--surface-2)', color: 'var(--ink-soft)' }}
                    />
                  </label>
                  <p role="alert" style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12.5, color: 'var(--red)', fontWeight: 600 }}>
                    <Icon icon={faTriangleExclamation} size={14} /> Target percentages must add up to 100%.
                  </p>
                </div>
              </VariantGroup>
              <VariantGroup tag="proposed" title="Not built yet — for a future search/filter field">
                <div style={{ position: 'relative', width: '100%', maxWidth: 260 }}>
                  <Icon icon={faMagnifyingGlass} size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  <input
                    placeholder="Search investments…"
                    style={{ width: '100%', minHeight: 40, border: '1px solid var(--line)', borderRadius: 9, padding: '8px 12px 8px 34px', font: 'inherit', fontSize: 14, fontWeight: 600, background: 'var(--panel)' }}
                  />
                </div>
              </VariantGroup>
            </>}
            dos={['Associate every input with a <label>.', 'Announce validation errors with role="alert".']}
            donts={["Don't trust the focus-ring color to always equal --brand — transactions.css line 111 hard-codes rgba(46,49,146,.12) (the old CORE purple) instead of using the token, so on this LendGuard-themed branch the focus ring is subtly the wrong hue. Real, pre-existing bug, not a design choice."]}
            code={`<label>Account nickname
  <input placeholder="e.g. My 401(k)" />
</label>
<select className="tx-plan-select">...</select>
{error && <p role="alert">{error}</p>}`}
            colors={[['Border', '--line'], ['Focus ring', '--brand'], ['Error text', '--red']]}
            extra={
              <div className="ds-panel-row" style={{ borderTop: '1px solid var(--line)', padding: '18px 20px 4px' }}>
                <h3 className="ds-sub" style={{ marginTop: 0 }}>Applied in context</h3>
                <p className="ds-lede" style={{ marginTop: 0 }}>The Transactions page's rebalance form — the real .txn-field layout this component is pulled from.</p>
                <div className="ds-annotated-frame">
                  <div className="ds-annotated-row">
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-soft)', flex: '1 1 200px' }}>Target amount
                      <input readOnly value="$5,000.00" style={{ marginTop: 6, width: '100%', minHeight: 40, border: '1px solid var(--line)', borderRadius: 9, padding: '8px 12px', font: 'inherit', fontSize: 14, fontWeight: 600, background: 'var(--panel)' }} />
                    </label>
                    <span className="ds-pin">.txn-field input</span>
                  </div>
                  <div className="ds-annotated-row">
                    <p role="alert" style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12.5, color: 'var(--red)', fontWeight: 600, margin: 0 }}>
                      <Icon icon={faTriangleExclamation} size={14} /> Target percentages must add up to 100%.
                    </p>
                    <span className="ds-pin">role="alert" · --red</span>
                  </div>
                </div>
              </div>
            }
          />

          {/* ---------------- SELECTION ---------------- */}
          {/* Verified: native <input type=checkbox/radio>. .a11y-switch from
              index.css line 266 (36x20px, real toggle used in the
              accessibility menu). */}
          <Component
            id="selection" title="Checkbox, radio & switch"
            desc="Native inputs for checkbox/radio; .a11y-switch (styles/index.css) for the toggle."
            anatomy={
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div className="ds-annotated-frame" style={{ maxWidth: 380, margin: '0 auto 20px' }}>
                  <div className="ds-annotated-row">
                    <span style={{ fontSize: 13.5 }}>High contrast mode</span>
                    <span className="ds-pin"><Num>1</Num>Label · adjacent text (switch has no accessible name alone)</span>
                  </div>
                  <div className="ds-annotated-row">
                    <label className="a11y-switch" style={{ display: 'inline-flex' }}><input type="checkbox" readOnly /><span className="a11y-switch-track"><span className="a11y-switch-thumb" /></span></label>
                    <span className="ds-pin"><Num>2</Num>Track · 36×20px pill</span>
                  </div>
                  <div className="ds-annotated-row">
                    <label className="a11y-switch" style={{ display: 'inline-flex' }}><input type="checkbox" defaultChecked readOnly /><span className="a11y-switch-track"><span className="a11y-switch-thumb" /></span></label>
                    <span className="ds-pin"><Num>3</Num>Thumb · 16×16px, slides +16px on check</span>
                  </div>
                </div>
                <div className="ds-spec-frame">
                  <div className="ds-spec-cell ds-spec-top"><span className="ds-spec-tick" /><b>Track height</b> 20px</div>
                  <div className="ds-spec-row">
                    <div className="ds-spec-cell ds-spec-left"><span className="ds-spec-tick" /><b>Track width</b> 36px</div>
                    <label className="a11y-switch" style={{ display: 'inline-flex' }}>
                      <input type="checkbox" defaultChecked readOnly /><span className="a11y-switch-track"><span className="a11y-switch-thumb" /></span>
                    </label>
                    <div className="ds-spec-cell ds-spec-right"><span className="ds-spec-tick" /><b>Thumb</b> 16×16px</div>
                  </div>
                  <div className="ds-spec-cell ds-spec-bottom"><span className="ds-spec-tick" /><b>Thumb inset</b> 2px</div>
                </div>
                <div className="ds-spec-facts">
                  <span><b>Track radius</b> 999px</span><span><b>Checked</b> --brand track, thumb slides +16px</span><span><b>Focus ring</b> 2px solid --brand, offset 2px</span>
                </div>
                <p className="ds-anatomy-caption">a. Toggle switch (styles/index.css .a11y-switch, line 266)</p>
              </div>
            }
            demo={<>
              <VariantGroup tag="live" title="Checkbox &amp; radio — native inputs, every state used in the app">
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13.5 }}><input type="checkbox" defaultChecked /> Email statements</label>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13.5 }}><input type="checkbox" /> Unchecked</label>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13.5, opacity: .5 }}><input type="checkbox" disabled /> Paper statements (disabled)</label>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13.5 }}><input type="radio" name="ds-r" defaultChecked /> Direct deposit</label>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13.5 }}><input type="radio" name="ds-r" /> Mailed check</label>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13.5, opacity: .5 }}><input type="radio" name="ds-r" disabled /> Wire (disabled)</label>
              </VariantGroup>
              <VariantGroup tag="live" title=".a11y-switch — on / off / disabled">
                <label className="a11y-switch" style={{ display: 'inline-flex' }}>
                  <input type="checkbox" defaultChecked /><span className="a11y-switch-track"><span className="a11y-switch-thumb" /></span>
                </label>
                <label className="a11y-switch" style={{ display: 'inline-flex' }}>
                  <input type="checkbox" /><span className="a11y-switch-track"><span className="a11y-switch-thumb" /></span>
                </label>
                <label className="a11y-switch" style={{ display: 'inline-flex', opacity: .5 }}>
                  <input type="checkbox" disabled /><span className="a11y-switch-track"><span className="a11y-switch-thumb" /></span>
                </label>
              </VariantGroup>
            </>}
            dos={['Use native <input> elements so keyboard and screen-reader support come for free.']}
            code={`<label className="a11y-switch">
  <input type="checkbox" checked={on} onChange={toggle} />
  <span className="a11y-switch-track"><span className="a11y-switch-thumb" /></span>
</label>`}
            extra={
              <div className="ds-panel-row" style={{ borderTop: '1px solid var(--line)', padding: '18px 20px 4px' }}>
                <h3 className="ds-sub" style={{ marginTop: 0 }}>Applied in context</h3>
                <p className="ds-lede" style={{ marginTop: 0 }}>The accessibility menu's own switch row — where .a11y-switch actually ships today.</p>
                <div className="ds-annotated-frame">
                  <div className="ds-annotated-row">
                    <span style={{ fontSize: 13.5 }}>High contrast mode</span>
                    <label className="a11y-switch" style={{ display: 'inline-flex' }}>
                      <input type="checkbox" defaultChecked /><span className="a11y-switch-track"><span className="a11y-switch-thumb" /></span>
                    </label>
                    <span className="ds-pin">36×20px · .a11y-switch</span>
                  </div>
                </div>
              </div>
            }
          />

          {/* ---------------- BADGES ---------------- */}
          {/* Verified: transactions.css .req-status (line 56) — the one
              genuinely reusable status pill in the app. .badge is NOT a
              standalone class (redefined 3x under different page scopes with
              different padding each time) — not documented as if it were. */}
          <Component
            id="badges" title="Badges"
            desc=".req-status (styles/transactions.css) — the one reusable, unscoped status pill in the app."
            anatomy={
              <div className="ds-anatomy">
                <AnatomyPins>
                  <Anno n={1} label="Label · 11.5px/800">
                    <span className="req-status good" style={{ position: 'relative' }}>Approved</span>
                  </Anno>
                  <Anno n={2} label="Fill · --green/--green-bg">
                    <span className="req-status good">Approved</span>
                  </Anno>
                </AnatomyPins>
                <div className="ds-spec-frame">
                  <div className="ds-spec-cell ds-spec-top"><span className="ds-spec-tick" /><b>Padding-top</b> 3px</div>
                  <div className="ds-spec-row">
                    <div className="ds-spec-cell ds-spec-left"><span className="ds-spec-tick" /><b>Padding-left</b> 10px</div>
                    <span className="req-status good">Approved</span>
                    <div className="ds-spec-cell ds-spec-right"><span className="ds-spec-tick" /><b>Padding-right</b> 10px</div>
                  </div>
                  <div className="ds-spec-cell ds-spec-bottom"><span className="ds-spec-tick" /><b>Padding-bottom</b> 3px</div>
                </div>
                <div className="ds-spec-facts">
                  <span><b>Corner radius</b> 999px (pill)</span><span><b>Font</b> 11.5px / 800</span>
                </div>
                <p className="ds-anatomy-caption">a. Status pill (styles/transactions.css .req-status, line 56)</p>
              </div>
            }
            demo={<>
              <VariantGroup tag="live" title="transactions.css .req-status — all 3 real states">
                <span className="req-status good">Active</span>
                <span className="req-status ok">Pending</span>
                <span className="req-status warn">Action needed</span>
              </VariantGroup>
              <VariantGroup tag="proposed" title="Not built yet — a 4th, neutral state for e.g. Draft">
                <span className="req-status" style={{ background: 'var(--surface-3)', color: 'var(--ink-soft)' }}>Draft</span>
              </VariantGroup>
            </>}
            dos={['Pair every status color with a text label — never color alone.']}
            donts={["Don't reach for a bare .badge class — it isn't a real standalone rule; it's redefined 3 separate times under different page scopes."]}
            code={`<span className="req-status good">Active</span>
<span className="req-status ok">Pending</span>
<span className="req-status warn">Action needed</span>`}
            colors={[['Success', '--green'], ['Warning', '--amber'], ['Danger', '--red']]}
            extra={
              <div className="ds-panel-row" style={{ borderTop: '1px solid var(--line)', padding: '18px 20px 4px' }}>
                <h3 className="ds-sub" style={{ marginTop: 0 }}>Applied in context</h3>
                <p className="ds-lede" style={{ marginTop: 0 }}>Inside the Transactions table's Status column — its real placement.</p>
                <div className="ds-annotated-frame">
                  <div className="table-wrap">
                    <table className="tx-table">
                      <thead><tr><th>Type</th><th>Status</th></tr></thead>
                      <tbody><tr><td>Rollover</td><td><span className="req-status good">Approved</span></td></tr></tbody>
                    </table>
                  </div>
                  <div className="ds-annotated-row">
                    <span className="req-status good">Approved</span>
                    <span className="ds-pin">Table cell · right-aligned</span>
                  </div>
                </div>
              </div>
            }
          />

          {/* ---------------- TABLE ---------------- */}
          {/* Verified: index.css .table-wrap + .tx-table (line 1320),
              zebra via tbody tr:nth-child(even). */}
          <Component
            id="table" title="Tables (zebra)"
            desc=".table-wrap > table.tx-table (styles/index.css) — the Transactions page's own table."
            anatomy={
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div className="table-wrap" style={{ width: '100%', maxWidth: 420, margin: '0 auto 16px' }}>
                  <table className="tx-table">
                    <thead><tr><th>Type</th><th className="num">Amount</th></tr></thead>
                    <tbody>
                      <tr><td>Rollover</td><td className="num">$18,400.00</td></tr>
                      <tr><td>Rebalance</td><td className="num">$2,000.00</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="ds-annotated-frame" style={{ maxWidth: 420, margin: '0 auto 20px' }}>
                  <div className="ds-annotated-row">
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)' }}>Type / Amount</span>
                    <span className="ds-pin"><Num>1</Num>Header row · 12px/700, --surface-2 bg</span>
                  </div>
                  <div className="ds-annotated-row">
                    <span style={{ fontSize: 13.5 }}>Rollover</span>
                    <span className="ds-pin"><Num>2</Num>Body row · 13.5px/400, 1px --line border</span>
                  </div>
                  <div className="ds-annotated-row">
                    <span style={{ background: 'var(--surface-2)', padding: '4px 10px', borderRadius: 6, fontSize: 12.5 }}>Rebalance (row 2)</span>
                    <span className="ds-pin"><Num>3</Num>Zebra stripe · even rows → --surface-2</span>
                  </div>
                </div>
                <div className="ds-spec-facts">
                  <span><b>Cell padding</b> 12px 14px</span><span><b>Header</b> 12px / 700, --ink-soft, --surface-2 bg</span><span><b>Row border</b> 1px solid --line (bottom)</span><span><b>Zebra</b> even rows → --surface-2</span>
                </div>
                <p className="ds-anatomy-caption">a. Data table (styles/index.css .tx-table)</p>
              </div>
            }
            demo={<>
              <VariantGroup tag="live" title="index.css .tx-table — populated, zebra-striped">
                <div className="table-wrap" style={{ width: '100%' }}>
                  <table className="tx-table">
                    <thead><tr><th>Type</th><th>Status</th><th className="num">Amount</th></tr></thead>
                    <tbody>
                      <tr><td>Rollover</td><td><span className="req-status good">Approved</span></td><td className="num">$18,400.00</td></tr>
                      <tr><td>Rebalance</td><td><span className="req-status ok">Pending</span></td><td className="num">—</td></tr>
                    </tbody>
                  </table>
                </div>
              </VariantGroup>
              <VariantGroup tag="proposed" title="Not built yet — loading and empty states">
                <div className="table-wrap" style={{ width: '100%', maxWidth: 300 }}>
                  <table className="tx-table">
                    <thead><tr><th>Type</th><th className="num">Amount</th></tr></thead>
                    <tbody>
                      <tr><td><span style={{ display: 'inline-block', width: 70, height: 12, borderRadius: 4, background: 'var(--surface-3)' }} /></td><td className="num"><span style={{ display: 'inline-block', width: 50, height: 12, borderRadius: 4, background: 'var(--surface-3)' }} /></td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="table-wrap" style={{ width: '100%', maxWidth: 300 }}>
                  <table className="tx-table">
                    <thead><tr><th>Type</th><th className="num">Amount</th></tr></thead>
                    <tbody><tr><td colSpan={2} style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px 12px' }}>No requests yet</td></tr></tbody>
                  </table>
                </div>
              </VariantGroup>
            </>}
            code={`tbody tr:nth-child(even){ background: var(--surface-2); }`}
            colors={[['Zebra row', '--surface-2'], ['Row border', '--line']]}
            extra={
              <div className="ds-panel-row" style={{ borderTop: '1px solid var(--line)', padding: '18px 20px 4px' }}>
                <h3 className="ds-sub" style={{ marginTop: 0 }}>Applied in context</h3>
                <p className="ds-lede" style={{ marginTop: 0 }}>The full Transactions history list — three rows so the zebra stripe is visible.</p>
                <div className="ds-annotated-frame">
                  <div className="table-wrap">
                    <table className="tx-table">
                      <thead><tr><th>Type</th><th>Status</th><th className="num">Amount</th></tr></thead>
                      <tbody>
                        <tr><td>Rollover</td><td><span className="req-status good">Approved</span></td><td className="num">$18,400.00</td></tr>
                        <tr><td>Rebalance</td><td><span className="req-status ok">Pending</span></td><td className="num">—</td></tr>
                        <tr><td>Distribution</td><td><span className="req-status warn">Action needed</span></td><td className="num">$2,000.00</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="ds-annotated-row">
                    <span style={{ background: 'var(--surface-2)', padding: '4px 10px', borderRadius: 6, fontSize: 12.5 }}>Row 2</span>
                    <span className="ds-pin">tbody tr:nth-child(even) → --surface-2</span>
                  </div>
                </div>
              </div>
            }
          />

          {/* ---------------- DIALOG ---------------- */}
          {/* Verified: index.css .confirm-dialog (line 1527) — centered
              icon/heading/body/actions, the app's real confirm pattern. */}
          <Component
            id="dialog" title="Dialogs & modals"
            desc=".confirm-dialog (styles/index.css) — used for every destructive confirmation prompt."
            demo={<>
              <VariantGroup tag="live" title="index.css .confirm-dialog — destructive confirmation">
                <div className="confirm-dialog" style={{ margin: '0 auto' }}>
                  <div className="confirm-dialog-ico"><Icon icon={faTriangleExclamation} size={20} /></div>
                  <h4>Cancel this request?</h4>
                  <p>This rollover request will be withdrawn.</p>
                  <div className="confirm-dialog-actions">
                    <button type="button" className="btn btn-secondary">Keep it</button>
                    <button type="button" className="btn btn-primary">Cancel request</button>
                  </div>
                </div>
              </VariantGroup>
              <VariantGroup tag="live" title="index.css .txn-success-modal — real success confirmation">
                <div className="txn-success-modal" style={{ margin: '0 auto' }}>
                  <div className="confirm-dialog-ico" style={{ background: 'var(--green-bg)', color: 'var(--green)', margin: '0 auto 12px' }}><Icon icon={faCheck} size={20} /></div>
                  <h3>Request submitted</h3>
                  <p className="hint" style={{ color: 'var(--ink-soft)', fontSize: 13.5 }}>You'll get a confirmation email shortly.</p>
                  <button type="button" className="btn btn-primary" style={{ width: 'auto', marginTop: 12 }}>Done</button>
                </div>
              </VariantGroup>
            </>}
            anatomy={
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
                  <div className="confirm-dialog" style={{ margin: 0 }}>
                    <div className="confirm-dialog-ico"><Icon icon={faTriangleExclamation} size={20} /></div>
                    <h4>Cancel this request?</h4>
                    <p>This rollover request will be withdrawn.</p>
                    <div className="confirm-dialog-actions">
                      <button type="button" className="btn btn-secondary" tabIndex={-1}>Keep it</button>
                      <button type="button" className="btn btn-primary" tabIndex={-1}>Cancel request</button>
                    </div>
                  </div>
                  <div className="ds-annotated-frame" style={{ maxWidth: 260, gap: 10 }}>
                    <span className="ds-pin"><Num>1</Num>Icon badge · 44×44px, --red-bg</span>
                    <span className="ds-pin"><Num>2</Num>Title · 17px/800 question</span>
                    <span className="ds-pin"><Num>3</Num>Body · 13.5px/400, --ink-soft</span>
                    <span className="ds-pin"><Num>4</Num>Actions · equal-width, safe left / destructive right</span>
                  </div>
                </div>
                <div className="ds-spec-facts">
                  <span><b>Width</b> min(360px, 100%)</span><span><b>Padding</b> 26px 24px 22px</span><span><b>Corner radius</b> 16px</span><span><b>Icon badge</b> 44×44px, --red-bg</span><span><b>Elevation</b> --shadow-lg</span>
                </div>
                <p className="ds-anatomy-caption">a. Confirm dialog (styles/index.css .confirm-dialog, line 1527)</p>
              </div>
            }
            dos={['Trap focus inside the dialog while open, return focus to the trigger on close.']}
            code={`<div className="confirm-dialog" role="dialog" aria-modal="true">
  <div className="confirm-dialog-ico"><Icon icon={faTriangleExclamation} /></div>
  <h4>Cancel this request?</h4>
  <div className="confirm-dialog-actions">...</div>
</div>`}
            colors={[['Panel bg', '--panel'], ['Border', '--line']]}
            extra={
              <div className="ds-panel-row" style={{ borderTop: '1px solid var(--line)', padding: '18px 20px 4px' }}>
                <h3 className="ds-sub" style={{ marginTop: 0 }}>Applied in context</h3>
                <p className="ds-lede" style={{ marginTop: 0 }}>Sitting centered over a dimmed backdrop, the way every destructive confirmation on the Transactions page actually shows it.</p>
                <div className="ds-annotated-frame" style={{ position: 'relative', minHeight: 200, background: 'var(--surface-3)', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,14,30,.45)' }} />
                  <div className="confirm-dialog" style={{ margin: '20px auto', position: 'relative', zIndex: 1 }}>
                    <div className="confirm-dialog-ico"><Icon icon={faTriangleExclamation} size={20} /></div>
                    <h4>Cancel this request?</h4>
                    <div className="confirm-dialog-actions">
                      <button type="button" className="btn btn-secondary" tabIndex={-1}>Keep it</button>
                      <button type="button" className="btn btn-primary" tabIndex={-1}>Cancel request</button>
                    </div>
                  </div>
                </div>
              </div>
            }
          />

          {/* ---------------- HEADER ---------------- */}
          {/* Verified against components/layout/Header.jsx + index.css
              lines 185-206: .topbar, .brand, .top-right, .icon-btn,
              .user-chip > .chip-text > .chip-name, .chev. */}
          <Component
            id="header" title="Header"
            desc="components/layout/Header.jsx — the real app-wide top bar."
            demo={<>
              <VariantGroup tag="live" title="components/layout/Header.jsx — light-mode toggle state">
                <header className="topbar" style={{ width: '100%', borderRadius: 12, border: '1px solid var(--line)' }}>
                  <div className="brand"><div style={{ height: 26, width: 100, borderRadius: 4, background: 'var(--surface-3)' }} /></div>
                  <div className="top-right">
                    <button type="button" className="icon-btn" aria-label="Switch theme"><Icon icon={faMoon} size={19} /></button>
                    <div className="user-chip">
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--active-bg)' }} />
                      <span className="chip-text"><span className="chip-name">Jordan Lee</span></span>
                      <Icon icon={faChevronDown} size={14} className="chev" />
                    </div>
                  </div>
                </header>
              </VariantGroup>
              <VariantGroup tag="live" title="Same .topbar — dark-mode toggle state (icon flips sun/moon)">
                <header className="topbar" style={{ width: '100%', borderRadius: 12, border: '1px solid var(--line)' }}>
                  <div className="brand"><div style={{ height: 26, width: 100, borderRadius: 4, background: 'var(--surface-3)' }} /></div>
                  <div className="top-right">
                    <button type="button" className="icon-btn" aria-label="Switch theme"><Icon icon={faSun} size={19} /></button>
                    <div className="user-chip">
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--active-bg)' }} />
                      <span className="chip-text"><span className="chip-name">Jordan Lee</span></span>
                      <Icon icon={faChevronDown} size={14} className="chev" />
                    </div>
                  </div>
                </header>
              </VariantGroup>
            </>}
            anatomy={
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div className="ds-anatomy-pins" style={{ paddingTop: 56, marginBottom: 16 }}>
                  <div className="ds-anatomy-pins-row" style={{ justifyContent: 'space-between', maxWidth: 420, margin: '0 auto' }}>
                    <Anno n={1} label="Brand · 26px logo">
                      <div style={{ height: 26, width: 80, borderRadius: 4, background: 'var(--surface-3)' }} />
                    </Anno>
                    <Anno n={2} label="Icon button · 36×36px">
                      <button type="button" className="icon-btn" tabIndex={-1} aria-label="Switch theme"><Icon icon={faMoon} size={18} /></button>
                    </Anno>
                    <Anno n={3} label="User chip · avatar + name + chevron">
                      <div className="user-chip">
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--active-bg)' }} />
                        <span className="chip-text"><span className="chip-name">Jordan Lee</span></span>
                        <Icon icon={faChevronDown} size={13} className="chev" />
                      </div>
                    </Anno>
                  </div>
                </div>
                <div className="ds-spec-frame" style={{ padding: 0 }}>
                  <div className="ds-spec-cell ds-spec-top"><span className="ds-spec-tick" /><b>Height</b> var(--header-h)</div>
                  <div className="ds-spec-row">
                    <div className="ds-spec-cell ds-spec-left"><span className="ds-spec-tick" /><b>Padding-left</b> 10px</div>
                    <header className="topbar" style={{ width: 320, borderRadius: 0 }}>
                      <div className="brand"><div style={{ height: 26, width: 80, borderRadius: 4, background: 'var(--surface-3)' }} /></div>
                      <div className="top-right"><div className="user-chip"><div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--active-bg)' }} /></div></div>
                    </header>
                    <div className="ds-spec-cell ds-spec-right"><span className="ds-spec-tick" /><b>Padding-right</b> 24px</div>
                  </div>
                </div>
                <div className="ds-spec-facts">
                  <span><b>Position</b> sticky, top: 0</span><span><b>Border</b> 1px solid --line (bottom)</span><span><b>z-index</b> 40</span>
                </div>
                <p className="ds-anatomy-caption">a. App top bar (styles/index.css .topbar, line 185; components/layout/Header.jsx)</p>
              </div>
            }
            code={`<header className="topbar">
  <div className="brand"><img src={BRAND.logo} alt={BRAND.name} /></div>
  <div className="top-right">
    <button className="icon-btn theme-toggle">...</button>
    <div className="user-chip">...</div>
  </div>
</header>`}
            extra={
              <div className="ds-panel-row" style={{ borderTop: '1px solid var(--line)', padding: '18px 20px 4px' }}>
                <h3 className="ds-sub" style={{ marginTop: 0 }}>Applied in context</h3>
                <p className="ds-lede" style={{ marginTop: 0 }}>Sticky at the top of every authenticated route — sits above the routed page content.</p>
                <div className="ds-annotated-frame">
                  <header className="topbar" style={{ width: '100%', borderRadius: 12, border: '1px solid var(--line)' }}>
                    <div className="brand"><div style={{ height: 26, width: 100, borderRadius: 4, background: 'var(--surface-3)' }} /></div>
                    <div className="top-right">
                      <button type="button" className="icon-btn" aria-label="Switch theme" tabIndex={-1}><Icon icon={faMoon} size={19} /></button>
                      <div className="user-chip">
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--active-bg)' }} />
                        <span className="chip-text"><span className="chip-name">Jordan Lee</span></span>
                        <Icon icon={faChevronDown} size={14} className="chev" />
                      </div>
                    </div>
                  </header>
                  <div style={{ height: 60, borderRadius: 10, background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--muted)' }}>Routed page content scrolls under this bar</div>
                  <div className="ds-annotated-row">
                    <span className="user-chip" style={{ display: 'inline-flex' }}><span className="chip-text"><span className="chip-name">Jordan Lee</span></span><Icon icon={faChevronDown} size={14} className="chev" /></span>
                    <span className="ds-pin">.user-chip · opens profile menu</span>
                  </div>
                </div>
              </div>
            }
          />

          {/* ---------------- SIDEBAR ---------------- */}
          {/* Verified against components/layout/Sidebar.jsx + index.css
              .nav, .ico, .nav-label, .nav-bottom, .nav-cta (line 1421). */}
          <Component
            id="sidebar" title="Sidebar navigation"
            desc="components/layout/Sidebar.jsx — the real frozen left rail."
            anatomy={
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div style={{ display: 'flex', gap: 28, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
                  <a href="#sidebar" onClick={(e) => e.preventDefault()} className="active" style={{ width: 120 }}>
                    <span className="ico" aria-hidden="true"><Icon icon={faGear} size={23} /></span>
                    <span className="nav-label">Dashboard</span>
                  </a>
                  <div className="ds-annotated-frame" style={{ maxWidth: 260, gap: 10 }}>
                    <span className="ds-pin"><Num>1</Num>Icon · 23×23px, centered</span>
                    <span className="ds-pin"><Num>2</Num>Label · 13px/600</span>
                    <span className="ds-pin"><Num>3</Num>Active bar · 4px --brand, leading edge</span>
                  </div>
                </div>
                <div className="ds-spec-frame" style={{ padding: 0 }}>
                  <div className="ds-spec-cell ds-spec-top"><span className="ds-spec-tick" /><b>Item padding-top</b> 15px</div>
                  <div className="ds-spec-row">
                    <div className="ds-spec-cell ds-spec-left"><span className="ds-spec-tick" /><b>Rail width</b> 120px</div>
                    <a href="#sidebar" onClick={(e) => e.preventDefault()} className="active" style={{ width: 120 }}>
                      <span className="ico" aria-hidden="true"><Icon icon={faGear} size={23} /></span>
                      <span className="nav-label">Dashboard</span>
                    </a>
                    <div className="ds-spec-cell ds-spec-right"><span className="ds-spec-tick" /><b>Item padding-x</b> 8px</div>
                  </div>
                  <div className="ds-spec-cell ds-spec-bottom"><span className="ds-spec-tick" /><b>Item padding-bottom</b> 15px</div>
                </div>
                <div className="ds-spec-facts">
                  <span><b>Icon</b> 23×23px</span><span><b>Label</b> 13px / 600</span><span><b>Active</b> --brand text, --active-bg fill, 4px --brand left bar</span>
                </div>
                <p className="ds-anatomy-caption">a. Nav item (styles/index.css .nav a / .nav a.active, line 311)</p>
              </div>
            }
            demo={<>
              <VariantGroup tag="live" title="index.css .nav — active / inactive / disabled items">
                <nav className="nav" aria-label="Primary (sample)" style={{ width: 110, height: 260, border: '1px solid var(--line)', borderRadius: 12, position: 'static' }}>
                  <a href="#sidebar" onClick={(e) => e.preventDefault()} className="active">
                    <span className="ico" aria-hidden="true"><Icon icon={faGear} size={20} /></span>
                    <span className="nav-label">Dashboard</span>
                  </a>
                  <a href="#sidebar" onClick={(e) => e.preventDefault()}>
                    <span className="ico" aria-hidden="true"><Icon icon={faPrint} size={20} /></span>
                    <span className="nav-label">Reports</span>
                  </a>
                  <a href="#sidebar" onClick={(e) => e.preventDefault()} style={{ opacity: .5 }}>
                    <span className="ico" aria-hidden="true"><Icon icon={faMagnifyingGlass} size={20} /></span>
                    <span className="nav-label">Search (disabled)</span>
                  </a>
                </nav>
              </VariantGroup>
              <VariantGroup tag="live" title="index.css .nav-cta (line 1421) — the rail's bottom circular CTA">
                <div className="nav-bottom" style={{ position: 'static', alignItems: 'center' }}>
                  <a href="#sidebar" onClick={(e) => e.preventDefault()} className="nav-cta" aria-label="Get help" style={{ position: 'static' }}>
                    <Icon icon={faUniversalAccess} size={18} />
                  </a>
                </div>
              </VariantGroup>
            </>}
            code={`<nav className="nav" aria-label="Primary">
  <NavLink to="/" className={({isActive}) => isActive ? 'active' : ''}>
    <span className="ico"><Icon icon={faGear} /></span>
    <span className="nav-label">Dashboard</span>
  </NavLink>
</nav>`}
            colors={[['Active text', '--brand'], ['Active bg', '--active-bg']]}
            extra={
              <div className="ds-panel-row" style={{ borderTop: '1px solid var(--line)', padding: '18px 20px 4px' }}>
                <h3 className="ds-sub" style={{ marginTop: 0 }}>Applied in context</h3>
                <p className="ds-lede" style={{ marginTop: 0 }}>The frozen left rail alongside a routed page — active item marked with --active-bg + --brand text.</p>
                <div className="ds-annotated-frame">
                  <div style={{ display: 'flex', gap: 14 }}>
                    <nav className="nav" aria-label="Primary (sample)" style={{ width: 100, height: 200, border: '1px solid var(--line)', borderRadius: 12, position: 'static', flex: '0 0 auto' }}>
                      <a href="#sidebar" onClick={(e) => e.preventDefault()} className="active">
                        <span className="ico" aria-hidden="true"><Icon icon={faGear} size={18} /></span>
                        <span className="nav-label">Dashboard</span>
                      </a>
                      <a href="#sidebar" onClick={(e) => e.preventDefault()}>
                        <span className="ico" aria-hidden="true"><Icon icon={faPrint} size={18} /></span>
                        <span className="nav-label">Reports</span>
                      </a>
                    </nav>
                    <div style={{ flex: 1, borderRadius: 10, background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--muted)' }}>Routed page content</div>
                  </div>
                  <div className="ds-annotated-row">
                    <a href="#sidebar" onClick={(e) => e.preventDefault()} className="active" style={{ display: 'inline-flex', width: 'auto' }}><span className="ico" aria-hidden="true"><Icon icon={faGear} size={16} /></span><span className="nav-label">Dashboard</span></a>
                    <span className="ds-pin">.active → --brand text / --active-bg</span>
                  </div>
                </div>
              </div>
            }
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
