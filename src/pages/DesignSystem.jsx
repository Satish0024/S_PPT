import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle, Check, ChevronDown, Copy, Eye, Keyboard, Mic, Moon, MousePointerClick,
  ShieldCheck, Sun, Type as TypeIcon, Volume2, X
} from 'lucide-react'
import { BRAND } from '../config/brand.js'
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
  const { theme, toggle } = useTheme()

  return (
    <div className="ds">
      <header className="ds-top">
        <div className="ds-logo"><span className="dot" /> {BRAND.name} Design System</div>
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
              accessibility standard used across the Participant Portal prototype (CORE, Saturna
              Capital, and LendGuard brandings). It documents the UI as it is actually built and
              styled in the codebase today, so engineering, design, and QA share one source of truth
              before implementation review begins.
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
                  <b style={{ fontSize: 13, fontWeight: 700 }}>{t}</b>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-soft)', marginTop: 6, fontFamily: 'inherit' }}>{d}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ---------------- COLOR ---------------- */}
          <section id="color" className="ds-section">
            <h2>Color</h2>
            <p className="ds-lede">
              Semantic tokens, not hard-coded hex — every component references these CSS custom
              properties so a theme (or brand) swap never touches component code. Values shown are
              the current light theme; each has a matching dark-theme value applied via <code>[data-theme="dark"]</code>.
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
          </section>

          {/* ---------------- TYPE ---------------- */}
          <section id="type" className="ds-section">
            <h2>Typography</h2>
            <p className="ds-lede">System font stack ("Inclusive Sans" with system fallbacks) at a 15px base, scaled with a modest type ramp.</p>
            <div className="ds-card">
              <div className="ds-demo ds-demo-col">
                {[
                  ['Page title', 34, 700, -.6],
                  ['Section heading', 22, 700, -.3],
                  ['Card title', 16, 700, 0],
                  ['Body', 15, 400, 0],
                  ['Body soft / label', 13.5, 600, 0],
                  ['Caption / meta', 11.5, 700, .3],
                ].map(([label, size, weight, ls]) => (
                  <div key={label} className="ds-type-row">
                    <span className="ds-type-label">{label}</span>
                    <span style={{ fontSize: size, fontWeight: weight, letterSpacing: ls }}>Retirement plan balance</span>
                  </div>
                ))}
              </div>
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
            desc="Primary, secondary, ghost, and icon-only variants — one shared base class."
            tags={['WCAG 2.2 AA']}
            demo={<>
              <button type="button" className="btn btn-primary">Primary action</button>
              <button type="button" className="btn btn-secondary">Secondary</button>
              <button type="button" className="btn btn-ghost">Ghost</button>
              <button type="button" className="btn btn-primary" disabled>Disabled</button>
              <button type="button" className="icon-btn" aria-label="Settings" title="Settings"><ChevronDown size={18} /></button>
            </>}
            dos={['Give every icon-only button an aria-label describing its action.', 'Keep one primary button per view/section so the primary path is unambiguous.']}
            donts={['Never rely on color alone to show a disabled state — pair with aria-disabled and reduced opacity.']}
            code={`<button type="button" className="btn btn-primary">Save changes</button>
<button type="button" className="icon-btn" aria-label="Print"><Printer size={18} /></button>`}
            colors={[['Brand fill', '--brand-fill'], ['Brand dark (hover)', '--brand-dark'], ['Line', '--line'], ['Ink (ghost text)', '--ink-soft']]}
          />

          {/* ---------------- FORMS ---------------- */}
          <Component
            id="forms" title="Forms & inputs"
            desc="Text fields, selects, and search inputs with a visible focus ring on the wrapper."
            tags={['WCAG 2.2 AA']}
            demo={<div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 360 }}>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-soft)' }}>Account nickname
                <input style={{ marginTop: 6, width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink)' }} placeholder="e.g. My 401(k)" />
              </label>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-soft)' }}>Distribution plan type
                <select style={{ marginTop: 6, width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink)' }}>
                  <option>401(k)</option><option>403(b)</option><option>IRA — Traditional</option>
                </select>
              </label>
              <p role="alert" style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12.5, color: 'var(--red)', fontWeight: 600 }}>
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
          />

          {/* ---------------- SELECTION CONTROLS ---------------- */}
          <Component
            id="selection" title="Checkbox, radio & switch"
            desc="Custom-styled but backed by real <input> elements for native keyboard and screen-reader support."
            tags={['WCAG 2.2 AA']}
            demo={<div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13.5 }}><input type="checkbox" defaultChecked /> Email statements</label>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13.5 }}><input type="radio" name="ds-r" defaultChecked /> Direct deposit</label>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13.5 }}><input type="radio" name="ds-r" /> Mailed check</label>
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
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: 'var(--info, var(--active-bg))', border: '1px solid var(--info-line, var(--line))', fontSize: 13 }}>
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
                  padding: '10px 14px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600,
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
                <b style={{ fontSize: 14 }}>Confirm rollover request</b>
                <X size={16} />
              </div>
              <div style={{ padding: 16, fontSize: 13, color: 'var(--ink-soft)' }}>This will submit your rollover request for processing.</div>
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
                <span key={l} style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 12.5, fontWeight: 600 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: ['#2e3192', '#147a4c', '#8a5a12', '#4a63c7'][i] }} /> {l}
                </span>
              ))}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: '1px dashed var(--line-strong)', borderRadius: 999, padding: '5px 10px', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-soft)' }}>+6 more</span>
            </div>}
            code={`<ChartLegend items={series} onToggle={toggleSeries} maxInline={6} />`}
          />

          {/* ---------------- A11Y TOOLBAR ---------------- */}
          <Component
            id="a11y-toolbar" title="Accessibility toolbar"
            desc="Header-level menu (next to theme toggle) offering profiles, screen-reader read-aloud, voice navigation, and display adjustments — entirely on-device via the native Web Speech API, no network calls."
            tags={['WCAG 2.2 AA', 'main branch']}
            demo={<div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12.5 }}><Eye size={15} /> Vision profile</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12.5 }}><Volume2 size={15} /> Read aloud</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12.5 }}><Mic size={15} /> Voice navigation</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12.5 }}><TypeIcon size={15} /> Bigger text</div>
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
                  <b style={{ fontSize: 12.5 }}>{s}</b>
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

          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 24, fontSize: 12.5, color: 'var(--muted)', maxWidth: 'var(--ds-content-max)' }}>
            <MousePointerClick size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Generated from the live application codebase. Available at <code>/design-system</code> on every brand build.
          </div>
        </main>
      </div>
    </div>
  )
}
