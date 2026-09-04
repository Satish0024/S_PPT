import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle, Check, ChevronDown, Copy, Eye, Keyboard, Mic, Moon, MousePointerClick,
  Settings, ShieldCheck, Sun, Type as TypeIcon, Volume2, X
} from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHome, faUser, faCog, faSearch, faBars, faTimes, faCheck, faExclamationTriangle,
  faPlus, faTrash, faDownload, faUpload, faChevronDown, faArrowRight, faEye, faCopy,
  faEdit, faSave, faBell, faEnvelope, faCalendar, faFile, faFolder, faHeart, faStar
} from '@fortawesome/free-solid-svg-icons'
import { useTheme } from '../context/ThemeContext.jsx'
import { BRAND } from '../config/brand.js'
import '../styles/design-system.css'

const NAV = [
  { group: 'Get started', items: [
    { id: 'overview', label: 'Overview' },
  ] },
  { group: 'Assets', items: [
    { id: 'logo', label: 'Logo' },
  ] },
  { group: 'Foundations', items: [
    { id: 'color', label: 'Color' },
    { id: 'type', label: 'Typography' },
    { id: 'icons', label: 'Icons' },
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
  { title: 'Chart colors — primary palette (use first 6 for most charts)', tokens: [
    ['Chart 1 (brand)', '--chart-1'], ['Chart 2 (green)', '--chart-2'], ['Chart 3 (amber)', '--chart-3'],
    ['Chart 4 (red)', '--chart-4'], ['Chart 5 (accent)', '--chart-5'], ['Chart 6 (purple)', '--chart-6'],
  ] },
]

// Illustrative tint/shade ramp derived live from --brand via CSS color-mix —
// not separate tokens, so it stays correct if --brand is ever rebranded.
const BRAND_SCALE = [
  [50, 'white', 92], [100, 'white', 80], [200, 'white', 62], [300, 'white', 42], [400, 'white', 20],
  [500, 'base', 0],
  [600, 'black', 15], [700, 'black', 30], [800, 'black', 45], [900, 'black', 60],
]

// size/lh/ls below are the REAL current --text-*-size/-lh values (read
// live from index.css), not hand-typed guesses -- this table used to
// show stale pre-tokenization numbers (34px/1.15, 13.5px, 11.5px,
// 12.5px) that no longer matched what the ds-type-* classes actually
// render, since those classes were wired to var() separately without
// this table being updated to match.
/**
 * Single typography catalog for engineering handoff.
 * Floor: 12px. Body / UI text use rem + line-height ≥ 1.5 (WCAG 1.4.12).
 * Do not invent sizes outside this list.
 */
const TYPE_ROWS = [
  { group: 'Font family', name: '--font-family-sans', size: '—', weight: '—', lh: '—', ls: '—', case: '—', sample: 'Aa Bb Cc 0123', cls: 'ds-type-body-md', use: 'Inclusive Sans — primary font' },
  { group: 'Font weight', name: '--font-weight-regular', size: '—', weight: '400', lh: '—', ls: '—', case: '—', sample: 'Regular', cls: 'ds-type-body-md', use: 'Body, placeholder, helper' },
  { group: 'Font weight', name: '--font-weight-medium', size: '—', weight: '500', lh: '—', ls: '—', case: '—', sample: 'Medium', cls: 'ds-type-caption', use: 'Captions' },
  { group: 'Font weight', name: '--font-weight-semibold', size: '—', weight: '600', lh: '—', ls: '—', case: '—', sample: 'Semibold', cls: 'ds-type-p3', use: 'Emphasized body' },
  { group: 'Font weight', name: '--font-weight-bold', size: '—', weight: '700', lh: '—', ls: '—', case: '—', sample: 'Bold', cls: 'ds-type-label', use: 'Headings, labels, buttons, links' },
  { group: 'Font weight', name: '--font-weight-extrabold', size: '—', weight: '800', lh: '—', ls: '—', case: '—', sample: 'ExtraBold', cls: 'ds-type-eyebrow', use: 'Eyebrows / strong accents' },
  { group: 'Display', name: '--text-display-xl-*', size: '48px', weight: '800', lh: '60px (1.25)', ls: '-0.8px', case: 'none', sample: '48.2%', cls: 'ds-type-display-xl', use: 'Hero titles' },
  { group: 'Display', name: '--text-display-sm-*', size: '40px', weight: '800', lh: '48px (1.2)', ls: '-0.8px', case: 'none', sample: '92', cls: 'ds-type-display-sm', use: 'Readiness / large KPI' },
  { group: 'Display', name: '--text-display-lg-*', size: '32px', weight: '700', lh: '40px (1.25)', ls: '-0.8px', case: 'none', sample: '$248,420', cls: 'ds-type-display-lg', use: 'Primary balance' },
  { group: 'Display', name: '--text-display-md-*', size: '24px', weight: '700', lh: '32px (1.33)', ls: '-0.4px', case: 'none', sample: '$12,450', cls: 'ds-type-display-md', use: 'Stat tiles' },
  { group: 'Heading', name: '--text-h1-*', size: '32px', weight: '700', lh: '40px (1.25)', ls: '-0.4px', case: 'none', sample: 'Page title', cls: 'ds-type-h1', use: 'Page title' },
  { group: 'Heading', name: '--text-h2-*', size: '24px', weight: '700', lh: '32px (1.33)', ls: '-0.3px', case: 'none', sample: 'Section heading', cls: 'ds-type-h2', use: 'Section heading' },
  { group: 'Heading', name: '--text-h3-*', size: '20px', weight: '700', lh: '28px (1.4)', ls: '-0.2px', case: 'none', sample: 'Card heading', cls: 'ds-type-h3', use: 'Card / subsection' },
  { group: 'Heading', name: '--text-h4-*', size: '16px', weight: '700', lh: '24px (1.5)', ls: '0', case: 'none', sample: 'Widget title', cls: 'ds-type-h4', use: 'Widget title' },
  { group: 'Heading', name: '--text-h5-*', size: '16px', weight: '700', lh: '24px (1.5)', ls: '0', case: 'none', sample: 'List title', cls: 'ds-type-h5', use: 'List / step title' },
  { group: 'Heading', name: '--text-h6-*', size: '14px', weight: '700', lh: '1.5', ls: '0', case: 'none', sample: 'Group label', cls: 'ds-type-h6', use: 'Smallest heading' },
  { group: 'Body', name: '--text-body-lg-*', size: '16px', weight: '400', lh: '1.5', ls: '0', case: 'none', sample: 'Lead paragraph for introductions.', cls: 'ds-type-body-lg', use: 'Lead paragraph' },
  { group: 'Body', name: '--text-body-md-*', size: '14px', weight: '400', lh: '1.5', ls: '0', case: 'none', sample: 'Default app body text.', cls: 'ds-type-body-md', use: 'Default body (also --text-body-sm-*)' },
  { group: 'Body', name: '--text-body-xs-*', size: '12px', weight: '400', lh: '1.5', ls: '0', case: 'none', sample: 'Compact body in dense lists.', cls: 'ds-type-body-xs', use: 'Compact body' },
  { group: 'Label', name: '--text-label-*', size: '14px', weight: '700', lh: '1.5', ls: '0', case: 'none', sample: 'Email address', cls: 'ds-type-label', use: 'Form labels' },
  { group: 'Label', name: '--text-eyebrow-*', size: '12px', weight: '800', lh: '1.5', ls: '0.8px', case: 'uppercase', sample: 'Plan type', cls: 'ds-type-eyebrow', use: 'Overline / tags (min size)' },
  { group: 'Caption / helper', name: '--text-caption-*', size: '12px', weight: '500', lh: '1.5', ls: '0.4px', case: 'none', sample: 'Updated 2 hours ago', cls: 'ds-type-caption', use: 'Meta, timestamps' },
  { group: 'Caption / helper', name: '--text-helper-*', size: '12px', weight: '400', lh: '1.5', ls: '0', case: 'none', sample: 'Use your work email to sign in.', cls: 'ds-type-helper', use: 'Field help (.text-helper)' },
  { group: 'Button', name: '--text-button-lg-*', size: '16px', weight: '700', lh: '1.5', ls: '0', case: 'none', sample: 'Sign in', cls: 'ds-type-button-lg', use: '.btn-lg' },
  { group: 'Button', name: '--text-button-md-*', size: '14px', weight: '700', lh: '1.5', ls: '0', case: 'none', sample: 'Continue', cls: 'ds-type-button-md', use: '.btn (default)' },
  { group: 'Button', name: '--text-button-sm-*', size: '14px', weight: '700', lh: '1.5', ls: '0', case: 'none', sample: 'Edit', cls: 'ds-type-button-sm', use: '.btn-sm' },
  { group: 'Link', name: '--text-link-*', size: '14px', weight: '700', lh: '1.5', ls: '0', case: 'none', sample: 'Forgot password?', cls: 'ds-type-link', use: '.text-link' },
  { group: 'Placeholder', name: '--text-placeholder-*', size: '14px', weight: '400', lh: '1.5', ls: '0', case: 'none', sample: 'Enter your email', cls: 'ds-type-placeholder', use: '::placeholder' },
]

/** Spacing token catalog — scale + semantic usage. */
const SPACE_SCALE = [
  { name: '--space-0', px: '0', use: 'Reset margin/padding' },
  { name: '--space-px', px: '1px', use: 'Hairline offsets' },
  { name: '--space-0-5', px: '2px', use: 'Micro gap' },
  { name: '--space-1', px: '4px', use: 'Tight inset' },
  { name: '--space-1-5', px: '6px', use: 'Label→input gap (--form-label-gap)' },
  { name: '--space-2', px: '8px', use: 'Compact padding / btn-sm y' },
  { name: '--space-2-5', px: '10px', use: 'Default btn y / input y' },
  { name: '--space-3', px: '12px', use: 'Stack gap / btn-sm x' },
  { name: '--space-3-5', px: '14px', use: 'Form field gap' },
  { name: '--space-4', px: '16px', use: 'Card-sm / form→submit / btn md x' },
  { name: '--space-4-5', px: '18px', use: 'Rare mid step' },
  { name: '--space-5', px: '20px', use: 'Default card / page gap' },
  { name: '--space-6', px: '24px', use: 'Page y / card-lg / btn-lg x' },
  { name: '--space-7', px: '28px', use: 'Large stack' },
  { name: '--space-8', px: '32px', use: 'Page x (desktop)' },
  { name: '--space-9', px: '36px', use: 'Large layout step' },
  { name: '--space-10', px: '40px', use: 'Section breathing room' },
  { name: '--space-12', px: '48px', use: 'Page bottom padding' },
  { name: '--space-14', px: '56px', use: 'Extra-large section' },
  { name: '--space-16', px: '64px', use: 'Hero / major layout' },
]

const SPACE_SEMANTIC = [
  { group: 'Margin / padding (component)', rows: [
    { name: '--btn-padding-y-sm / --btn-padding-x-sm', px: '8 × 12', use: 'Small button padding' },
    { name: '--btn-padding-y-md / --btn-padding-x-md', px: '10 × 16', use: 'Default .btn padding' },
    { name: '--btn-padding-y-lg / --btn-padding-x-lg', px: '12 × 24', use: 'Large / login CTA padding' },
    { name: '--icon-btn-size-sm / md / lg', px: '32 / 36 / 44', use: 'Icon-only button hit targets' },
    { name: '--input-padding-y / --input-padding-x', px: '10 × 12', use: 'Default .form-control padding' },
    { name: '--input-min-height / sm / lg', px: '40 / 36 / 48', use: 'Input min heights' },
    { name: '--card-padding-sm', px: '16', use: 'Compact card / section-card' },
    { name: '--card-padding', px: '20', use: 'Default panel / card' },
    { name: '--card-padding-lg', px: '24', use: 'Spacious card' },
  ]},
  { group: 'Gap', rows: [
    { name: '--btn-gap', px: '8', use: 'Icon + label inside buttons' },
    { name: '--inline-gap-sm', px: '6', use: 'Tight chip / icon rows' },
    { name: '--inline-gap', px: '8', use: 'Inline clusters' },
    { name: '--actions-gap', px: '10', use: 'Button groups / action rows' },
    { name: '--stack-gap-sm', px: '8', use: 'Tight vertical stack' },
    { name: '--stack-gap', px: '12', use: 'Related item stacks' },
    { name: '--form-label-gap', px: '6', use: 'Label → control' },
    { name: '--form-field-gap', px: '14', use: 'Between form fields' },
    { name: '--form-control-gap', px: '16', use: 'Last field → submit' },
  ]},
  { group: 'Component / section spacing', rows: [
    { name: '--section-title-mb', px: '12', use: 'Section title → content' },
    { name: '--section-gap', px: '20', use: 'Between major blocks' },
  ]},
  { group: 'Layout spacing', rows: [
    { name: '--page-padding-y / --page-padding-x', px: '24 / 32', use: 'Desktop page body' },
    { name: '--page-padding-bottom', px: '48', use: 'Page bottom clearance' },
    { name: '--page-gap', px: '20', use: 'Primary page column gap' },
    { name: '--page-padding-*-md', px: '20 / 16 / 40', use: 'Tablet page padding (y/x/bottom)' },
    { name: '--page-padding-*-sm', px: '16 / 16 / 32', use: 'Mobile page padding (y/x/bottom)' },
  ]},
]

const KEYBOARD_ROWS = [
  ['Tab / Shift+Tab', 'Move focus to next / previous interactive element', 'Global'],
  ['Enter / Space', 'Activate a button, link, or a div acting as a button (role="button")', 'Buttons, custom controls'],
  ['Arrow keys', 'Move within a composite widget (radio group, tab list, menu)', 'Radios, tabs, dropdown menus'],
  ['Escape', 'Close an open dialog, dropdown, or menu without committing', 'Dialogs, menus, legend overflow panel'],
  ['Home / End', 'Jump to first / last item in a list or menu', 'Menus, step navigator'],
]

/** WCAG 2.2 Level A + AA checklist for this portal (AA conformance = all A and AA). */
const WCAG_CHECKS = [
  // Perceivable
  ['1.1.1', 'A', 'Non-text Content', 'Images, icons, and charts expose text alternatives (alt, aria-label, or adjacent visible text). Decorative marks use empty alt or aria-hidden.'],
  ['1.2.1', 'A', 'Audio-only and Video-only (Prerecorded)', 'N/A — portal has no prerecorded audio-/video-only media.'],
  ['1.2.2', 'A', 'Captions (Prerecorded)', 'N/A — no prerecorded synchronized media.'],
  ['1.2.3', 'A', 'Audio Description or Media Alternative', 'N/A — no prerecorded video.'],
  ['1.2.4', 'AA', 'Captions (Live)', 'N/A — no live media.'],
  ['1.2.5', 'AA', 'Audio Description (Prerecorded)', 'N/A — no prerecorded video.'],
  ['1.3.1', 'A', 'Info and Relationships', 'Structure uses semantic HTML (headings, lists, tables, labels, fieldsets) so relationships are available to AT.'],
  ['1.3.2', 'A', 'Meaningful Sequence', 'DOM order matches reading order; CSS reordering does not change meaning.'],
  ['1.3.3', 'A', 'Sensory Characteristics', 'Instructions never rely on shape, color, size, or position alone (e.g. errors use text + icon).'],
  ['1.3.4', 'AA', 'Orientation', 'Layouts work in portrait and landscape; no orientation lock.'],
  ['1.3.5', 'AA', 'Identify Input Purpose', 'Auth and profile fields use autocomplete / input purpose where applicable (email, name, tel).'],
  ['1.4.1', 'A', 'Use of Color', 'Status and validation never use color alone — paired with labels, icons, or text.'],
  ['1.4.2', 'A', 'Audio Control', 'N/A — no auto-playing audio. Read-aloud is user-initiated and stoppable.'],
  ['1.4.3', 'AA', 'Contrast (Minimum)', 'Text vs background meets 4.5:1 (3:1 large text) in light and dark themes via semantic color tokens.'],
  ['1.4.4', 'AA', 'Resize Text', 'Type uses rem; UI remains usable when text is resized to 200% without loss of content.'],
  ['1.4.5', 'AA', 'Images of Text', 'UI text is real text (CSS), not images of text, except logos/brand marks.'],
  ['1.4.10', 'AA', 'Reflow', 'At 320 CSS px width, content reflows to a single column without requiring two-dimensional scrolling for reading.'],
  ['1.4.11', 'AA', 'Non-text Contrast', 'Borders, focus rings, and icon-only controls meet ≥3:1 against adjacent colors.'],
  ['1.4.12', 'AA', 'Text Spacing', 'Body/UI text uses line-height ≥1.5; layouts tolerate increased spacing without clipping or overlap.'],
  ['1.4.13', 'AA', 'Content on Hover or Focus', 'Tooltips/menus are dismissible (Esc), hoverable, and persistent until dismissed or focus moves.'],
  // Operable
  ['2.1.1', 'A', 'Keyboard', 'All interactive controls are reachable and operable via keyboard (native controls or keyboard handlers).'],
  ['2.1.2', 'A', 'No Keyboard Trap', 'Focus can always leave dialogs, menus, and custom widgets (Esc + Tab cycle with return to trigger).'],
  ['2.1.4', 'A', 'Character Key Shortcuts', 'No single-character shortcuts; voice-nav commands are multi-word and user-triggered.'],
  ['2.2.1', 'A', 'Timing Adjustable', 'No short session timeouts on critical flows; any timed UI can be extended or is not essential.'],
  ['2.2.2', 'A', 'Pause, Stop, Hide', 'Motion (e.g. CTA pulse) respects prefers-reduced-motion; auto-updating content can be paused/stopped.'],
  ['2.3.1', 'A', 'Three Flashes or Below Threshold', 'No content flashes more than three times per second.'],
  ['2.4.1', 'A', 'Bypass Blocks', 'Skip patterns via landmarks (<header>/<nav>/<main>) and section headings so AT users can jump regions.'],
  ['2.4.2', 'A', 'Page Titled', 'document title is unique and descriptive per route (brand + page purpose).'],
  ['2.4.3', 'A', 'Focus Order', 'Tab order follows visual/reading order; open dialogs trap focus intentionally then restore it.'],
  ['2.4.4', 'A', 'Link Purpose (In Context)', 'Link text (or accessible name) describes destination/action without relying on surrounding context alone when ambiguous.'],
  ['2.4.5', 'AA', 'Multiple Ways', 'Primary destinations reachable via left nav, dashboard quick links, and in-page actions.'],
  ['2.4.6', 'AA', 'Headings and Labels', 'Pages use hierarchical headings; form controls have visible associated labels.'],
  ['2.4.7', 'AA', 'Focus Visible', 'Every focusable control shows a visible :focus-visible ring; inset offset used inside scroll containers.'],
  ['2.4.11', 'AA', 'Focus Not Obscured (Minimum)', 'Focused controls are not entirely hidden by sticky header/overlays; dialogs manage stacking so focus stays visible.'],
  ['2.5.1', 'A', 'Pointer Gestures', 'No multipoint or path-based gestures required; all actions work with single-pointer activation.'],
  ['2.5.2', 'A', 'Pointer Cancellation', 'Click/tap actions complete on up-event; accidental press can be aborted by releasing outside the control.'],
  ['2.5.3', 'A', 'Label in Name', 'Accessible name of controls includes the visible label text (e.g. buttons, chips, form fields).'],
  ['2.5.4', 'A', 'Motion Actuation', 'No features require device motion; optional motion UI is not required to operate.'],
  ['2.5.7', 'AA', 'Dragging Movements', 'No essential drag-only interactions; allocation/list edits use buttons and forms as alternatives.'],
  ['2.5.8', 'AA', 'Target Size (Minimum)', 'Interactive targets are ≥24×24 CSS px (icon buttons 32–44px; preferred 44×44 where space allows).'],
  // Understandable
  ['3.1.1', 'A', 'Language of Page', 'Root lang attribute set on the document (html lang).'],
  ['3.1.2', 'AA', 'Language of Parts', 'N/A unless foreign-language snippets appear; any such snippets would set lang on the element.'],
  ['3.2.1', 'A', 'On Focus', 'Focus alone does not trigger context change (no auto-submit or navigation on focus).'],
  ['3.2.2', 'A', 'On Input', 'Changing a control does not force unexpected navigation; submits are explicit buttons.'],
  ['3.2.3', 'AA', 'Consistent Navigation', 'Primary nav order and placement stay consistent across authenticated pages.'],
  ['3.2.4', 'AA', 'Consistent Identification', 'Same components use the same labels/icons (buttons, badges, status) across the app.'],
  ['3.2.6', 'A', 'Consistent Help', 'Help/support entry points (header help, support email) stay in a consistent relative location.'],
  ['3.3.1', 'A', 'Error Identification', 'Errors use role="alert" / visible text (.form-error); not color alone.'],
  ['3.3.2', 'A', 'Labels or Instructions', 'Inputs have visible labels; helpers use .form-helper; placeholders are never the only label.'],
  ['3.3.3', 'AA', 'Error Suggestion', 'Validation messages describe how to fix the error when the suggestion is known (e.g. allocations must total 100%).'],
  ['3.3.4', 'AA', 'Error Prevention (Legal, Financial, Data)', 'Money/plan changes use review/confirm steps (dialogs, multi-step flows) before irreversible submit.'],
  ['3.3.7', 'A', 'Redundant Entry', 'Multi-step flows retain entered data; users are not asked to re-enter the same information unnecessarily.'],
  ['3.3.8', 'AA', 'Accessible Authentication (Minimum)', 'Sign-in does not require cognitive function tests; password managers / paste are not blocked.'],
  // Robust
  ['4.1.2', 'A', 'Name, Role, Value', 'Custom widgets expose name, role, and state via semantic HTML or ARIA (menus, dialogs, tabs, switches).'],
  ['4.1.3', 'AA', 'Status Messages', 'Toasts, banners, and validation updates are announced via role="status" / role="alert" without moving focus.'],
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
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div className="ds">
      <header className="ds-top">
        <div className="ds-logo">
          <img
            src={theme === 'dark' ? '/core-logo-dark.svg' : '/core-logo.svg'}
            alt="Design System"
          />
          <span className="ds-logo-title">Design System</span>
        </div>
        <div className="ds-meta">
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
          <div className="user-menu" ref={menuRef}>
            <button
              type="button"
              className={`user-chip${menuOpen ? ' open' : ''}`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <img src="https://i.pravatar.cc/72?img=12" alt="" />
              <span className="chip-text">
                <span className="chip-name">Alex Morgan</span>
              </span>
              <ChevronDown className="chev" size={14} strokeWidth={2.2} />
            </button>
            <div className={`user-dropdown${menuOpen ? ' open' : ''}`} role="menu" aria-label="Account">
              <button
                type="button"
                className="user-option"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <span className="sign-out-ico" aria-hidden="true">
                  <Settings size={16} strokeWidth={2.2} />
                </span>
                <span className="meta">
                  <span className="name">Settings</span>
                </span>
              </button>
              <button
                type="button"
                className="user-option"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <span className="meta">
                  <span className="name">Profile (demo)</span>
                </span>
              </button>
            </div>
          </div>
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

          {/* ---------------- LOGO ---------------- */}
          <section id="logo" className="ds-section">
            <h2>Logo</h2>
            <p className="ds-lede">
              Brand logos are provided as SVG for crisp rendering at any size. Each brand has light
              and dark variants that switch automatically with the theme.
            </p>
            <div className="ds-card">
              <div className="ds-type-group-title">Current brand: {BRAND.name}</div>
              <div className="ds-logo-showcase">
                <div className="ds-logo-variant light">
                  <span className="ds-logo-label">Light mode</span>
                  <div className="ds-logo-preview">
                    <img src={BRAND.logo} alt={`${BRAND.name} logo (light)`} />
                  </div>
                  <code>{BRAND.logo}</code>
                </div>
                <div className="ds-logo-variant dark">
                  <span className="ds-logo-label">Dark mode</span>
                  <div className="ds-logo-preview">
                    <img src={BRAND.logoOnDark || BRAND.logo} alt={`${BRAND.name} logo (dark)`} />
                  </div>
                  <code>{BRAND.logoOnDark || BRAND.logo}</code>
                </div>
              </div>
              <div className="ds-type-group-title">Usage</div>
              <div className="ds-panel">
                <div className="ds-panel-row">Logo appears in the header and login screens — never stretch or recolor.</div>
                <div className="ds-panel-row">Minimum clear space: 8px on all sides (--space-2).</div>
                <div className="ds-panel-row">Maximum height in header: 32px; login page: 48px.</div>
              </div>
            </div>
            <Code>{`import { BRAND } from '../config/brand.js'

<img
  src={theme === 'dark' ? (BRAND.logoOnDark || BRAND.logo) : BRAND.logo}
  alt={BRAND.name}
/>`}</Code>
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
              <b>Inclusive Sans</b> is the sole typeface — chosen for its excellent readability at
              small sizes, clear distinction between similar letterforms (I/l/1, O/0), and
              accessibility-first design. 16px root · rem tokens only. Minimum text size is <b>12px</b>.
              Body and UI text use line-height <b>1.5</b> (WCAG 1.4.12).
            </p>
            <div className="ds-card">
              <div className="ds-token-scroll">
                <table className="ds-token-table ds-type-table">
                  <thead>
                    <tr>
                      <th>Group</th>
                      <th>Sample</th>
                      <th>Token</th>
                      <th>Size</th>
                      <th>Weight</th>
                      <th>Line height</th>
                      <th>Letter spacing</th>
                      <th>Case</th>
                      <th>Usage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TYPE_ROWS.map((t) => (
                      <tr key={t.name}>
                        <td className="ds-token-use">{t.group}</td>
                        <td><span className={`ds-type-sample-inline ${t.cls}`}>{t.sample}</span></td>
                        <td><code>{t.name}</code></td>
                        <td>{t.size}</td>
                        <td>{t.weight}</td>
                        <td>{t.lh}</td>
                        <td>{t.ls}</td>
                        <td>{t.case}</td>
                        <td className="ds-token-use">{t.use}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ---------------- ICONS ---------------- */}
          <section id="icons" className="ds-section">
            <h2>Icons</h2>
            <p className="ds-lede">
              <b>Font Awesome</b> is the standard icon library. Use the <code>Icon</code> wrapper
              from <code>src/lib/icons.jsx</code> for consistent sizing. Icons inherit
              <code> currentColor</code> from the parent.
            </p>
            <div className="ds-card">
              <div className="ds-type-group-title">Common icons</div>
              <div className="ds-icon-grid">
                {[
                  [faHome, 'faHome', 'Dashboard / home navigation'],
                  [faUser, 'faUser', 'Profile, account, user-related'],
                  [faCog, 'faCog', 'Preferences, configuration'],
                  [faSearch, 'faSearch', 'Search inputs, lookups'],
                  [faBars, 'faBars', 'Mobile nav toggle, hamburger'],
                  [faTimes, 'faTimes', 'Close dialogs, dismiss alerts'],
                  [faCheck, 'faCheck', 'Success states, confirmations'],
                  [faExclamationTriangle, 'faExclamationTriangle', 'Warnings, errors'],
                  [faPlus, 'faPlus', 'Add new, create actions'],
                  [faTrash, 'faTrash', 'Delete, remove actions'],
                  [faDownload, 'faDownload', 'Export, download files'],
                  [faUpload, 'faUpload', 'Import, upload files'],
                  [faEdit, 'faEdit', 'Edit, modify content'],
                  [faSave, 'faSave', 'Save actions'],
                  [faBell, 'faBell', 'Notifications, alerts'],
                  [faEnvelope, 'faEnvelope', 'Email, messages'],
                ].map(([icon, name, usage]) => (
                  <button
                    key={name}
                    type="button"
                    className="ds-icon-item"
                    onClick={() => copyToClipboard(`<FontAwesomeIcon icon={${name}} />`)}
                    title={`Copy <FontAwesomeIcon icon={${name}} />`}
                  >
                    <FontAwesomeIcon icon={icon} size="lg" />
                    <span className="ds-icon-name">{name}</span>
                    <span className="ds-icon-use">{usage}</span>
                  </button>
                ))}
              </div>
              <div className="ds-type-group-title">Sizing guidelines</div>
              <div className="ds-demo" style={{ gap: 'var(--space-6)' }}>
                <div className="ds-icon-size-demo">
                  <FontAwesomeIcon icon={faCog} style={{ fontSize: '0.875rem' }} />
                  <span>xs (0.875rem) — inline with caption text</span>
                </div>
                <div className="ds-icon-size-demo">
                  <FontAwesomeIcon icon={faCog} style={{ fontSize: '1rem' }} />
                  <span>sm (1rem) — inline with body text</span>
                </div>
                <div className="ds-icon-size-demo">
                  <FontAwesomeIcon icon={faCog} size="lg" />
                  <span>lg (1.25rem) — default icon buttons</span>
                </div>
                <div className="ds-icon-size-demo">
                  <FontAwesomeIcon icon={faCog} size="xl" />
                  <span>xl (1.5rem) — large icon buttons</span>
                </div>
                <div className="ds-icon-size-demo">
                  <FontAwesomeIcon icon={faCog} size="2x" />
                  <span>2x (2rem) — feature icons, empty states</span>
                </div>
              </div>
            </div>
            <Code>{`import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faCog, faUser } from '@fortawesome/free-solid-svg-icons'

<FontAwesomeIcon icon={faHome} />
<FontAwesomeIcon icon={faCog} size="lg" />
<FontAwesomeIcon icon={faUser} className="text-brand" />`}</Code>
          </section>

          {/* ---------------- SPACE / RADIUS ---------------- */}
          <section id="space" className="ds-section">
            <h2>Spacing & radius</h2>
            <p className="ds-lede">
              Tailwind-aligned 4px scale plus semantic tokens for margin, padding, gap, component,
              section, and layout spacing. Prefer semantic tokens in UI chrome.
            </p>
            <div className="ds-card">
              <div className="ds-type-group-title">Base scale</div>
              <div className="ds-demo ds-demo-col">
                {[4, 8, 12, 16, 20, 24, 32, 48].map((px) => {
                  const row = SPACE_SCALE.find((s) => s.px === String(px) || s.px === `${px}px`)
                  return (
                    <div key={px} className="ds-space-row">
                      <span>{px}px{row ? ` · ${row.name}` : ''}</span>
                      <div className="ds-space-bar" style={{ width: px * 4 }} />
                    </div>
                  )
                })}
              </div>
              <div className="ds-token-scroll" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                <table className="ds-token-table">
                  <thead>
                    <tr>
                      <th>Token</th>
                      <th>Pixel value</th>
                      <th>Intended usage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SPACE_SCALE.map((s) => (
                      <tr key={s.name}>
                        <td><code>{s.name}</code></td>
                        <td>{s.px}</td>
                        <td className="ds-token-use">{s.use}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {SPACE_SEMANTIC.map((block) => (
                <div key={block.group}>
                  <div className="ds-type-group-title">{block.group}</div>
                  <div className="ds-token-scroll" style={{ padding: 'var(--space-2) var(--space-5) var(--space-4)' }}>
                    <table className="ds-token-table">
                      <thead>
                        <tr>
                          <th>Token</th>
                          <th>Pixel value</th>
                          <th>Intended usage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {block.rows.map((s) => (
                          <tr key={s.name}>
                            <td><code>{s.name}</code></td>
                            <td>{s.px}</td>
                            <td className="ds-token-use">{s.use}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              <div className="ds-panel">
                <div className="ds-panel-row"><b>Radius — </b>8px (--radius-sm) buttons/inputs, 14px (--radius-lg) cards, 999px pills.</div>
              </div>
            </div>
          </section>

          {/* ---------------- ELEVATION ---------------- */}
          <section id="elevation" className="ds-section">
            <h2>Elevation</h2>
            <p className="ds-lede">Two shadow tokens — a resting shadow and an elevated one for overlays.</p>
            <div className="ds-demo">
              <div style={{ padding: 'var(--space-4-5) var(--space-6)', borderRadius: 14, background: 'var(--panel)', boxShadow: 'var(--shadow)', border: '1px solid var(--line)' }}>--shadow (cards)</div>
              <div style={{ padding: 'var(--space-4-5) var(--space-6)', borderRadius: 14, background: 'var(--panel)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--line)' }}>--shadow-lg (dropdowns, dialogs)</div>
            </div>
          </section>

          {/* ---------------- BUTTONS ---------------- */}
          <Component
            id="buttons" title="Buttons"
            desc="Primary, secondary, ghost, and danger on one .btn base — with sm / md / lg sizes and icon-only controls. Minimum text 14px; icon targets ≥32px."
            tags={['WCAG 2.2 AA']}
            demo={<div className="ds-demo-col" style={{ display: 'flex' }}>
              <div>
                <div className="ds-demo-label">Variants</div>
                <div className="ds-demo-row">
                  <button type="button" className="btn btn-primary">Primary</button>
                  <button type="button" className="btn btn-secondary">Secondary</button>
                  <button type="button" className="btn btn-ghost">Ghost</button>
                  <button type="button" className="btn btn-danger">Danger</button>
                  <button type="button" className="btn btn-primary" disabled>Disabled</button>
                </div>
              </div>
              <div>
                <div className="ds-demo-label">Sizes</div>
                <div className="ds-demo-row" style={{ alignItems: 'center' }}>
                  <button type="button" className="btn btn-sm btn-primary">Small</button>
                  <button type="button" className="btn btn-primary">Medium (default)</button>
                  <button type="button" className="btn btn-lg btn-primary">Large</button>
                </div>
              </div>
              <div>
                <div className="ds-demo-label">Icon buttons</div>
                <div className="ds-demo-row" style={{ alignItems: 'center' }}>
                  <button type="button" className="icon-btn icon-btn-sm" aria-label="Settings small"><ChevronDown size={16} /></button>
                  <button type="button" className="icon-btn" aria-label="Settings"><ChevronDown size={18} /></button>
                  <button type="button" className="icon-btn icon-btn-lg" aria-label="Settings large"><ChevronDown size={22} /></button>
                </div>
              </div>
            </div>}
            dos={['Give every icon-only button an aria-label describing its action.']}
            donts={[]}
            code={`<button type="button" className="btn btn-primary">Save changes</button>
<button type="button" className="btn btn-sm btn-secondary">Small secondary</button>
<button type="button" className="btn btn-lg btn-primary">Large primary</button>
<button type="button" className="btn btn-ghost">Ghost</button>
<button type="button" className="btn btn-danger">Delete</button>
<button type="button" className="icon-btn icon-btn-sm" aria-label="More"><ChevronDown size={16} /></button>`}
            colors={[['Brand fill', '--brand-fill'], ['Brand dark (hover)', '--brand-dark'], ['Line', '--line'], ['Ink soft', '--ink-soft'], ['Danger', '--red']]}
            extra={
              <div className="ds-panel">
                <div style={{ padding: 'var(--space-1) var(--space-5)' }}>
                  <table className="ds-table">
                    <thead><tr><th>Name</th><th>Class</th><th>Padding / size</th><th>Font</th><th>Status</th></tr></thead>
                    <tbody>
                      <tr><td>Small</td><td><code>.btn.btn-sm</code></td><td>8×12 (--btn-padding-*-sm)</td><td>14px / 700</td><td className="ok">Used</td></tr>
                      <tr><td>Medium</td><td><code>.btn</code></td><td>10×16 (--btn-padding-*-md)</td><td>14px / 700</td><td className="ok">Used</td></tr>
                      <tr><td>Large</td><td><code>.btn.btn-lg</code></td><td>12×24 (--btn-padding-*-lg)</td><td>16px / 700</td><td className="ok">Used</td></tr>
                      <tr><td>Primary</td><td><code>.btn-primary</code></td><td>—</td><td>—</td><td className="ok">Used</td></tr>
                      <tr><td>Secondary</td><td><code>.btn-secondary</code></td><td>—</td><td>—</td><td className="ok">Used</td></tr>
                      <tr><td>Ghost</td><td><code>.btn-ghost</code></td><td>—</td><td>—</td><td className="ok">Used</td></tr>
                      <tr><td>Danger</td><td><code>.btn-danger</code></td><td>—</td><td>—</td><td className="ok">Used</td></tr>
                      <tr><td>Icon small</td><td><code>.icon-btn.icon-btn-sm</code></td><td>32×32 (--icon-btn-size-sm)</td><td>—</td><td className="ok">Used</td></tr>
                      <tr><td>Icon default</td><td><code>.icon-btn</code></td><td>36×36 (--icon-btn-size-md)</td><td>—</td><td className="ok">Used</td></tr>
                      <tr><td>Icon large</td><td><code>.icon-btn.icon-btn-lg</code></td><td>44×44 (--icon-btn-size-lg)</td><td>—</td><td className="ok">Used</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            }
          />

          {/* ---------------- FORMS ---------------- */}
          <Component
            id="forms" title="Forms & inputs"
            desc="Shared .form-field / .form-label / .form-control primitives. Default height 40px; text never below 14px on controls."
            tags={['WCAG 2.2 AA']}
            demo={<div style={{ display: 'grid', gap: 'var(--form-field-gap)', width: '100%', maxWidth: 360 }}>
              <div className="form-field">
                <label className="form-label" htmlFor="ds-nick">Account nickname</label>
                <input id="ds-nick" className="form-control" placeholder="e.g. My 401(k)" />
                <span className="form-helper">Shown on statements and transfers.</span>
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="ds-plan">Distribution plan type</label>
                <select id="ds-plan" className="form-control" defaultValue="401(k)">
                  <option>401(k)</option><option>403(b)</option><option>IRA — Traditional</option>
                </select>
              </div>
              <p className="form-error" role="alert"><AlertTriangle size={14} /> Target percentages must add up to 100%.</p>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <input className="form-control form-control-sm" style={{ maxWidth: 120 }} defaultValue="Small" aria-label="Small input" />
                <input className="form-control" style={{ maxWidth: 140 }} defaultValue="Medium" aria-label="Medium input" />
                <input className="form-control form-control-lg" style={{ maxWidth: 160 }} defaultValue="Large" aria-label="Large input" />
              </div>
            </div>}
            dos={['Associate every input with a visible <label> via htmlFor/id.']}
            donts={[]}
            code={`<div className="form-field">
  <label className="form-label" htmlFor="nick">Account nickname</label>
  <input id="nick" className="form-control" placeholder="e.g. My 401(k)" />
  <span className="form-helper">Optional helper</span>
</div>
{error && <p className="form-error" role="alert">{error}</p>}`}
            colors={[['Border', '--line'], ['Focus ring', '--brand'], ['Error text', '--red'], ['Panel bg', '--panel']]}
            extra={
              <div className="ds-panel">
                <div style={{ padding: 'var(--space-1) var(--space-5)' }}>
                  <table className="ds-table">
                    <thead><tr><th>Size</th><th>Class</th><th>Min height</th><th>Padding</th><th>Font</th><th>Status</th></tr></thead>
                    <tbody>
                      <tr><td>Small</td><td><code>.form-control-sm</code></td><td>36px</td><td>8×10</td><td>14px</td><td className="ok">Used</td></tr>
                      <tr><td>Medium</td><td><code>.form-control</code></td><td>40px</td><td>10×12</td><td>14px</td><td className="ok">Used</td></tr>
                      <tr><td>Large</td><td><code>.form-control-lg</code></td><td>48px</td><td>12×16</td><td>16px</td><td className="ok">Used</td></tr>
                      <tr><td>Label</td><td><code>.form-label</code></td><td>—</td><td>—</td><td>14px / 700</td><td className="ok">Used</td></tr>
                      <tr><td>Helper</td><td><code>.form-helper</code></td><td>—</td><td>—</td><td>12px / 400</td><td className="ok">Used</td></tr>
                      <tr><td>Error</td><td><code>.form-error</code></td><td>—</td><td>—</td><td>12px / 600</td><td className="ok">Used</td></tr>
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
            demo={<div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', fontSize: 'var(--text-body-md-size)' }}><input type="checkbox" defaultChecked /> Email statements</label>
              <label style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', fontSize: 'var(--text-body-md-size)' }}><input type="radio" name="ds-r" defaultChecked /> Direct deposit</label>
              <label style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', fontSize: 'var(--text-body-md-size)' }}><input type="radio" name="ds-r" /> Mailed check</label>
              <label className="a11y-switch" style={{ display: 'inline-flex' }}>
                <input type="checkbox" defaultChecked /><span className="a11y-switch-track"><span className="a11y-switch-thumb" /></span>
              </label>
            </div>}
            dos={[]}
            donts={[]}
            code={`<label className="a11y-switch">
  <input type="checkbox" checked={on} onChange={toggle} />
  <span className="a11y-switch-track"><span className="a11y-switch-thumb" /></span>
</label>`}
            colors={[['Checked / on', '--brand'], ['Track (off)', '--surface-3'], ['Border', '--line-strong']]}
          />

          {/* ---------------- BADGES / ALERTS ---------------- */}
          <Component
            id="feedback" title="Badges & alerts"
            desc="Status pills (.badge) and inline banners (.inline-alert) — color is always paired with a text label or icon."
            tags={['WCAG 2.2 AA']}
            demo={<>
              <span className="badge green">Active</span>
              <span className="badge amber">Pending</span>
              <span className="badge red">Action needed</span>
              <span className="badge navy">Enrolled</span>
              <div className="inline-alert"><AlertTriangle size={15} /> Your request was submitted and is pending review.</div>
            </>}
            dos={[]}
            donts={[]}
            code={`<span className="badge green">Active</span>
<div className="inline-alert">Your request was submitted.</div>`}
            colors={[['Success', '--green'], ['Success bg', '--green-bg'], ['Warning', '--amber'], ['Warning bg', '--amber-bg'], ['Danger', '--red'], ['Danger bg', '--red-bg']]}
          />

          {/* ---------------- NAV ---------------- */}
          <Component
            id="nav" title="Navigation"
            desc="Left rail (frozen, scrollable) and top bar. Focus rings are drawn inset so a scrolling nav never clips them."
            tags={['WCAG 2.2 AA', 'Keyboard']}
            demo={<div className="ds-nav-demo" style={{ display: 'flex', gap: 'var(--space-1-5)' }}>
              {['Dashboard', 'Portfolio', 'Transactions'].map((l, i) => (
                <a key={l} href="#nav" className={`ds-nav-link${i === 0 ? ' on' : ''}`} onClick={(e) => e.preventDefault()}>{l}</a>
              ))}
            </div>}
            dos={[]}
            donts={[]}
            code={`.nav a:focus-visible{outline:2px solid var(--brand);outline-offset:-2px;border-radius:8px}
/* inset offset survives a scrolling ancestor with overflow-y:auto */`}
            colors={[['Active text', '--brand'], ['Active bg', '--active-bg'], ['Hover bg', '--hover-bg'], ['Default text', '--ink-soft']]}
          />

          {/* ---------------- TABS / STEPS ---------------- */}
          <Component
            id="tabs" title="Tabs & step navigator"
            desc="Tabs for switching views in place; the step navigator drives multi-step flows (enrollment, transaction requests)."
            tags={['Keyboard']}
            demo={<div style={{ display: 'flex', gap: 'var(--space-1)', borderBottom: '1px solid var(--line)' }}>
              {['Summary', 'Activity', 'Documents'].map((t, i) => (
                <button key={t} type="button" className={`tab ${i === 0 ? 'on' : ''}`}>{t}</button>
              ))}
            </div>}
            dos={[]}
            donts={[]}
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
            demo={<div className="ds-dialog-demo" role="dialog" aria-labelledby="ds-dlg-title">
              <div className="ds-dialog-demo-head">
                <h3 id="ds-dlg-title">Confirm rollover request</h3>
                <button type="button" className="icon-btn icon-btn-sm" aria-label="Close"><X size={16} /></button>
              </div>
              <div className="ds-dialog-demo-body">This will submit your rollover request for processing.</div>
              <div className="ds-dialog-demo-actions">
                <button type="button" className="btn btn-secondary">Cancel</button>
                <button type="button" className="btn btn-primary">Confirm</button>
              </div>
            </div>}
            dos={['Trap focus inside the dialog while open; return focus to trigger on close.']}
            donts={[]}
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
            demo={<div style={{ display: 'flex', gap: 'var(--space-2-5)', alignItems: 'center', flexWrap: 'wrap' }}>
              {['Total', 'Equity', 'Bond', 'Target'].map((l, i) => (
                <span key={l} style={{ display: 'inline-flex', gap: 'var(--space-1-5)', alignItems: 'center', fontSize: 'var(--text-caption-size)', fontWeight: 'var(--font-weight-semibold)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: ['var(--brand)', 'var(--green)', 'var(--amber)', 'var(--accent)'][i] }} /> {l}
                </span>
              ))}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', border: '1px dashed var(--line-strong)', borderRadius: 999, padding: 'var(--space-1) var(--space-2-5)', fontSize: 'var(--text-caption-size)', fontWeight: 'var(--font-weight-bold)', color: 'var(--ink-soft)' }}>+6 more</span>
            </div>}
            code={`<ChartLegend items={series} onToggle={toggleSeries} maxInline={6} />`}
          />

          {/* ---------------- A11Y TOOLBAR ---------------- */}
          <Component
            id="a11y-toolbar" title="Accessibility toolbar"
            desc="Header-level menu (next to theme toggle) offering profiles, screen-reader read-aloud, voice navigation, and display adjustments — entirely on-device via the native Web Speech API, no network calls."
            tags={['WCAG 2.2 AA', 'main branch']}
            demo={<div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 'var(--space-1-5)', alignItems: 'center', fontSize: 'var(--text-caption-size)' }}><Eye size={15} /> Vision profile</div>
              <div style={{ display: 'flex', gap: 'var(--space-1-5)', alignItems: 'center', fontSize: 'var(--text-caption-size)' }}><Volume2 size={15} /> Read aloud</div>
              <div style={{ display: 'flex', gap: 'var(--space-1-5)', alignItems: 'center', fontSize: 'var(--text-caption-size)' }}><Mic size={15} /> Voice navigation</div>
              <div style={{ display: 'flex', gap: 'var(--space-1-5)', alignItems: 'center', fontSize: 'var(--text-caption-size)' }}><TypeIcon size={15} /> Bigger text</div>
            </div>}
            dos={[]}
            donts={[]}
            code={`const { speaking, speakPage, stop } = useReadAloud()
const { listening, start, stop: stopListening } = useVoiceNav(navigate)
<AccessibilityMenu />  // dropdown next to the theme toggle in Header.jsx`}
            colors={[['Panel bg', '--panel'], ['Active row', '--active-bg'], ['Switch on', '--brand']]}
          />

          {/* ---------------- WCAG CHECKLIST ---------------- */}
          <section id="wcag" className="ds-section">
            <h2>WCAG 2.2 AA checklist</h2>
            <p className="ds-lede">
              Full Level <b>A + AA</b> success criteria for WCAG 2.2 (AA conformance requires both).
              Includes 2.2 additions: 2.4.11, 2.5.7, 2.5.8, 3.2.6, 3.3.7, 3.3.8. Media criteria marked N/A where the portal has no A/V content.
            </p>
            <div className="ds-card">
              <div className="ds-token-scroll">
                <table className="ds-table">
                  <thead>
                    <tr>
                      <th>SC</th>
                      <th>Level</th>
                      <th>Criterion</th>
                      <th>How it&apos;s met</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WCAG_CHECKS.map(([sc, level, name, how]) => (
                      <tr key={sc}>
                        <td><code>{sc}</code></td>
                        <td><span className={`ds-wcag-level ${level === 'AA' ? 'aa' : 'a'}`}>{level}</span></td>
                        <td><b style={{ color: 'var(--ink)' }}>{name}</b></td>
                        <td>{how}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              <div style={{ padding: 'var(--space-1) var(--space-5)' }}>
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
                <div key={s} className="ds-swatch" style={{ padding: 'var(--space-3)', textAlign: 'center' }}>
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
                <div className="ds-panel-row"><b>Errors — </b>state what happened and what to do next.</div>
                <div className="ds-panel-row"><b>Numbers — </b>always show currency with $ and two decimals; percentages to one decimal.</div>
              </div>
            </div>
          </section>

          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 'var(--space-6)', fontSize: 'var(--text-caption-size)', color: 'var(--muted)', maxWidth: 'var(--ds-content-max)' }}>
            <MousePointerClick size={14} style={{ verticalAlign: -2, marginRight: 'var(--space-1-5)' }} />
            Generated from the live application codebase. Available at <code>/design-system</code> on every brand build.
          </div>
        </main>
      </div>
    </div>
  )
}
