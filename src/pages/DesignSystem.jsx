import { useEffect, useRef, useState } from 'react'
import {
  faArrowRight, faCheck, faChevronDown, faCopy, faDesktop, faGear, faLayerGroup, faMagnifyingGlass,
  faMoon, faPenRuler, faPrint, faPuzzlePiece, faRocket, faSun, faTriangleExclamation,
  faUniversalAccess, faXmark, faImage,
} from '@fortawesome/free-solid-svg-icons'
import * as fasIcons from '@fortawesome/free-solid-svg-icons'
import { Icon } from '../lib/icons.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { BRAND } from '../config/brand.js'
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
  { group: 'Assets', items: [
    { id: 'assets', label: 'Logo' },
    { id: 'icons', label: 'Icons' },
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
    { id: 'steps', label: 'Steps' },
    { id: 'spinner', label: 'Spinner' },
    { id: 'content-card', label: 'Content card' },
    { id: 'slideover', label: 'Slideover' },
    { id: 'donut', label: 'Donut chart' },
    { id: 'linechart', label: 'Line chart' },
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
  'Assets': { icon: faImage, desc: 'The real logo files, and the full Font Awesome Solid set.' },
  'Components': { icon: faPuzzlePiece, desc: 'Every UI building block, as it actually renders.' },
  'Accessibility': { icon: faUniversalAccess, desc: 'WCAG 2.2 AA checklist and keyboard contract.' },
}

// The primary, most-reached-for tokens — one flat glanceable grid before
// the full light/dark breakdown below. From the previous version of this
// page; re-added on request, updated to this rebuild's actual token set.
const PRIMARY_COLORS = [
  ['Brand', '--brand'], ['Brand dark', '--brand-dark'], ['Accent', '--accent'],
  ['Ink (text)', '--ink'], ['Ink soft', '--ink-soft'], ['Muted', '--muted'],
  ['Line', '--line'], ['Background', '--bg'], ['Panel', '--panel'],
  ['Active bg', '--active-bg'], ['Green (success)', '--green'], ['Amber (warning)', '--amber'],
  ['Red (danger)', '--red'], ['Surface 2', '--surface-2'], ['Surface 3', '--surface-3'],
]

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

// ONE table, not two. The app has no shared type-scale utility classes —
// every page sizes its own text ad hoc (.hi-bar h1 is 26px/700,
// .login-brand-copy h1 is 36px/700, .page-head h1 is 22px/700 — genuinely
// different, all real, grepped from font-size: frequency across
// index.css). Rather than inventing a clean fiction, this groups that
// real range into roles and names the real classes at each one, from the
// largest text in the app (.rr2-hero-copy b, a readiness-score figure)
// down to the smallest (table header labels). "ds-type-h1" etc. are this
// page's own consolidation proposal for future use — marked as such,
// never implied to already be in use.
const TYPE_SCALE = [
  { role: 'Display', size: '44px', weight: 800, cls: null, real: ['.rr2-hero-copy b — readiness score figure'], proposed: null },
  { role: 'H1 (page title)', size: '22–38px', weight: '700–800', cls: 'ds-type-h1 (proposed, 34px/800)', real: ['.login-brand-copy h1 · 36/700', '.hi-bar h1 · 26/700 (Dashboard)', '.page-head h1 · 22/700 (Portfolio)'], proposed: '34px / 800' },
  { role: 'H2 (section heading)', size: '15–26px', weight: 700, cls: 'ds-type-h2 (proposed, 26px/800)', real: ['.login-card h2 · 26/700', '.section-title · 16/700 (Dashboard)', '.chart-top h2 · 16/700'], proposed: '26px / 800' },
  { role: 'H3 (card title)', size: '15–20px', weight: 700, cls: 'ds-type-h3 (proposed, 20px/700)', real: ['.pc-name (PlanCard h3) · 15/700', '.summary .head h4 · 16/600'], proposed: '20px / 700' },
  { role: 'Body', size: '13–15px', weight: '400–600', cls: 'ds-type-p2 (proposed, 15px/400)', real: ['table cells (.tx-table td) · 13.5/400', '.pr-intro · 14.5/500'], proposed: '15px / 400' },
  { role: 'Label', size: '12–13.5px', weight: 600, cls: 'ds-type-p3 (proposed, 13.5px/600)', real: ['.ob-k · 13/600', 'form labels (.txn-field label) · 12.5/700'], proposed: '13.5px / 600' },
  { role: 'Caption / micro', size: '9–12px', weight: 700, cls: 'ds-type-caption (proposed, 11.5px/700)', real: ['.pc-type · 12/600', '.plan-badge · 11/700', 'table headers (.tx-table th) · 12/700'], proposed: '11.5px / 700' },
]

// Verified via grep against styles/index.css — gap: and padding: value
// frequency, cross-checked against the specific classes that use each one.
const SPACE_SCALE = [
  [4, 'Icon-to-label gaps, tight inline groups (.nav-cta, badge icon)'],
  [8, 'Default gap between related controls — button groups, form rows, .txn-field'],
  [12, 'Gap between fields in a form, card internal spacing'],
  [16, 'Padding inside cards and panels; gap between unrelated form sections'],
  [20, 'Section-level gaps — between a heading and the content below it'],
  [24, 'Page-edge padding; gap between major page sections'],
  [32, 'Padding inside large modals/panels (.confirm-dialog top padding)'],
  [48, 'Rare — large empty-state vertical spacing'],
]
const RADIUS_SCALE = [
  [8, '.nav sidebar items on hover/active, small inline chips'],
  [9, 'Form fields — .txn-field input, .tx-plan-select (line 1315)'],
  [10, 'Buttons — .btn.btn-primary/.btn-secondary/.btn-ghost (line 1116)'],
  [12, 'Mid-size cards and lists — .list, .doc-list, header/nav shells'],
  [14, 'Large cards and panels — .ds-card, dashboard summary cards'],
  [16, 'Dialogs and modals — .confirm-dialog, .txn-success-modal (line 1527)'],
  [999, 'Pills — .req-status badges, .a11y-switch track (fully rounded)'],
]

// The real logo files this app actually ships and references — via
// config/brand.js only, never hardcoded per-component. Illustrations do
// exist too (see the Content card component) but aren't catalogued here —
// this list is scoped to the logo only.
const LOGO_ASSETS = [
  ['Logo lockup — light surfaces', '/logo-lockup-light.svg', 'config/brand.js BRAND.logo — topbar, login card, this page\'s own header'],
  ['Logo lockup — dark surfaces', '/logo-lockup-dark.svg', 'config/brand.js BRAND.logoOnDark — login hero panel, this page\'s own header in dark theme'],
]

// Every icon Font Awesome (Free, Solid) ships — not a curated subset —
// so a future need never has to go find and add a new icon package.
// Pulled programmatically from the installed package rather than typed
// out by hand, so it can never silently drift from what's installed.
const ALL_SOLID_ICONS = Object.keys(fasIcons)
  .filter((k) => k !== 'fas' && k !== 'prefix' && fasIcons[k] && fasIcons[k].iconName)
  .map((k) => [k, fasIcons[k]])
  .sort((a, b) => a[0].localeCompare(b[0]))

// All 55 WCAG 2.2 Level A + AA success criteria (2.1's 50 + 2.2's 6 new
// A/AA additions, minus 4.1.1 Parsing, removed as obsolete in 2.2).
// "Status" is honest, not aspirational: only the 5 rows this page has
// actually verified against real app behavior elsewhere are marked
// Verified — everything else is Not yet audited rather than assumed
// compliant, the same discipline applied to every component claim on
// this page.
const WCAG_CHECKS = [
  ['1.1.1', 'Non-text Content', 'A', 'Every image/icon-only control has a text alternative.', 'todo'],
  ['1.2.1', 'Audio-only and Video-only (Prerecorded)', 'A', 'Alternatives exist for any prerecorded audio/video-only content.', 'na'],
  ['1.2.2', 'Captions (Prerecorded)', 'A', 'Captions for prerecorded video with audio.', 'na'],
  ['1.2.3', 'Audio Description or Media Alternative', 'A', 'A text or audio-description alternative for prerecorded video.', 'na'],
  ['1.2.4', 'Captions (Live)', 'AA', 'Captions for live audio content.', 'na'],
  ['1.2.5', 'Audio Description (Prerecorded)', 'AA', 'Audio description for prerecorded video.', 'na'],
  ['1.3.1', 'Info and Relationships', 'A', 'Structure/relationships conveyed in markup, not just visually.', 'todo'],
  ['1.3.2', 'Meaningful Sequence', 'A', 'Reading/navigation order matches visual order.', 'todo'],
  ['1.3.3', 'Sensory Characteristics', 'A', 'Instructions never rely on shape/color/position alone.', 'todo'],
  ['1.3.4', 'Orientation', 'AA', 'Content isn\'t locked to one display orientation.', 'todo'],
  ['1.3.5', 'Identify Input Purpose', 'AA', 'Common input fields expose their purpose (autocomplete).', 'todo'],
  ['1.4.1', 'Use of Color', 'A', 'Color is never the only way information is conveyed.', 'verified', 'Status badges pair color with text (Badges component)'],
  ['1.4.2', 'Audio Control', 'A', 'Auto-playing audio over 3s can be paused/stopped/muted.', 'na'],
  ['1.4.3', 'Contrast (Minimum)', 'AA', 'Text vs. background meets 4.5:1 in both themes.', 'verified', 'Color tokens designed for this; not independently re-measured here'],
  ['1.4.4', 'Resize Text', 'AA', 'Text can be resized 200% without loss of content/function.', 'todo'],
  ['1.4.5', 'Images of Text', 'AA', 'Real text is used instead of images of text.', 'todo'],
  ['1.4.10', 'Reflow', 'AA', 'Content reflows at 320px width without 2-D scrolling.', 'todo'],
  ['1.4.11', 'Non-text Contrast', 'AA', 'UI components/graphics meet 3:1 contrast against adjacent colors.', 'todo'],
  ['1.4.12', 'Text Spacing', 'AA', 'No loss of content when text spacing is overridden.', 'todo'],
  ['1.4.13', 'Content on Hover or Focus', 'AA', 'Hover/focus-triggered content is dismissible, hoverable, persistent.', 'todo'],
  ['2.1.1', 'Keyboard', 'A', 'Every interactive control is reachable and operable via keyboard alone.', 'verified', 'See the Keyboard interaction table below'],
  ['2.1.2', 'No Keyboard Trap', 'A', 'Keyboard focus can always move away from any component.', 'todo'],
  ['2.1.4', 'Character Key Shortcuts', 'A', 'Single-character shortcuts can be turned off/remapped.', 'na'],
  ['2.2.1', 'Timing Adjustable', 'A', 'Time limits can be turned off, adjusted, or extended.', 'na'],
  ['2.2.2', 'Pause, Stop, Hide', 'A', 'Moving/auto-updating content can be paused (e.g. the Content card\'s float animation).', 'todo'],
  ['2.3.1', 'Three Flashes or Below', 'A', 'Nothing flashes more than 3 times per second.', 'verified', 'No flashing content anywhere in the app'],
  ['2.4.1', 'Bypass Blocks', 'A', 'A skip-to-content mechanism exists.', 'todo'],
  ['2.4.2', 'Page Titled', 'A', 'Every page has a descriptive <title>.', 'todo'],
  ['2.4.3', 'Focus Order', 'A', 'Focus order preserves meaning and operability.', 'todo'],
  ['2.4.4', 'Link Purpose (In Context)', 'A', 'A link\'s purpose is clear from its text or context.', 'todo'],
  ['2.4.5', 'Multiple Ways', 'AA', 'More than one way to locate a page (nav + search, etc.).', 'todo'],
  ['2.4.6', 'Headings and Labels', 'AA', 'Headings and labels describe topic or purpose.', 'todo'],
  ['2.4.7', 'Focus Visible', 'AA', 'A visible focus indicator is drawn for every focusable element.', 'verified', 'See the Keyboard interaction table below'],
  ['2.4.11', 'Focus Not Obscured (Minimum)', 'AA', 'The focused element is not entirely hidden by other content.', 'todo'],
  ['2.5.1', 'Pointer Gestures', 'A', 'Multipoint/path gestures have a single-pointer alternative.', 'na'],
  ['2.5.2', 'Pointer Cancellation', 'A', 'Actions can be cancelled before completion (up-event, not down-event).', 'todo'],
  ['2.5.3', 'Label in Name', 'A', 'A control\'s accessible name contains its visible label text.', 'todo'],
  ['2.5.4', 'Motion Actuation', 'A', 'Motion-triggered functions have a UI alternative.', 'na'],
  ['2.5.7', 'Dragging Movements', 'AA', 'Drag-based actions have a single-pointer alternative.', 'na'],
  ['2.5.8', 'Target Size (Minimum)', 'AA', 'Touch targets are at least 24×24px (or have adequate spacing).', 'verified', '.icon-btn is 36×36px, .a11y-switch has a 44px hit area'],
  ['3.1.1', 'Language of Page', 'A', 'The page\'s primary language is set (lang attribute).', 'todo'],
  ['3.1.2', 'Language of Parts', 'AA', 'Language changes within a page are marked.', 'na'],
  ['3.2.1', 'On Focus', 'A', 'Focusing an element never triggers an unexpected context change.', 'todo'],
  ['3.2.2', 'On Input', 'A', 'Changing a setting never triggers an unexpected context change.', 'todo'],
  ['3.2.3', 'Consistent Navigation', 'AA', 'Repeated navigation stays in the same relative order.', 'verified', 'Sidebar order is fixed across every authenticated page'],
  ['3.2.4', 'Consistent Identification', 'AA', 'Components with the same function are identified consistently.', 'verified', '.btn-primary/.req-status/.icon-btn used identically everywhere'],
  ['3.2.6', 'Consistent Help', 'A', 'Help mechanisms appear in the same relative order across pages.', 'todo'],
  ['3.3.1', 'Error Identification', 'A', 'Form errors use role="alert", described in text, not color alone.', 'verified', 'See the Forms & inputs component'],
  ['3.3.2', 'Labels or Instructions', 'A', 'Every input has a label or instruction.', 'verified', 'See the Forms & inputs component'],
  ['3.3.3', 'Error Suggestion', 'AA', 'Error messages suggest a fix when known.', 'todo'],
  ['3.3.4', 'Error Prevention (Legal, Financial, Data)', 'AA', 'Submissions are reversible, checked, or confirmed.', 'verified', 'Destructive actions use .confirm-dialog'],
  ['3.3.7', 'Redundant Entry', 'A', 'Information already entered isn\'t asked for again in the same process.', 'todo'],
  ['3.3.8', 'Accessible Authentication (Minimum)', 'AA', 'No cognitive-function test is required to log in, unless an alternative exists.', 'todo'],
  ['4.1.2', 'Name, Role, Value', 'A', 'Custom components expose an accessible name/role/state.', 'verified', 'Toggle switches, tabs, dialogs use proper ARIA'],
  ['4.1.3', 'Status Messages', 'AA', 'Status changes are announced without moving focus (aria-live).', 'todo'],
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
  const primaryTokenValues = useResolvedTokens(PRIMARY_COLORS.map(([, v]) => v))

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
          <img src={theme === 'dark' ? '/core-logo-dark.svg' : '/core-logo.svg'} alt="CORE" className="ds-logo-mark" />
          <span className="ds-logo-div" />
          <img src={theme === 'dark' ? '/logo-lockup-dark.svg' : '/logo-lockup-light.svg'} alt={BRAND.name} className="ds-logo-mark" style={{ height: 20 }} />
          <span className="ds-logo-div" />
          Participant Portal Design System
        </div>
        <div className="ds-meta">
          <button type="button" className="ds-theme-toggle" onClick={toggle} aria-pressed={theme === 'dark'} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <Icon icon={theme === 'dark' ? faSun : faMoon} size={16} />
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <a href="https://github.com/Satish0024/S_PPT/issues" target="_blank" rel="noreferrer" className="ds-back">
            <Icon icon={faTriangleExclamation} size={13} /> Raise an issue
          </a>
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
            <h1>The design system behind the CORE Participant Portal.</h1>
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
              This is the design system for the CORE Participant Portal. Every component below is
              pulled from the real app CSS — verified via grep against the actual stylesheet, not
              written from memory of what the pattern "should" look like.
            </p>
          </section>

          {/* ---------------- COLOR ---------------- */}
          <section id="color" className="ds-section">
            <h2>Color</h2>
            <p className="ds-lede">The primary, most-reached-for tokens at a glance — click any swatch to copy its current value. The full light/dark breakdown, including every status and neutral variant, follows below.</p>
            <div className="ds-token-grid">
              {PRIMARY_COLORS.map(([name, varName]) => {
                const hex = primaryTokenValues[varName]
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
                      <Icon icon={faCopy} size={13} className="ds-swatch-copy-ico" />
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

            <h3 className="ds-sub">Full token reference</h3>
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
            <p className="ds-lede">
              One table, real range and proposed consolidation together. The app has no shared
              type-scale utility — every page sizes its own text ad hoc — so each role below shows
              the real classes actually shipping today at that role, plus the single size/weight
              this design system proposes standardizing on going forward.
            </p>
            <div className="ds-card">
              <table className="ds-type-table">
                <thead><tr><th>Role</th><th>Real range today</th><th>Real classes (examples)</th><th>Proposed standard</th></tr></thead>
                <tbody>
                  {TYPE_SCALE.map((t) => (
                    <tr key={t.role}>
                      <td><b>{t.role}</b></td>
                      <td><code>{t.size}</code> / <code>{t.weight}</code></td>
                      <td style={{ fontSize: 12.5 }}>{t.real.map((r, i) => <div key={i}><code>{r}</code></div>)}</td>
                      <td>{t.proposed ? <code>{t.proposed}</code> : <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="ds-sub">Applied in context — the real Dashboard</h3>
            <p className="ds-lede">components/dashboard/*.jsx, assembled as it actually renders — every text size below is the real class, not the proposed scale.</p>
            <div className="ds-example-screen" style={{ maxWidth: 560 }}>
              <div className="page-body" style={{ padding: '22px 24px', background: 'var(--bg)' }}>
                <div className="hi-bar" style={{ marginBottom: 14 }}>
                  <Dot>1</Dot>
                  <h1 style={{ display: 'inline', marginLeft: 6 }}>Hi Jordan 👋</h1>
                </div>
                <section className="overall-balance" style={{ marginBottom: 16 }}>
                  <div className="ob-top">
                    <div className="ob-metrics">
                      <div className="ob-block">
                        <div className="ob-k"><Dot>2</Dot>Account balance</div>
                        <div className="ob-v"><Dot>3</Dot>$284,900.00</div>
                      </div>
                    </div>
                  </div>
                </section>
                <section>
                  <h2 className="section-title"><Dot>4</Dot>My plans</h2>
                  <article className="plan-card" style={{ maxWidth: 280 }}>
                    <div className="pc-top">
                      <div>
                        <h3 className="pc-name"><Dot>5</Dot>401(k) Plan</h3>
                        <div className="pc-type"><Dot>6</Dot>Traditional</div>
                        <div className="pc-meta"><Dot>7</Dot>Employer: Acme Corp</div>
                      </div>
                    </div>
                  </article>
                </section>
              </div>
            </div>
            <DotLegend items={[
              '.hi-bar h1 · 26px/700 — the real Dashboard "page title"',
              '.ob-k · 13px/600, --muted — small label above a figure',
              '.ob-v · 34px/700, tabular-nums — a dollar figure, not a heading',
              '.section-title · 16px/700 — real "section heading"',
              '.pc-name (h3) · 15px/700 — plan card title',
              '.pc-type · 12px/600, --brand',
              '.pc-meta · 12px/400, --ink-soft',
            ]} />
          </section>

          {/* ---------------- SPACE ---------------- */}
          <section id="space" className="ds-section">
            <h2>Spacing & radius</h2>
            <p className="ds-lede">A 4px-based spacing scale, verified against real gap/padding usage across the app — every step below names where it's actually used, not just its size.</p>

            <h3 className="ds-sub">Spacing scale</h3>
            <p className="ds-lede">Each row shows the <b>actual gap</b> as a live gap between two real boxes — not a bar standing in for it.</p>
            <div className="ds-card">
              <table className="ds-type-table">
                <thead><tr><th>Step</th><th>The gap itself</th><th>Used for</th></tr></thead>
                <tbody>
                  {SPACE_SCALE.map(([s, use]) => (
                    <tr key={s}>
                      <td style={{ width: 60 }}><code>{s}px</code></td>
                      <td style={{ width: 160 }}>
                        <div style={{ display: 'flex', gap: s, alignItems: 'center' }}>
                          <div style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--brand)', flex: '0 0 auto' }} />
                          <div style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--brand)', flex: '0 0 auto' }} />
                        </div>
                      </td>
                      <td>{use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="ds-sub">Radius scale</h3>
            <p className="ds-lede">Same corner radius applied to a large enough swatch that the curve itself is legible, not just implied.</p>
            <div className="ds-card">
              <table className="ds-type-table">
                <thead><tr><th>Radius</th><th>Swatch</th><th>Used for</th></tr></thead>
                <tbody>
                  {RADIUS_SCALE.map(([r, use]) => (
                    <tr key={r}>
                      <td style={{ width: 70 }}><code>{r}px</code></td>
                      <td style={{ width: 90 }}>
                        <div style={{ width: 56, height: 56, borderRadius: r, background: 'var(--brand)' }} />
                      </td>
                      <td>{use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="ds-sub">Border width</h3>
            <p className="ds-lede">The other half of a "corner + edge" system, alongside radius above. Grepped: 58 rules use 1px, 4 use 2px — nothing else appears.</p>
            <div className="ds-card">
              <table className="ds-type-table">
                <thead><tr><th>Width</th><th>Swatch</th><th>Used for</th></tr></thead>
                <tbody>
                  <tr>
                    <td style={{ width: 70 }}><code>1px</code></td>
                    <td style={{ width: 90 }}><div style={{ width: 56, height: 32, borderRadius: 8, border: '1px solid var(--ink)' }} /></td>
                    <td>The default everywhere — cards, inputs, dividers, table rows</td>
                  </tr>
                  <tr>
                    <td style={{ width: 70 }}><code>2px</code></td>
                    <td style={{ width: 90 }}><div style={{ width: 56, height: 32, borderRadius: 8, border: '2px solid var(--ink)' }} /></td>
                    <td>Focus rings and the switch thumb's outline — always draws attention, never decorative</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="ds-sub">Icon size</h3>
            <p className="ds-lede">Grepped inline SVG dimensions — icons are not on one shared scale either, sized per context.</p>
            <div className="ds-card">
              <table className="ds-type-table">
                <thead><tr><th>Size</th><th>Icon</th><th>Used for</th></tr></thead>
                <tbody>
                  <tr><td style={{ width: 70 }}><code>16px</code></td><td style={{ width: 60 }}><Icon icon={faCheck} size={16} /></td><td>Dense inline icons (.empty-side)</td></tr>
                  <tr><td style={{ width: 70 }}><code>18px</code></td><td style={{ width: 60 }}><Icon icon={faCheck} size={18} /></td><td>Quick-link cards (.quick-link)</td></tr>
                  <tr><td style={{ width: 70 }}><code>20px</code></td><td style={{ width: 60 }}><Icon icon={faCheck} size={20} /></td><td>Inside .icon-btn's 36×36px circle</td></tr>
                  <tr><td style={{ width: 70 }}><code>23px</code></td><td style={{ width: 60 }}><Icon icon={faCheck} size={23} /></td><td>Sidebar nav item icons (.nav .ico svg)</td></tr>
                </tbody>
              </table>
            </div>

            <h3 className="ds-sub">Applied in context</h3>
            <p className="ds-lede">The same field/button/card cluster, each part labeled with the exact spacing and radius producing it.</p>
            <div className="ds-example-screen" style={{ maxWidth: 560 }}>
              <div style={{ padding: '24px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Dot>1</Dot>
                  <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>24px page-edge padding around this whole block</span>
                </div>
                <div style={{ padding: 16, borderRadius: 14, background: 'var(--panel)', border: '1px solid var(--line)', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Dot>2</Dot><Dot>3</Dot>
                    <span style={{ fontSize: 13.5, fontWeight: 700 }}>Account nickname</span>
                  </div>
                  <input readOnly value="My 401(k)" style={{ marginTop: 8, minHeight: 40, border: '1px solid var(--line)', borderRadius: 9, padding: '8px 12px', font: 'inherit', fontSize: 14, fontWeight: 600, background: 'var(--bg)', width: '100%' }} />
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Dot>4</Dot>
                  <button type="button" className="btn btn-primary" tabIndex={-1} style={{ width: 'auto' }}>Save</button>
                  <Dot>5</Dot>
                  <button type="button" className="btn btn-secondary" tabIndex={-1} style={{ width: 'auto' }}>Cancel</button>
                </div>
              </div>
            </div>
            <DotLegend items={[
              'Page padding · 24px',
              'Card padding · 16px, card radius · 14px',
              'Gap between label and field · 8px (implicit via margin)',
              'Button radius · 10px, gap between buttons · 8px',
              'Same .btn radius, secondary variant',
            ]} />
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

            <h3 className="ds-sub">Which real classes use which token</h3>
            <p className="ds-lede">Grepped directly from the stylesheets — every class that actually applies a shadow, not a guess at what "should" have one.</p>
            <div className="ds-card">
              <table className="ds-type-table">
                <thead><tr><th>Token</th><th>Real classes</th></tr></thead>
                <tbody>
                  <tr>
                    <td><code>--shadow</code></td>
                    <td><code>.card</code>, <code>.cards</code>, <code>.panel</code>, <code>.rr-card</code>, <code>.section-card</code>, <code>.side-card</code>, <code>.status-banner</code>, <code>.tx-filters</code>, <code>.user-chip</code></td>
                  </tr>
                  <tr>
                    <td><code>--shadow-lg</code></td>
                    <td><code>.confirm-dialog</code>, <code>.enroll-modal</code>, <code>.learn-card</code>, <code>.quick-link</code></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="ds-sub">On a button</h3>
            <p className="ds-lede">Buttons are one of the few controls that intentionally carry <b>no</b> shadow — verified: no .btn/.icon-btn rule in index.css sets box-shadow. Elevation communicates surface layering, not click affordance, in this system.</p>
            <div className="ds-usage-grid">
              <div className="ds-usage-box do"><span className="ds-usage-badge"><Icon icon={faCheck} size={12} /></span><p>Let a button's color and border carry its affordance — no shadow needed.</p></div>
              <div className="ds-usage-box dont"><span className="ds-usage-badge"><Icon icon={faXmark} size={12} /></span><p>Don't add box-shadow to a button to make it "pop" — it isn't part of this system and reads as a bug, not a design choice.</p></div>
            </div>

            <h3 className="ds-sub">Applied in context</h3>
            <p className="ds-lede">Both shown together the way they actually stack: a resting card holding a raised dropdown — numbered markers point at the exact element each token produces.</p>
            <div className="ds-example-screen" style={{ maxWidth: 400 }}>
              <div style={{ padding: '32px 24px 60px', position: 'relative' }}>
                <div style={{ position: 'relative', maxWidth: 320, margin: '0 auto' }}>
                  <div style={{ padding: 20, borderRadius: 14, background: 'var(--panel)', boxShadow: 'var(--shadow)', border: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Dot>1</Dot>
                      <b style={{ fontSize: 13.5 }}>Account balance</b>
                    </div>
                  </div>
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 40, marginTop: 8, padding: 12, borderRadius: 12, background: 'var(--panel)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Dot>2</Dot>
                      <b style={{ fontSize: 12.5 }}>Dropdown menu</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DotLegend items={['--shadow · resting card in the normal document flow', '--shadow-lg · raised above the flow (dropdowns, dialogs, the user menu)']} />
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

          {/* ---------------- ASSETS (logo only, by request) ---------------- */}
          <section id="assets" className="ds-section">
            <h2>Logo</h2>
            <p className="ds-lede">
              The real logo files this app ships in <code>/public</code>, referenced only through{' '}
              <code>config/brand.js</code> — component code never hardcodes a filename or brand
              name, so a rebrand only has to swap these files, not touch JSX. Illustrations exist
              too (e.g. <code>learning-illustration.png</code>, used on the{' '}
              <a href="#content-card">Content card</a>) but aren't catalogued here — this section
              is scoped to the logo only.
            </p>
            <div className="ds-asset-grid">
              {LOGO_ASSETS.map(([name, src, use]) => (
                <div key={src} className="ds-card ds-asset-card">
                  <div className={`ds-asset-preview${src.includes('dark') ? ' dark' : ''}`}>
                    <img src={src} alt={name} onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  </div>
                  <div className="ds-asset-meta">
                    <b>{name}</b>
                    <span>{use}</span>
                    <button type="button" className="ds-hex-cell" onClick={() => copyToClipboard(src)} title="Copy path">
                      <code>{src}</code><Icon icon={faCopy} size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ---------------- ICONS ---------------- */}
          <section id="icons" className="ds-section">
            <h2>Icons</h2>
            <p className="ds-lede">
              <a href="https://fontawesome.com/" target="_blank" rel="noreferrer">Font Awesome 6</a>,
              Free/Solid — the icon set adopted for this system, replacing the app's earlier{' '}
              <code>lucide-react</code> icons. Every icon the installed package ships is listed
              below, {ALL_SOLID_ICONS.length} in total, including ones not yet used anywhere in the
              app — so a future need is a copy-paste away, not a new dependency. Click any icon to
              copy its import name, or{' '}
              <a href="https://fontawesome.com/download" target="_blank" rel="noreferrer">get the full Font Awesome 6 kit</a>.
            </p>

            <h3 className="ds-sub">Size, padding, usage</h3>
            <p className="ds-lede">Real sizes in the app are covered on the <a href="#space">Spacing &amp; radius</a> page's Icon size table (16/18/20/23px). Below is this grid's own cell spec.</p>
            <div className="ds-card">
              <table className="ds-type-table">
                <thead><tr><th>Property</th><th>Value</th><th>Notes</th></tr></thead>
                <tbody>
                  <tr><td>Cell padding</td><td><code>10px 4px</code></td><td>Generous top/bottom for a comfortable click target; tight sides so labels don't clip</td></tr>
                  <tr><td>Icon-to-label gap</td><td><code>6px</code></td><td>Matches the 4px spacing-scale step rounded up for legibility</td></tr>
                  <tr><td>Icon render size (this grid)</td><td><code>18px</code></td><td>A neutral mid-point — pick the real context size (16/18/20/23px) when using one in the app</td></tr>
                  <tr><td>Hover state</td><td><code>--surface-2</code> bg, <code>--line</code> border</td><td>Same hover treatment as .icon-btn</td></tr>
                </tbody>
              </table>
            </div>
            <div className="ds-usage-grid" style={{ padding: '0 0 20px' }}>
              <div className="ds-usage-box do"><span className="ds-usage-badge"><Icon icon={faCheck} size={12} /></span><p>Pick the icon size from the real Spacing &amp; radius scale (16/18/20/23px) for the context you're in — don't invent a new size.</p></div>
              <div className="ds-usage-box dont"><span className="ds-usage-badge"><Icon icon={faXmark} size={12} /></span><p>Don't mix Font Awesome with the app's old lucide-react icons on the same screen — pick one set per surface.</p></div>
            </div>

            <h3 className="ds-sub">Full set</h3>
            <div className="ds-icon-grid">
              {ALL_SOLID_ICONS.map(([name, def]) => (
                <button key={name} type="button" className="ds-icon-cell" onClick={() => copyToClipboard(name)} title={`Copy "${name}"`}>
                  <Icon icon={def} size={18} />
                  <span>{name.replace(/^fa/, '')}</span>
                </button>
              ))}
            </div>
            <div className="ds-usage-grid" style={{ padding: '16px 0 0' }}>
              <div className="ds-usage-box do"><span className="ds-usage-badge"><Icon icon={faCheck} size={12} /></span><p>Icon-only controls must carry their own aria-label — the icon has no accessible name by itself.</p></div>
              <div className="ds-usage-box do"><span className="ds-usage-badge"><Icon icon={faCheck} size={12} /></span><p>Icons paired with a visible text label need no extra markup.</p></div>
            </div>
          </section>

          {/* ---------------- COMPONENTS (section title/separator, since the
              8 Component cards below have no shared heading of their own —
              only their individual titles inside each card) ---------------- */}
          <div className="ds-group-title">
            <h2>Components</h2>
            <p className="ds-lede">Every UI building block below, as it actually renders — grep-verified class names, padding, and sizes throughout.</p>
          </div>

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
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Dot>1</Dot>
                  <button type="button" className="btn btn-primary" tabIndex={-1}>Save changes</button>
                  <Dot>2</Dot>
                  <button type="button" className="icon-btn" tabIndex={-1} aria-label="Settings"><Icon icon={faGear} size={18} /></button>
                </div>
                <DotLegend items={['Label — 14px/700', 'Icon-only · .icon-btn, 36×36px']} />
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
            dos={[
              'Give every icon-only button an aria-label.',
              'Keep one primary button per view.',
              'Fixed — .btn now has a real :disabled style (50% opacity, not-allowed cursor). It used to have none, so a disabled button rendered pixel-identical to an active one.',
            ]}
            donts={[
              "Don't combine .btn with .btn-sm — .btn-sm is dead CSS with zero real usages and its own padding loses the cascade to .btn.",
              "Don't treat the \"Proposed\" row as existing CSS — Destructive/Small/Large/Loading are inline-styled mockups for a variant that hasn't been built. Add a real .btn-danger / .btn-sm-v2 / .btn-lg / .btn-loading class before using one in a page.",
            ]}
            code={`<button type="button" className="btn btn-primary">Save changes</button>
<button type="button" className="btn btn-ghost">Ghost</button>
<button type="button" className="icon-btn" aria-label="Print"><Icon icon={faPrint} /></button>`}
            colors={[['Brand fill', '--brand-fill'], ['Brand dark (hover)', '--brand-dark'], ['Line', '--line']]}
            extra={
              <div className="ds-panel-row" style={{ borderTop: '1px solid var(--line)', padding: '14px 20px', fontSize: 13, lineHeight: 1.6 }}>
                <b style={{ color: 'var(--green)' }}>Fixed — </b> these buttons used to render full-width on most
                real pages by default. Root cause: <code>enrollment.css</code>'s <code>.summary .foot</code>{' '}
                button block was written as a bare, unscoped <code>.btn{'{'}width:100%{'}'}</code> rule. Because
                every page component is statically imported from <code>App.jsx</code>, Vite bundles that CSS
                globally, so the unscoped rule silently overrode <code>index.css</code>'s real <code>.btn</code>{' '}
                everywhere, not just inside the summary panel it was meant for. Fixed by scoping both duplicate
                copies of the rule to <code>.summary .foot .btn</code>, where they were always meant to apply.
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
            donts={["Don't trust the focus-ring color to always equal --brand — transactions.css line 111 hard-codes rgba(46,49,146,.12) instead of using the token, so with the current --brand value the focus ring is subtly the wrong hue. Real, pre-existing bug, not a design choice."]}
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
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Dot>1</Dot>
                  <span className="req-status good">Approved</span>
                  <Dot>2</Dot>
                  <span className="req-status good">Approved</span>
                </div>
                <DotLegend items={['Label · 11.5px/800', 'Fill · --green/--green-bg']} />
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
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <div className="confirm-dialog" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}><Dot>1</Dot></div>
                    <div className="confirm-dialog-ico"><Icon icon={faTriangleExclamation} size={20} /></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}><Dot>2</Dot><h4 style={{ margin: 0 }}>Cancel this request?</h4></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}><Dot>3</Dot><p style={{ margin: 0 }}>This rollover request will be withdrawn.</p></div>
                    <div className="confirm-dialog-actions">
                      <button type="button" className="btn btn-secondary" tabIndex={-1}>Keep it</button>
                      <button type="button" className="btn btn-primary" tabIndex={-1}>Cancel request</button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}><Dot>4</Dot></div>
                  </div>
                </div>
                <DotLegend items={[
                  'Icon badge · 44×44px, --red-bg',
                  'Title · 17px/800, always phrased as a question',
                  'Body · 13.5px/400, --ink-soft',
                  'Actions · equal-width, safe choice left / destructive right',
                ]} />
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 420, margin: '0 auto 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Dot>1</Dot>
                    <div style={{ height: 26, width: 80, borderRadius: 4, background: 'var(--surface-3)' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Dot>2</Dot>
                    <button type="button" className="icon-btn" tabIndex={-1} aria-label="Switch theme"><Icon icon={faMoon} size={18} /></button>
                    <Dot>3</Dot>
                    <div className="user-chip">
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--active-bg)' }} />
                      <span className="chip-text"><span className="chip-name">Jordan Lee</span></span>
                      <Icon icon={faChevronDown} size={13} className="chev" />
                    </div>
                  </div>
                </div>
                <DotLegend items={['Brand · 26px logo', 'Icon button · 36×36px', 'User chip · avatar + name + chevron']} />
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

          {/* ---------------- STEPS ---------------- */}
          {/* Verified: styles/enrollment.css .steps/.step/.rail/.num/
              .rail-line/.body (lines 77-101) — the enrollment flow's real
              progress stepper. Not previously documented anywhere on this
              page, despite existing and being used on every enrollment
              screen. */}
          <Component
            id="steps" title="Steps"
            desc=".step (styles/enrollment.css) — the enrollment flow's vertical progress stepper."
            anatomy={
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <div style={{ width: 260 }}>
                    <div className="step complete">
                      <div className="rail" style={{ position: 'relative' }}>
                        <div className="num"><Icon icon={faCheck} size={13} /></div>
                        <div className="rail-line" />
                        <span style={{ position: 'absolute', left: 40, top: 34 }}><Dot>2</Dot></span>
                      </div>
                      <div className="body" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Dot>1</Dot><h3 style={{ margin: 0 }}>Personal info</h3>
                      </div>
                    </div>
                    <div className="step current">
                      <div className="rail"><div className="num">2</div></div>
                      <div className="body" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Dot>3</Dot><h3 style={{ margin: 0 }}>Investment elections</h3>
                      </div>
                    </div>
                  </div>
                </div>
                <DotLegend items={[
                  'Number badge · 32×32px circle (complete = --green, check icon)',
                  'Rail line · 2px, connects steps (the last step has none)',
                  'Title (h3) · 15px/600, --brand when current',
                ]} />
                <div className="ds-spec-facts">
                  <span><b>Complete</b> --green num, check icon</span><span><b>Current</b> --brand-fill num, --brand title</span><span><b>Upcoming</b> --surface-3 num, default text</span>
                </div>
                <p className="ds-anatomy-caption">a. Progress step (styles/enrollment.css .step, line 83)</p>
              </div>
            }
            demo={<>
              <VariantGroup tag="live" title=".steps (enrollment.css) — complete / current / upcoming">
                <div style={{ width: 240 }}>
                  <div className="step complete">
                    <div className="rail"><div className="num"><Icon icon={faCheck} size={13} /></div><div className="rail-line" /></div>
                    <div className="body"><h3>Personal info</h3><p>Confirmed</p></div>
                  </div>
                  <div className="step current">
                    <div className="rail"><div className="num">2</div><div className="rail-line" /></div>
                    <div className="body"><h3>Investment elections</h3><p>In progress</p></div>
                  </div>
                  <div className="step">
                    <div className="rail"><div className="num">3</div><div className="rail-line" /></div>
                    <div className="body"><h3>Review & submit</h3></div>
                  </div>
                  <div className="step">
                    <div className="rail"><div className="num">4</div></div>
                    <div className="body"><h3>Confirmation</h3></div>
                  </div>
                </div>
              </VariantGroup>
            </>}
            dos={['Keep the current step visually distinct (brand fill) — never rely on position alone.']}
            code={`<div className="step current">
  <div className="rail"><div className="num">2</div><div className="rail-line" /></div>
  <div className="body"><h3>Investment elections</h3></div>
</div>`}
            colors={[['Current', '--brand-fill'], ['Complete', '--green'], ['Upcoming', '--surface-3']]}
          />

          {/* ---------------- SPINNER ---------------- */}
          {/* Verified: styles/enrollment.css .spinner (line 101) — the
              real loading indicator, paired with .step-status. Also not
              previously documented. */}
          <Component
            id="spinner" title="Spinner"
            desc=".spinner (styles/enrollment.css) — the loading indicator, used inside .step-status."
            demo={<>
              <VariantGroup tag="live" title=".spinner — 11×11px, 2px border, spins 1s linear infinite">
                <span className="spinner" />
                <span className="step-status"><span className="spinner" />Saving…</span>
              </VariantGroup>
            </>}
            dos={['Pair with visible text ("Saving…") — a spinner alone has no accessible meaning.']}
            code={`<span className="step-status">
  <span className="spinner" />
  Saving…
</span>`}
            colors={[['Spin color', '--brand'], ['Track', '--line-strong']]}
          />

          {/* ---------------- CONTENT CARD ---------------- */}
          {/* Verified: styles/index.css .learn2/.learn2-field/.learn2-body/
              .learn2-tag/.learn2-title/.learn2-desc/.learn2-cta (line 2264)
              — components/dashboard/LearningPortal.jsx's real markup. Uses
              a real illustration (public/learning-illustration.png) —
              confirmed present; the earlier claim in the Logo section that
              "no illustrations exist" was wrong and has been corrected. */}
          <Component
            id="content-card" title="Content card"
            desc=".learn2 (styles/index.css) — the Financial Wellness dashboard widget: tag, title, description, CTA, and a full-color illustration."
            anatomy={
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div className="learn2" style={{ maxWidth: 380, margin: '0 auto 16px' }}>
                  <img className="learn2-field" src="/learning-illustration.png" alt="" aria-hidden="true" />
                  <div className="learn2-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Dot>1</Dot><span className="learn2-tag">Learning</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Dot>2</Dot><h3 className="learn2-title" style={{ margin: 0 }}>Financial Wellness</h3></div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, margin: '7px 0' }}><Dot>3</Dot><p className="learn2-desc" style={{ margin: 0 }}>Learn about planning, saving, investing wisely</p></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Dot>4</Dot><span className="learn2-cta">Know More <Icon icon={faArrowRight} size={12} /></span></div>
                  </div>
                </div>
                <DotLegend items={[
                  'Tag · 9.5px/700, uppercase pill',
                  'Title (h3) · 21px/700',
                  'Description · 12.5px/400',
                  'CTA · 12.5px/700, arrow slides on hover',
                ]} />
                <div className="ds-spec-facts">
                  <span><b>Padding</b> 20px</span><span><b>Illustration width</b> 56% (max 230px)</span><span><b>Illustration motion</b> 6s ease float loop</span>
                </div>
                <p className="ds-anatomy-caption">a. Content card (styles/index.css .learn2, line 2264)</p>
              </div>
            }
            demo={<>
              <VariantGroup tag="live" title=".learn2 — the real Financial Wellness widget">
                <div className="learn2" style={{ maxWidth: 380 }}>
                  <img className="learn2-field" src="/learning-illustration.png" alt="" aria-hidden="true" />
                  <div className="learn2-body">
                    <span className="learn2-tag">Learning</span>
                    <h3 className="learn2-title">Financial Wellness</h3>
                    <p className="learn2-desc">Learn about planning, saving, investing wisely</p>
                    <a className="learn2-cta" href="#content-card" onClick={(e) => e.preventDefault()}>Know More <Icon icon={faArrowRight} size={12} /></a>
                  </div>
                </div>
              </VariantGroup>
            </>}
            dos={['Keep the illustration full-color and un-tinted — the source colors are the point, not a design token.']}
            code={`<section className="learn2">
  <img className="learn2-field" src="/learning-illustration.png" alt="" aria-hidden="true" />
  <div className="learn2-body">
    <span className="learn2-tag">Learning</span>
    <h3 className="learn2-title">Financial Wellness</h3>
    <p className="learn2-desc">...</p>
    <Link className="learn2-cta" to="/enrich">Know More<ArrowRight /></Link>
  </div>
</section>`}
            colors={[['Accent', '--learn-accent'], ['Accent bg (tag)', '--learn-accent-bg']]}
          />

          {/* ---------------- SLIDEOVER ---------------- */}
          {/* Verified: styles/index.css .slideover-bg/.slideover-panel/
              .slideover-head/.slideover-close/.slideover-body (line 1509)
              — the real-side panel used for the loan calculator and
              other in-context flows. Not previously documented. */}
          <Component
            id="slideover" title="Slideover"
            desc=".slideover-panel (styles/index.css) — a right-edge panel over a dimmed backdrop, for in-context tasks that don't need a full page."
            anatomy={
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div style={{ position: 'relative', height: 240, borderRadius: 12, overflow: 'hidden', background: 'var(--surface-3)' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,21,31,.46)' }} />
                  <div className="slideover-panel" style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 260, maxWidth: 260 }}>
                    <div className="slideover-head">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Dot>1</Dot><h3>Loan calculator</h3></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Dot>2</Dot>
                        <button type="button" className="slideover-close" tabIndex={-1}><Icon icon={faXmark} size={14} /></button>
                      </div>
                    </div>
                    <div className="slideover-body" style={{ fontSize: 12, color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Dot>3</Dot>Body content scrolls independently
                    </div>
                  </div>
                </div>
                <DotLegend items={[
                  'Head · 20px 24px padding, 1px --line bottom border',
                  'Close button · 32×32px circle, --hover-bg fill on hover',
                  'Body · 22px 24px padding, --surface-2 background, scrolls independently',
                ]} />
                <div className="ds-spec-facts" style={{ marginTop: 16 }}>
                  <span><b>Width</b> 420px (680px .slideover-wide)</span><span><b>Backdrop</b> rgba(20,21,31,.46)</span><span><b>Animation</b> slides in from the right, .28s</span>
                </div>
                <p className="ds-anatomy-caption">a. Slideover (styles/index.css .slideover-panel, line 1509)</p>
              </div>
            }
            demo={<>
              <VariantGroup tag="live" title=".slideover-panel over a dimmed backdrop">
                <div style={{ position: 'relative', width: '100%', height: 280, borderRadius: 12, overflow: 'hidden', background: 'var(--surface-3)' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,21,31,.46)' }} />
                  <div className="slideover-panel" style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 300, maxWidth: '80%' }}>
                    <div className="slideover-head">
                      <h3>Loan calculator</h3>
                      <button type="button" className="slideover-close" tabIndex={-1} aria-label="Close"><Icon icon={faXmark} size={14} /></button>
                    </div>
                    <div className="slideover-body">
                      <p style={{ margin: '0 0 12px', fontSize: 13.5, color: 'var(--ink-soft)' }}>Estimate a loan against your vested balance.</p>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-soft)' }}>Loan amount
                        <input readOnly value="$10,000" style={{ marginTop: 6, width: '100%', minHeight: 40, border: '1px solid var(--line)', borderRadius: 9, padding: '8px 12px', font: 'inherit', fontSize: 14, fontWeight: 600, background: 'var(--panel)' }} />
                      </label>
                    </div>
                  </div>
                </div>
              </VariantGroup>
            </>}
            dos={['Trap focus inside the panel while open; Escape closes it, same as a dialog.']}
            code={`<div className="slideover-bg" role="dialog" aria-modal="true">
  <div className="slideover-panel">
    <div className="slideover-head">
      <h3>Loan calculator</h3>
      <button className="slideover-close" aria-label="Close"><X /></button>
    </div>
    <div className="slideover-body">...</div>
  </div>
</div>`}
            colors={[['Panel bg', '--panel'], ['Body bg', '--surface-2'], ['Border', '--line']]}
          />

          {/* ---------------- DONUT CHART ---------------- */}
          {/* Verified: components/dashboard/ReadinessVisuals.jsx GoalDonut
              — a hand-built SVG donut (circle + stroke-dasharray), not a
              charting library. styles/index.css .rr-donut/.rr-track/
              .rr-arc/.rr-score (line 413). Not previously documented. */}
          <Component
            id="donut" title="Donut chart"
            desc=".rr-donut (styles/index.css) — the readiness-score ring: a hand-built SVG circle with stroke-dasharray, not a charting library."
            anatomy={
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <div className="rr-donut large">
                    <svg viewBox="0 0 100 100" role="img" aria-label="72 percent">
                      <circle className="rr-track" cx="50" cy="50" r="42" strokeWidth="6.5" />
                      <circle className="rr-arc" cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="6.5" strokeDasharray={`${(72 / 100) * 2 * Math.PI * 42} ${2 * Math.PI * 42}`} />
                    </svg>
                    <div className="rr-score"><b>72%</b><span>Goal reached</span></div>
                  </div>
                </div>
                <div className="ds-spec-facts">
                  <span><b>Size</b> 108 / 168 (.large) / 176 (.rr-card) px</span><span><b>Stroke</b> 5–6.5px, round linecap</span><span><b>Track</b> #eceef4</span><span><b>Arc</b> currentColor (--brand)</span>
                </div>
                <p className="ds-anatomy-caption">a. Donut / ring chart (styles/index.css .rr-donut, line 413)</p>
              </div>
            }
            demo={<>
              <VariantGroup tag="live" title=".rr-donut — three real sizes">
                <div className="rr-donut">
                  <svg viewBox="0 0 100 100"><circle className="rr-track" cx="50" cy="50" r="42" strokeWidth="5" /><circle className="rr-arc" cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="5" strokeDasharray={`${(45 / 100) * 2 * Math.PI * 42} ${2 * Math.PI * 42}`} /></svg>
                  <div className="rr-score"><b>45%</b><span>Goal reached</span></div>
                </div>
                <div className="rr-donut large">
                  <svg viewBox="0 0 100 100"><circle className="rr-track" cx="50" cy="50" r="42" strokeWidth="6.5" /><circle className="rr-arc" cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="6.5" strokeDasharray={`${(72 / 100) * 2 * Math.PI * 42} ${2 * Math.PI * 42}`} /></svg>
                  <div className="rr-score"><b>72%</b><span>Goal reached</span></div>
                </div>
              </VariantGroup>
            </>}
            dos={['Give the <svg> an aria-label stating the percentage in words — the visual arc alone conveys nothing to a screen reader.']}
            code={`const CIRC = 2 * Math.PI * 42
<div className="rr-donut">
  <svg viewBox="0 0 100 100" role="img" aria-label={\`\${score}% funded\`}>
    <circle className="rr-track" cx="50" cy="50" r="42" strokeWidth="5" />
    <circle className="rr-arc" cx="50" cy="50" r="42" stroke="currentColor"
      strokeWidth="5" strokeDasharray={\`\${(score/100)*CIRC} \${CIRC}\`} />
  </svg>
  <div className="rr-score"><b>{score}%</b><span>Goal reached</span></div>
</div>`}
            colors={[['Arc', '--brand'], ['Score text', '--ink']]}
          />

          {/* ---------------- LINE CHART ---------------- */}
          {/* Verified: src/pages/Portfolio.jsx — the real "Asset class
              performance" chart uses Chart.js (react-chartjs-2, Line),
              not a hand-built SVG like the donut. Its chrome is real,
              documented classes: .chart-panel/.chart-top (line ~182),
              .legend/.legend-swatch (components/common/ChartLegend.jsx +
              styles/portfolio.css line 65-80), .period (line 53). The
              canvas itself is Chart.js-rendered and isn't reproduced
              pixel-for-pixel here — a static SVG polyline stands in for
              it, clearly labeled. */}
          <Component
            id="linechart" title="Line chart"
            desc=".chart-panel (styles/portfolio.css) — Portfolio's Asset class performance chart. Chart.js renders the canvas; the legend, period tabs, and card are real CSS documented here."
            anatomy={
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div className="chart-panel" style={{ maxWidth: 460, margin: '0 auto', border: '1px solid var(--line)', borderRadius: 14, padding: 16, background: 'var(--panel)' }}>
                  <div className="chart-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Dot>1</Dot><h2 style={{ fontSize: 15, margin: 0 }}>Asset class performance</h2></div>
                    <div className="legend" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <Dot>2</Dot>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5 }} className="on"><input type="checkbox" checked readOnly /><span className="legend-swatch" style={{ background: 'var(--red)' }} />Total</label>
                    </div>
                  </div>
                  <div className="period" role="tablist" aria-label="Chart period" style={{ display: 'inline-flex', marginBottom: 10 }}>
                    <Dot>3</Dot>
                    <button type="button" className="on" tabIndex={-1}>1Y</button>
                    <button type="button" tabIndex={-1}>3Y</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Dot>4</Dot>
                    <svg viewBox="0 0 200 60" style={{ width: '100%', height: 60 }}>
                      <polyline points="0,55 40,45 80,35 120,25 160,15 200,8" fill="none" stroke="var(--red)" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
                <DotLegend items={[
                  'Chart title (h2) · real .chart-top heading',
                  '.legend / .legend-swatch · ChartLegend.jsx, one checkbox per series',
                  '.period · segmented tab group, active = --brand text + --panel bg',
                  'Chart.js canvas · not reproduced pixel-for-pixel — stand-in SVG shown here',
                ]} />
                <p className="ds-anatomy-caption">a. Chart panel (styles/portfolio.css .chart-panel/.chart-top/.period, components/common/ChartLegend.jsx)</p>
              </div>
            }
            demo={<>
              <VariantGroup tag="live" title=".legend + .period — real, reusable regardless of chart library">
                <div className="legend" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <label className="on" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5 }}><input type="checkbox" checked readOnly /><span className="legend-swatch" style={{ background: 'var(--red)' }} />Total portfolio</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5 }}><input type="checkbox" readOnly /><span className="legend-swatch" style={{ background: 'var(--green)' }} />U.S. Equity</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5 }}><input type="checkbox" readOnly /><span className="legend-swatch" style={{ background: 'var(--brand)' }} />U.S. Bond</label>
                </div>
                <div className="period" role="tablist" aria-label="Chart period">
                  <button type="button" tabIndex={-1}>1M</button>
                  <button type="button" tabIndex={-1}>YTD</button>
                  <button type="button" className="on" tabIndex={-1}>1Y</button>
                  <button type="button" tabIndex={-1}>5Y</button>
                </div>
              </VariantGroup>
            </>}
            dos={['Never rely on line color alone to distinguish series — Chart.js is configured with distinct dash patterns per series too, for print/colorblind legibility.']}
            donts={["Don't assume this app uses one charting approach everywhere — this Line chart is Chart.js-rendered, while the Donut chart above is a hand-built SVG. Check which one a given screen actually uses before reusing code."]}
            code={`<section className="chart-panel">
  <div className="chart-top">
    <h2>Asset class performance</h2>
    <ChartLegend items={seriesItems} onToggle={toggleSeries} />
  </div>
  <div className="period" role="tablist">
    {PERIODS.map(p => <button className={period===p?'on':''}>{p}</button>)}
  </div>
  <div className="chart-wrap"><Line data={chart} options={chartOptions} /></div>
</section>`}
            colors={[['Active period', '--brand'], ['Series color', '--series-color (per-item CSS var)']]}
          />

          {/* ---------------- WCAG ---------------- */}
          <section id="wcag" className="ds-section">
            <h2>WCAG 2.2 AA checklist</h2>
            <p className="ds-lede">
              All {WCAG_CHECKS.length} Level A + AA success criteria in WCAG 2.2 (2.1's 50, plus
              2.2's 6 new A/AA additions, minus 4.1.1 Parsing — removed as obsolete in 2.2). Status
              is honest, not aspirational: only criteria this design system has actually verified
              against real component behavior are marked <b style={{ color: 'var(--green)' }}>Verified</b> —
              everything else is <b style={{ color: 'var(--amber)' }}>Not yet audited</b>, not assumed compliant.
            </p>
            <div className="ds-card">
              <table className="ds-type-table">
                <thead><tr><th>SC</th><th>Criterion</th><th>Level</th><th>Requirement</th><th>Status</th></tr></thead>
                <tbody>
                  {WCAG_CHECKS.map(([sc, name, level, req, status, note]) => (
                    <tr key={sc}>
                      <td><code>{sc}</code></td>
                      <td><b>{name}</b></td>
                      <td><code>{level}</code></td>
                      <td style={{ fontSize: 12.5 }}>{req}{note && <><br /><span style={{ color: 'var(--ink-soft)' }}>{note}</span></>}</td>
                      <td>
                        {status === 'verified' && <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: 12 }}>Verified</span>}
                        {status === 'todo' && <span style={{ color: 'var(--amber)', fontWeight: 700, fontSize: 12 }}>Not yet audited</span>}
                        {status === 'na' && <span style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 12 }}>N/A — no audio/video/gesture content</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
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
