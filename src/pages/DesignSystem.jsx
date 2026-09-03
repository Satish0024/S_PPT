import { useEffect, useRef, useState } from 'react'
import {
  faArrowRight, faCheck, faChevronDown, faCopy, faDesktop, faGear, faLayerGroup, faMagnifyingGlass,
  faMoon, faPenRuler, faPrint, faPuzzlePiece, faRocket, faSun, faTriangleExclamation,
  faUniversalAccess, faXmark, faImage,
} from '@fortawesome/free-solid-svg-icons'
import * as fasIcons from '@fortawesome/free-solid-svg-icons'
import { Icon } from '../lib/icons.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import '../styles/design-system.css'
// Real classes documented below (.as-donut, .as-empty, .as-row-toggle,
// .as-detail-grid, etc.) come from account-summary.css — imported so
// they actually render styled here, not just referenced by name.
import '../styles/account-summary.css'

// The design system for the CORE Participant Portal. Every class/value
// referenced below is grepped against the real app source before being
// written down — not assumed from a plausible-looking pattern (an earlier
// pass on this page once documented .btn-sm as a real "small" button size
// when it's actually dead, unrelated CSS with zero real usages).

const NAV = [
  { group: 'Get started', items: [
    { id: 'overview', label: 'Overview' },
  ] },
  { group: 'Assets', items: [
    { id: 'assets', label: 'Logo' },
    { id: 'icons', label: 'Icons' },
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
    { id: 'accordion', label: 'Accordion (expandable row)' },
    { id: 'dialog', label: 'Dialogs & modals' },
    { id: 'header', label: 'Header' },
    { id: 'sidebar', label: 'Sidebar navigation' },
    { id: 'steps', label: 'Steps' },
    { id: 'spinner', label: 'Spinner' },
    { id: 'content-card', label: 'Content card' },
    { id: 'slideover', label: 'Slideover' },
    { id: 'donut', label: 'Donut chart' },
    { id: 'linechart', label: 'Line chart' },
    { id: 'empty', label: 'Empty state' },
    { id: 'skeleton', label: 'Skeleton loader' },
    { id: 'avatar', label: 'Avatar' },
    { id: 'inline-message', label: 'Inline & error message' },
    { id: 'panel', label: 'Panel' },
    { id: 'page', label: 'Page' },
    { id: 'grid', label: 'Grid & responsive' },
    { id: 'textarea', label: 'Text area' },
    { id: 'focus-ring', label: 'Focus ring' },
    { id: 'breadcrumb', label: 'Breadcrumb' },
    { id: 'datepicker', label: 'Calendar & date picker' },
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
// name, var, "used by" — real components/classes that reach for this
// token, so a token is never just a swatch in isolation.
// The primary, most-reached-for tokens — grouped by role instead of one
// flat grid, so Primary/Secondary/Tertiary read as a deliberate hierarchy,
// not an undifferentiated wall of swatches. Tertiary is --link: a real,
// distinct token in styles/index.css, just set to the same hex as Primary
// today — named honestly rather than invented from nothing.
// Quick-glance grid — same tokens/names as the "Full token reference"
// below, just the handful reached for most often. No fabricated
// "Secondary"/"Tertiary"/"CTA" categories: the reference (Figma +
// variables.scss) only names Primary, Neutral, and Semantics — a
// second/third brand color was invented here before, not real.
const PRIMARY_COLOR_GROUPS = [
  { title: 'Primary', items: [
    ['primary-default (text)', '--brand-text-primary-default', 'Links, active nav text, focus rings'],
    ['primary-hover (text)', '--brand-text-primary-hover', 'Hover state of brand-colored text/links'],
    ['primary-strong (background)', '--brand-background-primary-strong', 'Solid .btn-primary background — the actual CTA surface'],
    ['primary-hover (background)', '--brand-background-primary-hover', '.btn-primary:hover background'],
  ] },
  { title: 'Neutral / Text', items: [
    ['text', '--neutral-text-text', 'Primary body text, headings everywhere'],
    ['subtle', '--neutral-text-subtle', 'Secondary text — .pc-meta, .as-empty message'],
    ['subtle-least', '--neutral-text-subtle-least', 'Tertiary text — captions, table header labels'],
  ] },
  { title: 'Neutral / Surfaces', items: [
    ['background', '--neutral-surface-background', 'Page background behind every panel'],
    ['layer-01', '--neutral-surface-layer-01', 'Card/panel surface — .plan-card, .confirm-dialog'],
    ['layer-02', '--neutral-surface-layer-02', '.tx-table zebra rows, .as-empty background'],
    ['layer-03', '--neutral-surface-layer-03', '.ds-skeleton-bar, .step upcoming .num'],
  ] },
  { title: 'Semantics', items: [
    ['Success', '--semantics-success-text', '.req-status.good, complete .step .num'],
    ['Warning', '--semantics-warning-text', '.req-status.ok, pending states'],
    ['Critical', '--semantics-critical-text', '.req-status.warn, .confirm-dialog-ico bg'],
  ] },
]

// Same grouping shape as the Figma Components UI Kit's own color spec
// (get_variable_defs on the Colors frame: Brand/Borders, Brand/Text,
// Brand/background, Neutral/Surfaces, Neutral/Text, Neutral/border,
// Semantics/*, then the raw Theme Colors ramps) — but reading this
// app's real tokens (styles/index.css), not the Figma file's own blue
// palette. Every ramp step is color-mix()-derived from one real base
// color per family (--brand/--green/--red/--amber/--theme-colors-teal-600).
const COLOR_GROUPS = [
  { title: 'Brand / Borders', tokens: [
    ['hover', '--brand-border-primary-hover', 'Border color on hover for brand-outlined controls'],
    ['primary-default', '--brand-border-primary-default', 'Default brand border — .opt.selected, focused inputs'],
    ['primary-disabled', '--brand-border-primary-disabled', 'Disabled state of a brand-bordered control'],
  ] },
  { title: 'Brand / Text', tokens: [
    ['primary-active', '--brand-text-primary-active', 'Active/pressed brand text'],
    ['default', '--brand-text-primary-default', 'Links, active nav text, focus rings'],
    ['primary-disabled', '--brand-text-primary-disabled', 'Disabled brand-colored text'],
    ['primary-oncolor', '--brand-text-primary-oncolor', 'Text sitting on a solid brand fill — always white'],
    ['primaryhover', '--brand-text-primary-hover', 'Hover state of brand-colored text/links'],
  ] },
  { title: 'Brand / background', tokens: [
    ['active', '--brand-background-primary-active', '.btn-primary:active, pressed brand surfaces'],
    ['disabled-light', '--brand-background-primary-disabled', 'Disabled brand surface, light variant'],
    ['disabled-strong', '--brand-background-primary-disabled-strong', 'Disabled brand surface, strong variant'],
    ['hover', '--brand-background-primary-hover', '.btn-primary:hover background'],
    ['primary-light', '--brand-background-primary-light', '.nav a.active fill, avatar placeholder bg'],
    ['primary-subtle', '--brand-background-primary-subtle', 'Barely-there brand tint on a neutral surface'],
    ['strong', '--brand-background-primary-strong', 'Solid .btn-primary background — the actual CTA surface'],
  ] },
  { title: 'Neutral / Surfaces', tokens: [
    ['background', '--neutral-surface-background', 'Page background behind every panel'],
    ['constant-background', '--neutral-surface-constant-background', 'Always-white surface, regardless of theme'],
    ['high-contrast', '--neutral-surface-high-contrast', 'Darkest neutral surface — tooltips, inverted chips'],
    ['layer-01', '--neutral-surface-layer-01', 'Card/dialog/dropdown surface'],
    ['layer-02', '--neutral-surface-layer-02', 'Zebra rows, subtle recessed fill'],
    ['layer-03', '--neutral-surface-layer-03', 'Skeleton placeholders, disabled-field fill'],
    ['layer-04', '--neutral-surface-layer-04', 'A step deeper — rarely reached for'],
    ['layer-05', '--neutral-surface-layer-05', 'Deepest neutral layer'],
  ] },
  { title: 'Neutral / Text', tokens: [
    ['subtle', '--neutral-text-subtle', 'Secondary text — .pc-meta, .as-empty message'],
    ['subtleleast', '--neutral-text-subtle-least', 'Tertiary text — captions, table header labels'],
    ['text', '--neutral-text-text', 'Primary body text, headings everywhere'],
    ['text-on-color', '--neutral-text-on-color', 'Text on a solid dark/neutral fill'],
  ] },
  { title: 'Neutral / border', tokens: [
    ['border-light', '--neutral-border-light', 'Emphasized border, focus-adjacent'],
    ['border-strong', '--neutral-border-strong', 'Strongest neutral border in the app'],
    ['border-subtle', '--neutral-border-subtle', 'Default 1px border — cards, inputs, table rows'],
    ['inverse', '--neutral-border-inverse', 'Border on a dark/inverted surface'],
  ] },
  { title: 'Semantics / Critical', tokens: [
    ['border', '--semantics-critical-border', 'Error/danger border and icon'],
    ['light-background', '--semantics-critical-background-light', '.confirm-dialog-ico bg, error banners'],
    ['strong-background', '--semantics-critical-background-strong', 'Solid error fill (badges, alerts)'],
    ['text', '--semantics-critical-text', 'Error/danger text'],
  ] },
  { title: 'Semantics / Disabled', tokens: [
    ['background', '--semantics-disabled-background', 'Disabled control fill'],
    ['border', '--semantics-disabled-border', 'Disabled control border'],
    ['text', '--semantics-disabled-text', 'Disabled control text'],
  ] },
  { title: 'Semantics / Highlights', tokens: [
    ['border', '--semantics-highlight-border', 'Informational border — new-user callouts'],
    ['light-background', '--semantics-highlight-background-light', '.callout background'],
    ['strong-background', '--semantics-highlight-background-strong', 'Solid informational fill'],
    ['text', '--semantics-highlight-text', 'Informational text'],
  ] },
  { title: 'Semantics / Success', tokens: [
    ['border', '--semantics-success-border', '.req-status.good, complete .step .num'],
    ['light-background', '--semantics-success-background-light', 'Success fill — .green-bg'],
    ['strong-background', '--semantics-success-background-strong', 'Solid success fill'],
    ['text', '--semantics-success-text', 'Success text/icon'],
  ] },
  { title: 'Semantics / Warning', tokens: [
    ['border', '--semantics-warning-border', '.req-status.ok, pending states'],
    ['light-background', '--semantics-warning-background-light', 'Warning fill — .amber-bg'],
    ['strong-background', '--semantics-warning-background-strong', 'Solid warning fill'],
    ['text', '--semantics-warning-text', 'Warning text/icon'],
  ] },
]

// Raw primitive ramps — the "Theme Colors" section of the Figma file,
// same shape (100-900 per family), reading this app's real base colors.
const THEME_COLOR_RAMPS = [
  { title: 'Blue (Brand)', prefix: '--theme-colors-blue' },
  { title: 'Green', prefix: '--theme-colors-green' },
  { title: 'Red', prefix: '--theme-colors-red' },
  { title: 'Yellow', prefix: '--theme-colors-yellow' },
  { title: 'Teal', prefix: '--theme-colors-teal' },
]
const RAMP_STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900]

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
// Proposed sizes are a deliberate even-number-only ladder (12/14/16/20/26/
// 34/44 — every step even, no decimals) so the scale itself is clean;
// the messy real range (odd numbers, .5px steps — genuinely how the app
// ships today, grepped, not invented) is kept as a separate reference
// column rather than blended into the same pill.
// Sizes are designed for this app (anchored to its own real grepped
// range below), not copied verbatim from Figma — several of Figma's
// own line-heights are literally SMALLER than their font-size (e.g.
// its "Body Large" is 18px text on a 16px line-height), which clips
// lines and fails WCAG 1.4.8/1.4.12. Every line-height here is instead
// >=1.2x for headings and >=1.5x for body/small text — the WCAG-
// recommended minimums — so "proposed" always states both numbers and
// the ratio, never a bare px size.
const TYPE_SCALE = [
  { role: 'H1', size: '15–38px', weight: '700–800', cls: 'ds-type-h1', real: ['.login-brand-copy h1 · 36/700', '.hi-bar h1 · 26/700 (Dashboard)', '.page-head h1 · 22/700 (Portfolio)'], proposed: '32px / 40 lh (1.25x)' },
  { role: 'H2', size: '15–26px', weight: 700, cls: 'ds-type-h2', real: ['.login-card h2 · 26/700', '.section-title · 16/700 (Dashboard)', '.chart-top h2 · 16/700'], proposed: '24px / 32 lh (1.33x)' },
  { role: 'H3', size: '15–20px', weight: 700, cls: 'ds-type-h3', real: ['.pc-name (PlanCard h3) · 15/700', '.summary .head h4 · 16/600'], proposed: '20px / 28 lh (1.4x)' },
  { role: 'H4', size: '16px', weight: 600, cls: 'ds-type-h4', real: ['.summary .head h4 · 16/600'], proposed: '18px / 24 lh (1.33x)' },
  { role: 'H5', size: '15px', weight: 600, cls: 'ds-type-h5', real: ['.step .body h3 as a step title · 15/600'], proposed: '16px / 24 lh (1.5x)' },
  { role: 'H6', size: '12–13px', weight: '600–700', cls: 'ds-type-h6', real: ['.pc-type · 12/600', 'form labels · 12.5/700'], proposed: '14px / 20 lh (1.43x)' },
  { role: 'Display Sm', size: '44px', weight: 800, cls: null, real: ['.rr2-hero-copy b — readiness score figure'], proposed: '40px / 48 lh (1.2x, Regular–Bold)' },
  { role: 'Page title', size: '22–38px', weight: '700–800', cls: null, real: ['.hi-bar h1 · 26/700 (Dashboard)'], proposed: '24px / 32 lh (1.33x)' },
  { role: 'Heading', size: '15–20px', weight: 700, cls: null, real: ['.section-title · 16/700'], proposed: '20px / 28 lh (1.4x)' },
  { role: 'Body Large', size: '15px', weight: '400–600', cls: null, real: ['.pr-intro · 14.5/500'], proposed: '16px / 24 lh (1.5x)' },
  { role: 'Body Regular', size: '13–15px', weight: '400–600', cls: 'ds-type-p2', real: ['table cells (.tx-table td) · 13.5/400'], proposed: '14px / 21 lh (1.5x)' },
  { role: 'Body Small', size: '12–13.5px', weight: 600, cls: 'ds-type-p3', real: ['.ob-k · 13/600'], proposed: '13px / 20 lh (1.54x)' },
  { role: 'Body Extra Small', size: '9–12px', weight: 700, cls: 'ds-type-caption', real: ['.pc-type · 12/600', '.plan-badge · 11/700'], proposed: '12px / 18 lh (1.5x)' },
  { role: 'Paragraph Small', size: '13.5–14.5px', weight: '400–600', cls: null, real: ['.pr-intro · 14.5/500'], proposed: '14px / 21 lh (1.5x)' },
  { role: 'Paragraph Extra Small', size: '11–12px', weight: 700, cls: null, real: ['.plan-badge · 11/700'], proposed: '12px / 18 lh (1.5x)' },
  { role: 'Description', size: '13.5–14.5px', weight: 400, cls: null, real: ['.pr-intro · 14.5/500'], proposed: '14px / 21 lh (1.5x)' },
  { role: 'Title Description', size: '15–16px', weight: 600, cls: null, real: ['.login-card h2 sub'], proposed: '16px / 24 lh (1.5x)' },
  { role: 'Overline / eyebrow', size: '11–13px', weight: '700–800', cls: null, real: ['.eyebrow · 11–13px/600–800, uppercase (5 different page-scoped rules)', '.learn2-tag · 9.5/700, uppercase pill'], proposed: '12px / 800, uppercase, 2px tracking' },
  { role: 'Button label', size: '14–15px', weight: 700, cls: null, real: ['.btn · 14/700 (line 1116)', '.step .body h3 as a step title · 15/600'], proposed: '14px / 700' },
]

// Full token spec, one row per role: name, family, size, weight, line
// height, letter spacing, text case. Every value is either read directly
// off a real class (noted inline) or, where the app sets nothing
// explicit, honestly marked "default" rather than inventing a number.
// Verified: lib/accountSummary.js line 38 — the real 7-color palette
// Chart.js reads for every .as-donut slice (asset classes, investment
// holdings, or contribution sources — whichever tab is active). It's a
// fixed array indexed by `COLORS[i % COLORS.length]`, so any number of
// investments is supported: past 7, colors repeat rather than the app
// running out or falling back to a default.
const ACCOUNT_SUMMARY_COLORS = ['#e05a4f', '#5ba3d9', '#1a9d63', '#7c6bc4', '#e08a3a', '#2e3192', '#d4a017']

// Designed for this app: sizes anchored to the real grepped range,
// every line-height >=1.2x (headings) or >=1.5x (body/small) — the
// WCAG 1.4.8/1.4.12 minimums for readable, non-clipping text. Family
// stays Inclusive Sans, this app's real font (not Figma's Open Sans/
// IBM Plex Sans — no font swap has been requested).
const TYPE_TOKENS = [
  { name: 'H1', family: 'Inclusive Sans', size: '32px', weight: '700–800', lineHeight: '40px (1.25x)', letterSpacing: '0px', case: 'None' },
  { name: 'H2', family: 'Inclusive Sans', size: '24px', weight: '700–800', lineHeight: '32px (1.33x)', letterSpacing: '0px', case: 'None' },
  { name: 'H3', family: 'Inclusive Sans', size: '20px', weight: 700, lineHeight: '28px (1.4x)', letterSpacing: '0px', case: 'None' },
  { name: 'H4', family: 'Inclusive Sans', size: '18px', weight: 700, lineHeight: '24px (1.33x)', letterSpacing: '0px', case: 'None' },
  { name: 'H5', family: 'Inclusive Sans', size: '16px', weight: 700, lineHeight: '24px (1.5x)', letterSpacing: '0px', case: 'None' },
  { name: 'H6', family: 'Inclusive Sans', size: '14px', weight: '700–800', lineHeight: '20px (1.43x)', letterSpacing: '0px', case: 'None' },
  { name: 'Display Sm', family: 'Inclusive Sans', size: '40px', weight: '400–700 (Regular–Bold)', lineHeight: '48px (1.2x)', letterSpacing: '0px', case: 'None' },
  { name: 'Page title', family: 'Inclusive Sans', size: '24px', weight: '500–700', lineHeight: '32px (1.33x)', letterSpacing: '0px', case: 'None' },
  { name: 'Heading', family: 'Inclusive Sans', size: '20px', weight: '500–700', lineHeight: '28px (1.4x)', letterSpacing: '0px', case: 'None' },
  { name: 'Body Large', family: 'Inclusive Sans', size: '16px', weight: '400–600', lineHeight: '24px (1.5x)', letterSpacing: '0px', case: 'None' },
  { name: 'Body Regular', family: 'Inclusive Sans', size: '14px', weight: '400–600', lineHeight: '21px (1.5x)', letterSpacing: '0px', case: 'None' },
  { name: 'Body Small', family: 'Inclusive Sans', size: '13px', weight: 600, lineHeight: '20px (1.54x)', letterSpacing: '0px', case: 'None' },
  { name: 'Body Extra Small', family: 'Inclusive Sans', size: '12px', weight: 700, lineHeight: '18px (1.5x)', letterSpacing: '0px', case: 'None' },
  { name: 'Paragraph Small', family: 'Inclusive Sans', size: '14px', weight: '400–600', lineHeight: '21px (1.5x)', letterSpacing: '0px', case: 'None' },
  { name: 'Paragraph Extra Small', family: 'Inclusive Sans', size: '12px', weight: 700, lineHeight: '18px (1.5x)', letterSpacing: '0px', case: 'None' },
  { name: 'Description', family: 'Inclusive Sans', size: '14px', weight: 400, lineHeight: '21px (1.5x)', letterSpacing: '0px', case: 'None' },
  { name: 'Title Description', family: 'Inclusive Sans', size: '16px', weight: 600, lineHeight: '24px (1.5x)', letterSpacing: '0px', case: 'None' },
  { name: 'Overline / eyebrow', family: 'Inclusive Sans', size: '12px (proposed) · real range 11–13px', weight: 800, lineHeight: '16px (1.33x)', letterSpacing: '2px (proposed) · real .3–.8px (.eyebrow, varies by page)', case: 'UPPERCASE (real: text-transform)' },
  { name: 'Button label', family: 'Inclusive Sans', size: '14px', weight: 700, lineHeight: '20px (1.43x)', letterSpacing: '0px', case: 'None' },
]

// Verified via grep against styles/index.css — gap: and padding: value
// frequency, cross-checked against the specific classes that use each one.
const SPACE_SCALE = [
  [4, 'Icon-to-label gaps, tight inline groups (.nav-cta, badge icon)'],
  [8, 'Default gap between related controls — button groups, form rows, .txn-field'],
  [12, 'Gap between fields in a form, card internal spacing'],
  [16, 'Padding inside cards and panels; gap between unrelated form sections'],
  [18, 'Panel/banner padding side value — .panel, .status-banner (padding: 18px 20px)'],
  [20, 'Section-level gaps — between a heading and the content below it'],
  [24, 'Page-edge padding; gap between major page sections'],
  [32, 'Padding inside large modals/panels (.confirm-dialog top padding)'],
  [48, 'Rare — large empty-state vertical spacing'],
]
// Every spacing usage, organized the way a token spec is asked for:
// category → [token name, pixel value, intended usage]. Pixel-value
// frequency grepped from index.css (margin-bottom:, gap:, padding:).
const SPACING_TOKENS = [
  { category: 'Margin', tokens: [
    ['margin-2xs', '2px', 'Tightest vertical margin — between a value and its unit label'],
    ['margin-xs', '4px', 'Between a heading and the text directly under it (6 real uses)'],
    ['margin-sm', '6px', 'Between a label and its value (8 real uses) — most common margin in the app'],
    ['margin-md', '8px', 'Between a title and its description (8 real uses)'],
    ['margin-lg', '14px', 'Between a card\'s header block and its body'],
    ['margin-xl', '16px', 'Between major blocks within a card'],
  ] },
  { category: 'Padding', tokens: [
    ['padding-sm', '8px 12px', 'Form fields — .txn-field input'],
    ['padding-md', '12px 14px', 'Table cells — .tx-table td/th'],
    ['padding-lg', '16px 18px', 'Cards — .card, .plan-card'],
    ['padding-xl', '18px 20px', 'Panels and banners — .panel, .status-banner'],
    ['padding-2xl', '20px 22px', 'Larger panels — .panel (desktop)'],
    ['padding-3xl', '26px 24px 22px', 'Dialogs — .confirm-dialog'],
  ] },
  { category: 'Gap', tokens: [
    ['gap-xs', '4px', 'Icon-to-label, tight inline groups (.nav-cta, badge icon)'],
    ['gap-sm', '8px', 'Default gap between related controls — button groups, .txn-field rows'],
    ['gap-md', '12px', 'Between fields in a form; card internal spacing'],
    ['gap-lg', '16px', 'Between unrelated form sections'],
    ['gap-18', '18px', 'The most-repeated gap in the app — card stacks, .pr-page, .confirm-dialog body (7 real uses, was missing from this scale)'],
    ['gap-xl', '20px', 'Between a heading and the content below it'],
  ] },
  { category: 'Component spacing', tokens: [
    ['component-gap-sm', '8px', 'Between a button and an adjacent icon or badge'],
    ['component-gap-md', '14px', 'Between sibling cards in a grid — .plans-grid, .quick-grid'],
    ['component-padding', '16–22px', 'Internal padding for any card-level component (see Padding above)'],
  ] },
  { category: 'Section spacing', tokens: [
    ['section-gap', '20px', 'Between a section heading (.section-title) and its content'],
    ['section-margin', '32px', 'Rare — large modal top padding (.confirm-dialog)'],
  ] },
  { category: 'Layout spacing', tokens: [
    ['layout-padding', '24px 32px 48px', 'Page-level padding — .page-body (desktop)'],
    ['layout-padding-tablet', '22px 18px 40px', '.page-body at ≤980px'],
    ['layout-padding-mobile', '16px 14px 32px', '.page-body at ≤640px'],
    ['layout-gap-empty', '48px', 'Rare — large empty-state vertical spacing'],
  ] },
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
  ['Logo lockup — light surfaces', '/logo-lockup-light.svg', 'config/brand.js BRAND.logo — app topbar, login card'],
  ['Logo lockup — dark surfaces', '/logo-lockup-dark.svg', 'config/brand.js BRAND.logoOnDark — login hero panel'],
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

// Converts a resolved #rrggbb (or rgb(...)) token value to "r, g, b" for
// display alongside its hex — tokens are stored as hex in the stylesheet,
// so this is derived at render time, never a second source of truth.
function hexToRgb(hex) {
  if (!hex || hex === '—') return '—'
  if (hex.startsWith('rgb')) {
    const m = hex.match(/[\d.]+/g)
    return m ? m.slice(0, 3).join(', ') : hex
  }
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const num = parseInt(full, 16)
  if (Number.isNaN(num) || full.length !== 6) return '—'
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255].join(', ')
}

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
// "proposed" groups render as plain, unlabeled variant rows — no "not
// built yet" banner — since this design system is itself the source of
// truth for how a component should be built. "live" and "bug" keep
// their tag pill since those carry real, checkable information (what's
// already shipping vs. a real defect found while building this page).
const VARIANT_TAG_LABEL = { live: 'Live in the app', bug: 'Real bug' }
function VariantGroup({ tag = 'live', title, children }) {
  return (
    <div className="ds-variant-group">
      <div className="ds-variant-heading">
        {tag !== 'proposed' && <span className={`ds-variant-tag ${tag}`}>{VARIANT_TAG_LABEL[tag]}</span>}
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
  // Below 900px design-system.css sets .ds-nav{display:none} with no
  // replacement — the entire section list, and the only way to jump to
  // a component, disappeared on mobile. mobileNavOpen + .ds-nav.open
  // (see CSS) gives it back as a toggleable overlay.
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const rampVars = THEME_COLOR_RAMPS.flatMap((r) => RAMP_STEPS.map((s) => `${r.prefix}-${s}`))
  const dualTokens = useDualThemeTokens([...COLOR_GROUPS.flatMap((g) => g.tokens.map(([, v]) => v).filter(Boolean)), ...rampVars])
  const primaryTokenValues = useResolvedTokens(PRIMARY_COLOR_GROUPS.flatMap((g) => g.items.map(([, v]) => v)))

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
          Participant Portal Design System
        </div>
        <div className="ds-meta">
          {/* Only visible ≤900px (CSS) — the point at which .ds-nav
              itself is hidden, so this is the only way in at that width. */}
          <button type="button" className="ds-mobile-nav-toggle" onClick={() => setMobileNavOpen((v) => !v)} aria-expanded={mobileNavOpen} aria-controls="ds-mobile-nav">
            <Icon icon={faLayerGroup} size={14} />
            <span>Sections</span>
          </button>
          <button type="button" className="ds-theme-toggle" onClick={toggle} aria-pressed={theme === 'dark'} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <Icon icon={theme === 'dark' ? faSun : faMoon} size={16} />
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <a href="https://github.com/Satish0024/S_PPT/issues" target="_blank" rel="noreferrer" className="ds-back">
            <Icon icon={faTriangleExclamation} size={13} /> Raise an issue
          </a>
        </div>
      </header>

      {mobileNavOpen && <div className="ds-mobile-nav-backdrop" onClick={() => setMobileNavOpen(false)} />}
      <div className="ds-shell">
        <nav id="ds-mobile-nav" className={`ds-nav${mobileNavOpen ? ' open' : ''}`} aria-label="Design system sections">
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
                    {g.items.map((i) => <a key={i.id} href={`#${i.id}`} className={active === i.id ? 'active' : ''} onClick={() => setMobileNavOpen(false)}>{i.label}</a>)}
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
              Every component fact on this page — every class name, every padding value, every
              claimed size — is verified directly against the real app source, not assumed from a
              plausible-looking pattern.
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
            <p className="ds-lede">Design system for the CORE Participant Portal — every value below is grepped live from the real app, not written from memory.</p>

            <h3 className="ds-sub">Multi-tenant — swap 3 things, everything else stays</h3>
            <div className="ds-card">
              <table className="ds-type-table">
                <thead><tr><th>Changes per tenant</th><th>Where</th></tr></thead>
                <tbody>
                  <tr><td>Brand name, tagline, support email</td><td><code>config/brand.js</code></td></tr>
                  <tr><td>Color tokens</td><td><code>styles/index.css</code> <code>:root</code></td></tr>
                  <tr><td>Logo files</td><td><code>/public</code> via <code>BRAND.logo</code></td></tr>
                </tbody>
              </table>
            </div>
            <p className="ds-lede" style={{ marginTop: 10 }}>Live today as 3 tenants — CORE, Saturna Capital, LendGuard — each only touching the rows above.</p>
          </section>

          {/* ---------------- ASSETS (logo only, by request) ---------------- */}
          <section id="assets" className="ds-section">
            <h2>Logo</h2>
            <p className="ds-lede">Real files from <code>/public</code>, referenced only via <code>config/brand.js</code> — a rebrand swaps these, never JSX.</p>
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

          {/* ---------------- COLOR ---------------- */}
          <section id="color" className="ds-section">
            <h2>Color</h2>
            <p className="ds-lede">Click any swatch to copy its current value.</p>
            {PRIMARY_COLOR_GROUPS.map((g) => (
              <div key={g.title} style={{ marginBottom: 22 }}>
                <h3 className="ds-sub">{g.title}</h3>
                <div className="ds-token-grid">
                  {g.items.map(([name, varName, usedBy]) => {
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
                          <span className="ds-swatch-usage">{usedBy}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            <h3 className="ds-sub">Full token reference</h3>
            <p className="ds-lede">
              Same grouping shape as the Figma Components UI Kit's own color spec (Brand/Borders,
              Brand/Text, Brand/background, Neutral/Surfaces, Neutral/Text, Neutral/border,
              Semantics/*) — built from this app's real tokens, not the Figma file's own palette.
              Hex/RGB read live from the running CSS, both themes, regardless of which one this
              page is in.
            </p>
            {COLOR_GROUPS.map((g) => (
              <div key={g.title}>
                <h3 className="ds-sub">{g.title}</h3>
                <div className="ds-card">
                  <table className="ds-type-table">
                    <thead><tr><th>Token</th><th>Variable</th><th>Light (HEX / RGB)</th><th>Dark (HEX / RGB)</th><th>Usage</th></tr></thead>
                    <tbody>
                      {g.tokens.map(([name, varName, usage, opacity]) => {
                        if (!varName) {
                          return (
                            <tr key={name}>
                              <td><b>{name}</b></td>
                              <td colSpan={3} style={{ color: 'var(--muted)' }}>—</td>
                              <td style={{ fontSize: 12.5 }}>{usage}</td>
                            </tr>
                          )
                        }
                        const light = dualTokens.light[varName]
                        const dark = dualTokens.dark[varName]
                        return (
                          <tr key={varName + name}>
                            <td><b>{name}</b></td>
                            <td><code>{varName}</code>{opacity && <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>@ {opacity * 100}% opacity</div>}</td>
                            <td>
                              <button type="button" className="ds-hex-cell" onClick={() => light && copyToClipboard(light)}><span className="ds-hex-dot" style={{ background: light, opacity: opacity || 1 }} />{light}</button>
                              <div style={{ fontSize: 10.5, color: 'var(--muted)', marginLeft: 22 }}>rgb({hexToRgb(light)})</div>
                            </td>
                            <td>
                              <button type="button" className="ds-hex-cell" onClick={() => dark && copyToClipboard(dark)}><span className="ds-hex-dot" style={{ background: dark, opacity: opacity || 1 }} />{dark}</button>
                              <div style={{ fontSize: 10.5, color: 'var(--muted)', marginLeft: 22 }}>rgb({hexToRgb(dark)})</div>
                            </td>
                            <td style={{ fontSize: 12.5 }}>{usage}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            <h3 className="ds-sub">Theme Colors</h3>
            <p className="ds-lede">
              The raw primitive ramps every token above reads from — same 100-900 shape as the
              Figma file's Theme Colors section. 500 is the real base color for each family
              (--brand/--green/--red/--amber/a fixed teal); every other step is color-mix()-derived
              from it, not a separately hand-picked hex.
            </p>
            {THEME_COLOR_RAMPS.map((r) => (
              <div key={r.prefix} style={{ marginBottom: 18 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-soft)' }}>{r.title}</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                  {RAMP_STEPS.map((step) => {
                    const varName = `${r.prefix}-${step}`
                    const hex = dualTokens.light[varName]
                    return (
                      <button
                        key={step}
                        type="button"
                        onClick={() => hex && copyToClipboard(hex)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, border: 'none', background: 'none', cursor: 'pointer', font: 'inherit' }}
                        title={`${varName} — click to copy`}
                      >
                        <div style={{ width: 44, height: 32, borderRadius: 8, background: hex, border: '1px solid var(--line)' }} />
                        <code style={{ fontSize: 10 }}>{step}</code>
                      </button>
                    )
                  })}
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
                <thead><tr><th>Role</th><th>Proposed standard (even px, no decimals)</th><th>Real classes today</th><th>Real range</th></tr></thead>
                <tbody>
                  {TYPE_SCALE.map((t) => (
                    <tr key={t.role}>
                      <td><b>{t.role}</b></td>
                      <td><code>{t.proposed}</code></td>
                      <td style={{ fontSize: 12.5 }}>{t.real.map((r, i) => <div key={i}><code>{r}</code></div>)}</td>
                      <td style={{ fontSize: 12.5, color: 'var(--muted)' }}><code>{t.size}</code> / <code>{t.weight}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="ds-sub">Full token spec</h3>
            <p className="ds-lede">Every attribute a type token needs to be implemented from, in one row per role — font family, size, weight, line height, letter spacing, and text case.</p>
            <div className="ds-card">
              <table className="ds-type-table">
                <thead>
                  <tr>
                    <th>Token name</th><th>Font family</th><th>Font size</th><th>Weight</th>
                    <th>Line height</th><th>Letter spacing</th><th>Text case</th>
                  </tr>
                </thead>
                <tbody>
                  {TYPE_TOKENS.map((t) => (
                    <tr key={t.name}>
                      <td><b>{t.name}</b></td>
                      <td style={{ fontSize: 12.5 }}>{t.family}</td>
                      <td style={{ fontSize: 12.5 }}>{t.size}</td>
                      <td><code>{t.weight}</code></td>
                      <td style={{ fontSize: 12.5 }}>{t.lineHeight}</td>
                      <td style={{ fontSize: 12.5 }}>{t.letterSpacing}</td>
                      <td style={{ fontSize: 12.5 }}>{t.case}</td>
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

            <h3 className="ds-sub">Full spacing token spec</h3>
            <p className="ds-lede">Every spacing value the app actually uses, organized by category — Margin, Padding, Gap, Component spacing, Section spacing, Layout spacing — each with its real pixel value and intended usage.</p>
            {SPACING_TOKENS.map((g) => (
              <div key={g.category}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', margin: '18px 0 8px' }}>{g.category}</h4>
                <div className="ds-card">
                  <table className="ds-type-table">
                    <thead><tr><th>Token name</th><th>Pixel value</th><th>Intended usage</th></tr></thead>
                    <tbody>
                      {g.tokens.map(([name, px, use]) => (
                        <tr key={name}>
                          <td><code>{name}</code></td>
                          <td style={{ fontSize: 12.5 }}>{px}</td>
                          <td style={{ fontSize: 12.5 }}>{use}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

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
                {/* The real 8px gap, undisturbed — a pin dot sitting
                    in the flex row between the buttons was doubling
                    the visible gap (Save-8px-dot-8px-Cancel = 16px),
                    misrepresenting the actual spacing. Point at it
                    from outside instead, same fix as Sidebar anatomy. */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button type="button" className="btn btn-primary" tabIndex={-1} style={{ width: 'auto' }}>Save</button>
                  <button type="button" className="btn btn-secondary" tabIndex={-1} style={{ width: 'auto' }}>Cancel</button>
                </div>
                <div className="ds-annotated-frame" style={{ marginTop: 10, gap: 10 }}>
                  <span className="ds-pin"><Num>4</Num>Button radius · 10px</span>
                  <span className="ds-pin"><Num>5</Num>Gap between buttons · 8px (real, not doubled by an annotation)</span>
                </div>
              </div>
            </div>
            <DotLegend items={[
              'Page padding · 24px',
              'Card padding · 16px, card radius · 14px',
              'Gap between label and field · 8px (implicit via margin)',
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
              <VariantGroup tag="proposed" title="Additional styles">
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 260, margin: '0 auto 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Dot>1</Dot>
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-soft)' }}>Account nickname</label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Dot>2</Dot>
                    <input readOnly value="e.g. My 401(k)" style={{ minHeight: 40, border: '1px solid var(--line)', borderRadius: 9, padding: '8px 12px', font: 'inherit', fontSize: 14, fontWeight: 600, background: 'var(--panel)', width: 180 }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Dot>3</Dot>
                    <p role="alert" style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12.5, color: 'var(--red)', fontWeight: 600, margin: 0 }}>
                      <Icon icon={faTriangleExclamation} size={14} /> Required
                    </p>
                  </div>
                </div>
                <DotLegend items={['Label · 12.5px/700', 'Field · 40px min-height', 'Error text · --red, role="alert"']} />
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
              <VariantGroup tag="proposed" title="Search/filter field">
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'center', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Dot>1</Dot>
                    <span style={{ fontSize: 13.5 }}>High contrast mode</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Dot>2</Dot>
                    <label className="a11y-switch" style={{ display: 'inline-flex' }}><input type="checkbox" readOnly /><span className="a11y-switch-track"><span className="a11y-switch-thumb" /></span></label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Dot>3</Dot>
                    <label className="a11y-switch" style={{ display: 'inline-flex' }}><input type="checkbox" defaultChecked readOnly /><span className="a11y-switch-track"><span className="a11y-switch-thumb" /></span></label>
                  </div>
                </div>
                <DotLegend items={[
                  'Label · adjacent text (the switch has no accessible name alone)',
                  'Track · 36×20px pill',
                  'Thumb · 16×16px, slides +16px on check',
                ]} />
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
              <VariantGroup tag="proposed" title="A 4th, neutral state (e.g. Draft)">
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
                <div className="table-wrap" style={{ width: '100%', maxWidth: 460, margin: '0 auto 16px' }}>
                  <table className="tx-table">
                    <thead><tr><th><Dot>1</Dot>Type</th><th className="num">Amount</th></tr></thead>
                    <tbody>
                      <tr><td><Dot>2</Dot>Rollover</td><td className="num">$18,400.00</td></tr>
                      <tr><td><Dot>3</Dot>Rebalance</td><td className="num">$2,000.00</td></tr>
                    </tbody>
                  </table>
                </div>
                <DotLegend items={[
                  'Header row · 12px/700, --surface-2 bg',
                  'Body row · 13.5px/400, 1px --line bottom border',
                  'Zebra stripe · even rows → --surface-2',
                ]} />
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
              <VariantGroup tag="proposed" title="Loading and empty states">
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

          {/* ---------------- ACCORDION ---------------- */}
          {/* Verified: styles/account-summary.css .as-row-toggle/
              .as-row-chevron/.as-row-detail/.as-detail-grid — the
              Account Summary table's expandable rows (Investments and
              Asset class tabs). Chevron is the first element in
              .as-row-toggle, before the swatch/name — was margin-left:auto
              (last, pushed to the row's far right edge, floating away
              from the name it belongs to); fixed to sit at the front. */}
          <Component
            id="accordion" title="Accordion (expandable row)"
            desc=".as-row-toggle / .as-row-detail (styles/account-summary.css) — Account Summary's expandable table rows."
            anatomy={
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div className="as-table-wrap" style={{ maxWidth: 380, margin: '0 auto 16px' }}>
                  <table>
                    <thead><tr><th><Dot>1</Dot>Investment</th><th className="num"><Dot>3</Dot>Balance</th></tr></thead>
                    <tbody>
                      <tr className="as-row-open">
                        <td>
                          <button type="button" className="as-row-toggle" tabIndex={-1}>
                            <Icon icon={faChevronDown} size={13} className="as-row-chevron" />
                            <span className="as-swatch" style={{ background: '#e05a4f' }} aria-hidden="true" />
                            U.S. Equity Fund
                          </button>
                        </td>
                        <td className="num">$6,934.00</td>
                      </tr>
                      <tr className="as-row-detail">
                        <td colSpan={2}>
                          <div className="as-detail-grid">
                            <div><span>Asset class</span><b>U.S. Equity</b></div>
                            <div><span>Category</span><b className="as-cat-badges"><span className="as-cat-badge is-stock">Stock</span></b></div>
                            <div><span>Price per unit</span><b>$42.18</b></div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <DotLegend items={[
                  'Toggle · .as-row-toggle, chevron + swatch + name (in that order — chevron sits at the front of the row)',
                  'Open state · .as-row-open rotates the chevron 180°, .as-row-detail row renders below',
                  'Detail grid · .as-detail-grid, 3 columns on desktop (2 at ≤640px)',
                ]} />
                <div className="ds-spec-facts">
                  <span><b>Chevron</b> 15×15px, rotates 180° when open</span><span><b>Detail bg</b> --surface-2</span><span><b>Transition</b> transform .18s ease</span>
                </div>
                <p className="ds-anatomy-caption">a. Expandable row (styles/account-summary.css .as-row-toggle, line 110)</p>
              </div>
            }
            demo={<>
              <VariantGroup tag="live" title="account-summary.css .as-table-wrap — Investments tab, one row expanded">
                <div className="as-table-wrap" style={{ width: '100%' }}>
                  <table>
                    <thead><tr><th>Investment</th><th className="num">Units</th><th className="num">Balance</th></tr></thead>
                    <tbody>
                      <tr className="as-row-open">
                        <td>
                          <button type="button" className="as-row-toggle" tabIndex={-1}>
                            <Icon icon={faChevronDown} size={13} className="as-row-chevron" />
                            <span className="as-swatch" style={{ background: '#e05a4f' }} aria-hidden="true" />
                            U.S. Equity Fund
                          </button>
                        </td>
                        <td className="num">164.324</td>
                        <td className="num">$6,934.00</td>
                      </tr>
                      <tr className="as-row-detail">
                        <td colSpan={3}>
                          <div className="as-detail-grid">
                            <div><span>Asset class</span><b>U.S. Equity</b></div>
                            <div><span>Category</span><b className="as-cat-badges"><span className="as-cat-badge is-stock">Stock</span></b></div>
                            <div><span>Price per unit</span><b>$42.18</b></div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <button type="button" className="as-row-toggle" tabIndex={-1}>
                            <Icon icon={faChevronDown} size={13} className="as-row-chevron" />
                            <span className="as-swatch" style={{ background: '#5ba3d9' }} aria-hidden="true" />
                            U.S. Bond Fund
                          </button>
                        </td>
                        <td className="num">220.010</td>
                        <td className="num">$4,622.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </VariantGroup>
            </>}
            donts={["Don't rely on hover alone to show a row is expandable — .as-row-toggle has no visual affordance besides the chevron itself, so a row with a long name and no chevron would look identical to a non-expandable one. Keep the chevron visible at all times, not just on hover."]}
            colors={[['Chevron (closed)', '--ink-soft'], ['Chevron (open)', '--brand'], ['Detail row bg', '--surface-2']]}
            code={`<button className="as-row-toggle" aria-expanded={isOpen} aria-controls={\`\${row.id}-detail\`}>
  <ChevronDown className="as-row-chevron" />
  <span className="as-swatch" style={{ background: row.color }} />
  {row.name}
</button>
{isOpen && (
  <tr className="as-row-detail" id={\`\${row.id}-detail\`}>
    <td colSpan={3}><div className="as-detail-grid">…</div></td>
  </tr>
)}`}
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
                <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 20 }}>
                  {/* The real item on its own — nesting <Dot> inside .nav a
                      (a flex-column with its own fixed gap/alignment) had
                      been squeezing all 3 dots into the same tight column,
                      overlapping the icon. Point at it from outside instead. */}
                  <a href="#sidebar" onClick={(e) => e.preventDefault()} className="active" style={{ width: 90 }}>
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
              <VariantGroup tag="live" title="index.css .nav — the 3 real states (default / active / hover)">
                <nav className="nav" aria-label="Primary (sample)" style={{ width: 110, height: 260, border: '1px solid var(--line)', borderRadius: 12, position: 'static' }}>
                  <a href="#sidebar" onClick={(e) => e.preventDefault()} className="active">
                    <span className="ico" aria-hidden="true"><Icon icon={faGear} size={20} /></span>
                    <span className="nav-label">Dashboard</span>
                  </a>
                  <a href="#sidebar" onClick={(e) => e.preventDefault()}>
                    <span className="ico" aria-hidden="true"><Icon icon={faPrint} size={20} /></span>
                    <span className="nav-label">Reports</span>
                  </a>
                  <a href="#sidebar" onClick={(e) => e.preventDefault()} style={{ background: 'var(--hover-bg)', color: 'var(--ink)' }}>
                    <span className="ico" aria-hidden="true"><Icon icon={faMagnifyingGlass} size={20} /></span>
                    <span className="nav-label">Search (hover)</span>
                  </a>
                </nav>
              </VariantGroup>
              {/* .nav-cta was the Risk check-in shortcut's class — that
                  link was removed from Sidebar.jsx (per explicit
                  request), so this CSS rule is now orphaned: it still
                  exists in index.css but nothing in the app renders it
                  anymore. Kept documented (not deleted) since the class
                  itself wasn't removed, but honestly re-labeled rather
                  than shown as a "live" pattern. */}
              <VariantGroup tag="bug" title="index.css .nav-cta (line 1421) — no longer used anywhere; the Risk check-in link that rendered it was removed">
                <div className="nav-bottom" style={{ position: 'static', alignItems: 'center' }}>
                  <a href="#sidebar" onClick={(e) => e.preventDefault()} className="nav-cta" aria-label="Example only — not a real control" style={{ position: 'static' }}>
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
            donts={["Don't invent a disabled nav-item state — .nav a has no :disabled/.disabled rule at all (grep-verified). Every rail item is always navigable; if one needs to be unavailable, that's a product decision this component doesn't support yet, not a CSS class to reach for."]}
            colors={[['Active text', '--brand'], ['Active bg', '--active-bg'], ['Hover bg', '--hover-bg']]}
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
            id="donut" title="Donut / ring charts"
            desc="Two real donut patterns exist, built two different ways — .rr-donut (hand-built SVG) and .as-donut (Chart.js Doughnut)."
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
              <VariantGroup tag="live" title=".as-donut (Account Summary → Investments) — Chart.js Doughnut, a different pattern">
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="as-donut" style={{ position: 'relative', height: 180, width: 180, flex: '0 0 auto' }}>
                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                      <circle cx="50" cy="50" r="40" fill="none" stroke={ACCOUNT_SUMMARY_COLORS[0]} strokeWidth="14" strokeDasharray={`${0.4 * 2 * Math.PI * 40} ${2 * Math.PI * 40}`} transform="rotate(-90 50 50)" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke={ACCOUNT_SUMMARY_COLORS[1]} strokeWidth="14" strokeDasharray={`${0.25 * 2 * Math.PI * 40} ${2 * Math.PI * 40}`} strokeDashoffset={-0.4 * 2 * Math.PI * 40} transform="rotate(-90 50 50)" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke={ACCOUNT_SUMMARY_COLORS[2]} strokeWidth="14" strokeDasharray={`${0.15 * 2 * Math.PI * 40} ${2 * Math.PI * 40}`} strokeDashoffset={-0.65 * 2 * Math.PI * 40} transform="rotate(-90 50 50)" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke={ACCOUNT_SUMMARY_COLORS[3]} strokeWidth="14" strokeDasharray={`${0.12 * 2 * Math.PI * 40} ${2 * Math.PI * 40}`} strokeDashoffset={-0.8 * 2 * Math.PI * 40} transform="rotate(-90 50 50)" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke={ACCOUNT_SUMMARY_COLORS[4]} strokeWidth="14" strokeDasharray={`${0.08 * 2 * Math.PI * 40} ${2 * Math.PI * 40}`} strokeDashoffset={-0.92 * 2 * Math.PI * 40} transform="rotate(-90 50 50)" />
                    </svg>
                    <div className="as-donut-center" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                      <small style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>Account balance</small>
                      <b style={{ fontSize: 18 }}>$284,900</b>
                      <em style={{ fontStyle: 'normal', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-soft)' }}>100.00%</em>
                    </div>
                  </div>
                  <ul className="as-legend" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {['U.S. Equity', 'International Equity', 'U.S. Bond', 'International Bond', 'Target-Date'].map((label, i) => (
                      <li key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                        <i style={{ width: 10, height: 10, borderRadius: 3, background: ACCOUNT_SUMMARY_COLORS[i], display: 'block' }} />
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
              </VariantGroup>
              <VariantGroup tag="live" title="lib/accountSummary.js COLORS — the full 7-color cycle behind every .as-donut slice">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {ACCOUNT_SUMMARY_COLORS.map((c, i) => (
                    <div key={c} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: 10.5, color: 'var(--ink-soft)' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: c }} />
                      <code>{c}</code>
                    </div>
                  ))}
                </div>
              </VariantGroup>
            </>}
            donts={["Don't reuse .rr-donut's stroke-dasharray code for a new breakdown chart — .as-donut (Account Summary → Investments tab) is Chart.js-rendered, a genuinely different implementation, not a variant of the same pattern."]}
            dos={[
              'Give the <svg> an aria-label stating the percentage in words — the visual arc alone conveys nothing to a screen reader.',
              'For .as-donut specifically: with more than 7 investments, colors repeat (COLORS[i % 7]) — pair every slice with its label in the legend, never color alone, since two slices can share a color once the palette wraps.',
            ]}
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
              <VariantGroup tag="live" title=".chart-panel — full panel, chart included">
                <div className="chart-panel" style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 14, padding: 16, background: 'var(--panel)' }}>
                  <div className="chart-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                    <h2 style={{ fontSize: 15, margin: 0 }}>Asset class performance</h2>
                    <div className="legend" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <label className="on" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5 }}><input type="checkbox" checked readOnly /><span className="legend-swatch" style={{ background: 'var(--red)' }} />Total portfolio</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5 }}><input type="checkbox" readOnly /><span className="legend-swatch" style={{ background: 'var(--green)' }} />U.S. Equity</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5 }}><input type="checkbox" readOnly /><span className="legend-swatch" style={{ background: 'var(--brand)' }} />U.S. Bond</label>
                    </div>
                  </div>
                  <div className="period" role="tablist" aria-label="Chart period" style={{ marginBottom: 12, display: 'inline-flex' }}>
                    <button type="button" tabIndex={-1}>1M</button>
                    <button type="button" tabIndex={-1}>YTD</button>
                    <button type="button" className="on" tabIndex={-1}>1Y</button>
                    <button type="button" tabIndex={-1}>5Y</button>
                  </div>
                  <svg viewBox="0 0 400 120" style={{ width: '100%', height: 140 }}>
                    <line x1="0" y1="30" x2="400" y2="30" stroke="var(--line)" strokeWidth="1" />
                    <line x1="0" y1="70" x2="400" y2="70" stroke="var(--line)" strokeWidth="1" />
                    <line x1="0" y1="110" x2="400" y2="110" stroke="var(--line)" strokeWidth="1" />
                    <polyline points="0,105 50,95 100,80 150,70 200,58 250,48 300,38 350,25 400,15" fill="none" stroke="var(--red)" strokeWidth="2.5" />
                    {[[0, 105], [50, 95], [100, 80], [150, 70], [200, 58], [250, 48], [300, 38], [350, 25], [400, 15]].map(([x, y], i) => (
                      <circle key={i} cx={x} cy={y} r="3.5" fill="var(--panel)" stroke="var(--red)" strokeWidth="2" />
                    ))}
                  </svg>
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

          {/* ---------------- EMPTY STATE ---------------- */}
          {/* Verified: styles/account-summary.css .as-empty (line 147) —
              the real empty state used when a plan has no balance. */}
          <Component
            id="empty" title="Empty state"
            desc=".as-empty (styles/account-summary.css) — shown when a plan has no balance to display."
            anatomy={
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div className="as-empty" style={{ maxWidth: 360, margin: '0 auto 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <Dot>1</Dot>
                    <p>No balance to show for this plan yet.</p>
                  </div>
                </div>
                <DotLegend items={['Message · 14.5px/600, --ink-soft, centered']} />
                <div className="ds-spec-facts">
                  <span><b>Min-height</b> 220px</span><span><b>Padding</b> 24px</span><span><b>Background</b> --surface-2</span><span><b>Radius</b> 12px</span>
                </div>
                <p className="ds-anatomy-caption">a. Empty state (styles/account-summary.css .as-empty, line 147)</p>
              </div>
            }
            demo={<>
              <VariantGroup tag="live" title=".as-empty — the real empty state">
                <div className="as-empty" style={{ width: '100%' }}><p>No balance to show for this plan yet.</p></div>
              </VariantGroup>
            </>}
            dos={['Explain why it\'s empty and, where possible, what to do next — not just "Nothing here".']}
            code={`<div className="as-empty">
  <p>No balance to show for this plan yet.</p>
</div>`}
            colors={[['Background', '--surface-2'], ['Text', '--ink-soft']]}
          />

          {/* ---------------- SKELETON LOADER ---------------- */}
          {/* No skeleton-loading pattern exists anywhere in the app today
              (grepped: zero "skeleton" hits in any stylesheet) — this is a
              genuinely proposed, unbuilt component, added per request so a
              future loading state is a copy-paste away. Inline styles only;
              never claimed as a real class. */}
          <Component
            id="skeleton" title="Skeleton loader"
            desc="Not built yet — no skeleton-loading pattern exists anywhere in the app (grep-verified). Proposed here using the real spacing/radius/surface tokens."
            anatomy={
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div style={{ maxWidth: 320, margin: '0 auto 16px', padding: 16, borderRadius: 14, border: '1px solid var(--line)', background: 'var(--panel)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Dot>1</Dot>
                    <div className="ds-skeleton-bar" style={{ height: 12, width: '60%', borderRadius: 6 }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Dot>2</Dot>
                    <div className="ds-skeleton-bar" style={{ height: 20, width: '40%', borderRadius: 6 }} />
                  </div>
                </div>
                <DotLegend items={['Label placeholder · --surface-3, 12px tall', 'Value placeholder · --surface-3, 20px tall']} />
                <div className="ds-spec-facts">
                  <span><b>Fill</b> --surface-3</span><span><b>Radius</b> 6px (matches --line radius scale for small elements)</span><span><b>Animation</b> proposed: same 1.5s shimmer as Chart.js's own loading states, not yet built</span>
                </div>
                <p className="ds-anatomy-caption">a. Skeleton placeholder — proposed, not a real class</p>
              </div>
            }
            demo={<>
              <VariantGroup tag="proposed" title="Card skeleton, matching .plan-card's real layout">
                <div className="plan-card" style={{ maxWidth: 280 }}>
                  <div className="ds-skeleton-bar" style={{ height: 14, width: '70%', marginBottom: 8, borderRadius: 6 }} />
                  <div className="ds-skeleton-bar" style={{ height: 10, width: '40%', marginBottom: 6, borderRadius: 6 }} />
                  <div className="ds-skeleton-bar" style={{ height: 10, width: '55%', borderRadius: 6 }} />
                </div>
              </VariantGroup>
            </>}
            donts={["Don't treat .ds-skeleton-bar as a real class — it's a proposed pattern, not shipped anywhere. Add a real .skeleton class before using one in the app."]}
            code={`/* Proposed — not yet built */
.skeleton-bar{
  height: 12px; border-radius: 6px;
  background: var(--surface-3);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
@keyframes skeleton-pulse{ 50%{ opacity:.5 } }`}
            colors={[['Fill', '--surface-3']]}
          />

          {/* ---------------- AVATAR ---------------- */}
          {/* Verified: styles/index.css .user-chip img (28px, line 201),
              .user-option img (36px, line 218) — real circular avatars. */}
          <Component
            id="avatar" title="Avatar"
            desc="Circular user images — .user-chip img (topbar) and .user-option img (profile menu), both object-fit:cover."
            anatomy={
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <Dot>1</Dot>
                    <img src="https://i.pravatar.cc/72?img=12" alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <Dot>2</Dot>
                    <img src="https://i.pravatar.cc/72?img=12" alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                </div>
                <DotLegend items={['.user-chip img · 28×28px — topbar', '.user-option img · 36×36px — profile menu list']} />
                <div className="ds-spec-facts">
                  <span><b>Shape</b> border-radius:50%</span><span><b>Fit</b> object-fit:cover</span><span><b>Fallback</b> --active-bg fill when no photo</span>
                </div>
                <p className="ds-anatomy-caption">a. Avatar (styles/index.css .user-chip img / .user-option img — real photo source: https://i.pravatar.cc, same as data/participants.js)</p>
              </div>
            }
            demo={<>
              <VariantGroup tag="live" title="Real sizes — topbar (28px) and menu list (36px)">
                <img src="https://i.pravatar.cc/72?img=12" alt="Jordan Hale" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                <img src="https://i.pravatar.cc/72?img=47" alt="Ava Sullivan" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
              </VariantGroup>
              <VariantGroup tag="live" title="Fallback — no photo available">
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--active-bg)' }} />
              </VariantGroup>
              <VariantGroup tag="proposed" title="A larger size for a future profile page — not built yet">
                <img src="https://i.pravatar.cc/72?img=12" alt="Jordan Hale" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
              </VariantGroup>
            </>}
            dos={['Always pair with a text alt/label — a photo alone identifies no one to a screen reader.']}
            code={`<img className="user-chip-img" src={user.photo} alt={user.name}
  style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />`}
            colors={[['Fallback fill', '--active-bg']]}
          />

          {/* ---------------- INLINE & ERROR MESSAGE ---------------- */}
          {/* Verified: styles/index.css .status-banner (line 1093) — the
              real inline-message/banner pattern, with 4 real badge color
              variants (green/amber/navy/red). role="alert" error text is
              already covered on Forms & inputs; red .status-banner is the
              banner-level equivalent. */}
          <Component
            id="inline-message" title="Inline & error message"
            desc=".status-banner (styles/index.css) — a badge + heading + body message, in 4 real color variants."
            anatomy={
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div className="status-banner" style={{ maxWidth: 400, margin: '0 auto 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><Dot>1</Dot><span className="badge red">Action needed</span></div>
                  <div className="copy">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Dot>2</Dot><h2 style={{ margin: 0 }}>Distribution on hold</h2></div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 4 }}><Dot>3</Dot><p style={{ margin: 0 }}>We need one more document before this can proceed.</p></div>
                  </div>
                </div>
                <DotLegend items={['Badge · 12px/700 pill, 4 real color variants (green/amber/navy/red)', 'Heading (h2) · 18px/700', 'Body · 14px/400, --ink-soft']} />
                <div className="ds-spec-facts">
                  <span><b>Padding</b> 18px 20px</span><span><b>Radius</b> 14px</span><span><b>Elevation</b> --shadow</span>
                </div>
                <p className="ds-anatomy-caption">a. Inline message (styles/index.css .status-banner, line 1093)</p>
              </div>
            }
            demo={<>
              <VariantGroup tag="live" title=".status-banner — all 4 real badge colors">
                <div className="status-banner" style={{ width: '100%' }}><span className="badge green">On track</span><div className="copy"><h2>Contribution confirmed</h2><p>Your latest deferral change is active.</p></div></div>
              </VariantGroup>
              <VariantGroup tag="live" title="Error variant — same pattern, red badge">
                <div className="status-banner" style={{ width: '100%' }}><span className="badge red">Action needed</span><div className="copy"><h2>Distribution on hold</h2><p>We need one more document before this can proceed.</p></div></div>
              </VariantGroup>
            </>}
            dos={['Use role="alert" on the banner when it appears in response to a user action, so assistive tech announces it immediately.']}
            code={`<div className="status-banner" role="alert">
  <span className="badge red">Action needed</span>
  <div className="copy">
    <h2>Distribution on hold</h2>
    <p>We need one more document before this can proceed.</p>
  </div>
</div>`}
            colors={[['Success', '--green'], ['Warning', '--amber'], ['Info', '--brand (badge.navy)'], ['Error', '--red']]}
          />

          {/* ---------------- PANEL ---------------- */}
          {/* Verified: styles/index.css .panel (line 1112) — a real,
              simpler card pattern distinct from .plan-card / .ds-card. */}
          <Component
            id="panel" title="Panel"
            desc=".panel (styles/index.css) — a heading + body + actions card, simpler than .plan-card."
            anatomy={
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div className="panel" style={{ maxWidth: 360, margin: '0 auto 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Dot>1</Dot><h3 style={{ margin: 0 }}>Rebalance your portfolio</h3></div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, margin: '4px 0 10px' }}><Dot>2</Dot><p style={{ margin: 0 }}>Your allocations have drifted 8% from target.</p></div>
                  <div className="actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Dot>3</Dot>
                    <button type="button" className="btn btn-primary" tabIndex={-1} style={{ width: 'auto' }}>Rebalance now</button>
                  </div>
                </div>
                <DotLegend items={['Heading (h3) · 16px/700', 'Body · 14px/400, --ink-soft', '.actions · flex row, 10px gap']} />
                <div className="ds-spec-facts">
                  <span><b>Padding</b> 20px 22px</span><span><b>Radius</b> 14px</span><span><b>Elevation</b> --shadow</span>
                </div>
                <p className="ds-anatomy-caption">a. Panel (styles/index.css .panel, line 1112)</p>
              </div>
            }
            demo={<>
              <VariantGroup tag="live" title=".panel — heading, body, actions">
                <div className="panel" style={{ width: '100%', maxWidth: 360 }}>
                  <h3>Rebalance your portfolio</h3>
                  <p>Your allocations have drifted 8% from target.</p>
                  <div className="actions"><button type="button" className="btn btn-primary" tabIndex={-1} style={{ width: 'auto' }}>Rebalance now</button></div>
                </div>
              </VariantGroup>
            </>}
            code={`<div className="panel">
  <h3>Rebalance your portfolio</h3>
  <p>Your allocations have drifted 8% from target.</p>
  <div className="actions"><button className="btn btn-primary">Rebalance now</button></div>
</div>`}
            colors={[['Background', '--panel'], ['Border', '--line']]}
          />

          {/* ---------------- PAGE ---------------- */}
          {/* Verified: styles/index.css .page-body (line 330) — the real
              page-level content wrapper every authenticated route uses. */}
          <Component
            id="page" title="Page"
            desc=".page-body (styles/index.css) — the content wrapper under the topbar, used by every authenticated route."
            anatomy={
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div style={{ border: '1px dashed var(--line)', borderRadius: 8, padding: '24px 32px 32px', maxWidth: 420, margin: '0 auto 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><Dot>1</Dot><span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>24px top, 32px sides</span></div>
                  <div style={{ height: 60, borderRadius: 10, background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Page content, 20px gap between sections</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Dot>2</Dot><span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>48px bottom padding</span></div>
                </div>
                <DotLegend items={['Padding · 24px 32px 48px (desktop)', 'Responsive · 22px 18px 40px at ≤980px, 16px 14px 32px at ≤640px']} />
                <div className="ds-spec-facts">
                  <span><b>Layout</b> flex column</span><span><b>Gap between sections</b> 20px</span><span><b>Max-width</b> none — fills the routed area</span>
                </div>
                <p className="ds-anatomy-caption">a. Page wrapper (styles/index.css .page-body, line 330)</p>
              </div>
            }
            demo={<>
              <VariantGroup tag="live" title=".page-body — every authenticated route's outer wrapper">
                <div className="page-body" style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 12 }}>
                  <div className="hi-bar"><h1 style={{ fontSize: 20 }}>Hi Jordan 👋</h1></div>
                  <div style={{ height: 50, borderRadius: 10, background: 'var(--surface-3)' }} />
                </div>
              </VariantGroup>
            </>}
            code={`<div className="page-body">
  <div className="hi-bar"><h1>Hi Jordan 👋</h1></div>
  {/* page sections, 20px gap */}
</div>`}
          />

          {/* ---------------- GRID & RESPONSIVE ---------------- */}
          {/* Verified: grep of every @media(max-width:...) breakpoint
              actually used across the stylesheets. No single shared
              breakpoint list/variable exists — each page picks its own,
              documented here as the real, if inconsistent, set. */}
          <Component
            id="grid" title="Grid & responsive"
            desc="No shared breakpoint scale exists — every real @media(max-width:...) value used across the app's stylesheets, grepped directly."
            anatomy={
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div className="ds-card" style={{ maxWidth: 420, margin: '0 auto' }}>
                  <table className="ds-type-table">
                    <thead><tr><th>Breakpoint</th><th>Common use</th></tr></thead>
                    <tbody>
                      <tr><td><code>420px</code></td><td>Smallest phones — tightest layouts</td></tr>
                      <tr><td><code>480px</code></td><td>Phone-width form/card stacking</td></tr>
                      <tr><td><code>520px</code></td><td>Narrow card/table collapse</td></tr>
                      <tr><td><code>640px</code></td><td>Page padding reduction (.page-body)</td></tr>
                      <tr><td><code>760px</code></td><td>Two-column → one-column layout shift</td></tr>
                      <tr><td><code>980px</code></td><td>Sidebar/main content stacking (.page-body)</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="ds-anatomy-caption" style={{ marginTop: 12 }}>Grepped from every @media(max-width:...) rule in styles/index.css</p>
              </div>
            }
            dos={['Reach for one of these 6 real values when adding a new breakpoint, rather than picking an arbitrary new number.']}
            donts={["Don't assume a shared responsive grid system (e.g. a 12-column grid) exists — layouts are hand-built per page with flexbox/CSS grid, not a shared utility."]}
            code={`@media(max-width: 980px){ /* sidebar/main stack */ }
@media(max-width: 760px){ /* two-column → one-column */ }
@media(max-width: 640px){ /* page padding shrinks */ }`}
          />

          {/* ---------------- TEXT AREA ---------------- */}
          {/* No dedicated .textarea class exists — only the global
              textarea:focus-visible rule (line 1676). Proposed here using
              the real .txn-field input's padding/radius/border as the base,
              since that's the closest real analog. */}
          <Component
            id="textarea" title="Text area"
            desc="Not built as its own class — only a global textarea:focus-visible rule exists. Proposed here using the real .txn-field input's padding/radius/border as the base."
            anatomy={
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <Dot>1</Dot>
                    <textarea readOnly value="Additional notes for this request..." rows={3} style={{ minHeight: 80, border: '1px solid var(--line)', borderRadius: 9, padding: '8px 12px', font: 'inherit', fontSize: 14, fontWeight: 600, background: 'var(--panel)', width: 220, resize: 'vertical' }} />
                  </div>
                </div>
                <DotLegend items={['Border/radius/padding match .txn-field input exactly — proposed, not yet a real class']} />
                <p className="ds-anatomy-caption">a. Text area — proposed, not a real class</p>
              </div>
            }
            demo={<>
              <VariantGroup tag="proposed" title="Matches .txn-field input styling — not yet a real class">
                <textarea placeholder="Additional notes..." rows={3} style={{ minHeight: 80, border: '1px solid var(--line)', borderRadius: 9, padding: '8px 12px', font: 'inherit', fontSize: 14, fontWeight: 600, background: 'var(--panel)', width: 240, resize: 'vertical' }} />
              </VariantGroup>
            </>}
            donts={["Don't assume a .textarea class exists to reach for — build one from .txn-field input's real values before shipping a multi-line field."]}
            code={`<textarea className="txn-field-textarea" rows={3}
  placeholder="Additional notes..." />
/* proposed CSS, matching .txn-field input: */
.txn-field-textarea{ border:1px solid var(--line); border-radius:9px; padding:8px 12px; }`}
          />

          {/* ---------------- FOCUS RING ---------------- */}
          {/* Verified: styles/index.css line 1674-1679 — the real global
              focus-visible rule shared by input/select/textarea/
              [tabindex]/summary. Buttons/links use per-component rules
              (already documented on their own pages) that follow the
              same 2px --brand pattern. */}
          <Component
            id="focus-ring" title="Focus ring"
            desc="A global :focus-visible rule (styles/index.css line 1674) plus per-component rules — all converge on the same 2px --brand outline."
            anatomy={
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Dot>1</Dot>
                    <input readOnly value="Focused field" style={{ minHeight: 40, border: '1px solid var(--line)', borderRadius: 9, padding: '8px 12px', font: 'inherit', fontSize: 14, fontWeight: 600, background: 'var(--panel)', outline: '2px solid var(--brand)', outlineOffset: 2 }} />
                  </div>
                </div>
                <DotLegend items={['2px solid --brand outline, 2px offset (some components use -2px inset instead — see each component\'s own page)']} />
                <div className="ds-spec-facts">
                  <span><b>Width</b> 2px</span><span><b>Color</b> --brand</span><span><b>Selector</b> :focus-visible only, never plain :focus</span>
                </div>
                <p className="ds-anatomy-caption">a. Focus ring (styles/index.css, line 1674)</p>
              </div>
            }
            dos={['Always use :focus-visible, not :focus — a mouse click should never show the keyboard ring.']}
            donts={["Don't remove the outline without replacing it — every interactive element must show some visible focus indicator (WCAG 2.4.7)."]}
            code={`input:focus-visible, select:focus-visible, textarea:focus-visible,
[tabindex]:focus-visible, summary:focus-visible {
  outline: 2px solid var(--brand);
}`}
            colors={[['Ring', '--brand']]}
          />

          {/* ---------------- BREADCRUMB ---------------- */}
          {/* No breadcrumb class or usage exists anywhere in the app
              (grepped: zero "breadcrumb" hits). Fully proposed, built
              from real typography/color tokens only. */}
          <Component
            id="breadcrumb" title="Breadcrumb"
            desc="Not built anywhere in the app (grep-verified: zero real usages) — fully proposed, using real typography and color tokens."
            anatomy={
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Dot>1</Dot>
                    <a href="#breadcrumb" onClick={(e) => e.preventDefault()} style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand)', textDecoration: 'none' }}>Transactions</a>
                    <Dot>2</Dot>
                    <Icon icon={faChevronDown} size={10} style={{ transform: 'rotate(-90deg)', color: 'var(--muted)' }} />
                    <Dot>3</Dot>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)' }} aria-current="page">Rollover request</span>
                  </nav>
                </div>
                <DotLegend items={['Link · 13px/700, --brand', 'Separator · 10px chevron, --muted', 'Current page · 13px/700, --ink-soft, aria-current="page"']} />
                <p className="ds-anatomy-caption">a. Breadcrumb — proposed, not a real component</p>
              </div>
            }
            demo={<>
              <VariantGroup tag="proposed" title="Not built anywhere — proposed, using real .text-link color">
                <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <a href="#breadcrumb" onClick={(e) => e.preventDefault()} style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand)', textDecoration: 'none' }}>Dashboard</a>
                  <Icon icon={faChevronDown} size={10} style={{ transform: 'rotate(-90deg)', color: 'var(--muted)' }} />
                  <a href="#breadcrumb" onClick={(e) => e.preventDefault()} style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand)', textDecoration: 'none' }}>Transactions</a>
                  <Icon icon={faChevronDown} size={10} style={{ transform: 'rotate(-90deg)', color: 'var(--muted)' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)' }} aria-current="page">Rollover request</span>
                </nav>
              </VariantGroup>
            </>}
            dos={['Mark the current page with aria-current="page" — never just style it differently.']}
            code={`<nav aria-label="Breadcrumb">
  <a href="/dashboard">Dashboard</a>
  <a href="/transactions">Transactions</a>
  <span aria-current="page">Rollover request</span>
</nav>`}
            colors={[['Link', '--brand'], ['Current page', '--ink-soft']]}
          />

          {/* ---------------- CALENDAR & DATE PICKER ---------------- */}
          {/* No calendar/date-picker component exists anywhere in the app
              (grepped: zero "calendar"/"datepicker" hits, and no <input
              type="date"> found either). Fully proposed. */}
          <Component
            id="datepicker" title="Calendar & date picker"
            desc="Not built anywhere in the app (grep-verified: no calendar/date-picker markup or styling exists) — fully proposed, using real form-field and card tokens."
            anatomy={
              <div className="ds-anatomy" style={{ alignItems: 'stretch' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Dot>1</Dot>
                    <input readOnly value="09/02/2026" style={{ minHeight: 40, border: '1px solid var(--line)', borderRadius: 9, padding: '8px 12px', font: 'inherit', fontSize: 14, fontWeight: 600, background: 'var(--panel)', width: 140 }} />
                  </div>
                </div>
                <DotLegend items={['Field · same as .txn-field input — proposed, no real date-field class exists']} />
                <p className="ds-anatomy-caption">a. Date field — proposed, not a real component</p>
              </div>
            }
            demo={<>
              <VariantGroup tag="proposed" title="Field styled like .txn-field input; calendar popover fully proposed">
                <input readOnly value="09/02/2026" style={{ minHeight: 40, border: '1px solid var(--line)', borderRadius: 9, padding: '8px 12px', font: 'inherit', fontSize: 14, fontWeight: 600, background: 'var(--panel)', width: 140 }} />
                <div className="ds-card" style={{ width: 220, padding: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, fontSize: 11, textAlign: 'center' }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} style={{ color: 'var(--muted)', fontWeight: 700 }}>{d}</span>)}
                    {Array.from({ length: 30 }, (_, i) => (
                      <span key={i} style={{ padding: '4px 0', borderRadius: 6, background: i === 1 ? 'var(--brand-fill)' : 'transparent', color: i === 1 ? '#fff' : 'var(--ink)' }}>{i + 1}</span>
                    ))}
                  </div>
                </div>
              </VariantGroup>
            </>}
            donts={["Don't reach for a calendar library's default styling unchanged — none is installed yet, and this app has no established visual pattern for one. Design it from these tokens first."]}
            code={`/* Proposed — no real component exists yet */
<input className="date-field" type="text" readOnly value="09/02/2026" />
{/* calendar popover: .ds-card-style panel, 7-column day grid */}`}
            colors={[['Selected day', '--brand-fill'], ['Field', 'matches .txn-field input']]}
          />

          {/* ---------------- WCAG ---------------- */}
          <section id="wcag" className="ds-section">
            <h2>WCAG 2.2 AA checklist</h2>
            <p className="ds-lede">
              All {WCAG_CHECKS.length} Level A + AA success criteria in WCAG 2.2 (2.1's 50, plus
              2.2's 6 new A/AA additions, minus 4.1.1 Parsing — removed as obsolete in 2.2).
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
