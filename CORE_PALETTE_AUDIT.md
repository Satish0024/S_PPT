# CORE Color Palette — Audit & Application Checklist (journey-retirement)

Source: `Core-Color-Palette (2).scss`, copied verbatim (same variable names,
same hex values) into [`src/styles/core-color-palette.css`](src/styles/core-color-palette.css)
and imported at the top of `src/styles/index.css`. No token was renamed —
every `--theme-*` name in the app is byte-identical to the supplied file.

## How the app is wired (why this was a small, safe change)

The app already funnels virtually every color through ~25 root tokens in
`index.css` (`--brand`, `--ink`, `--line`, `--bg`, `--panel`, `--green`,
`--amber`, `--red`, etc.) — every component, badge, button, and chart reads
one of those via `var()`, and several are `color-mix()` formulas derived
from a small handful of base tokens. So "use only this palette's colors
everywhere" meant retargeting those ~25 root definitions to the new
palette, not touching hundreds of individual component rules.

## 1. Colors in use before this change (audit)

`grep -oE '#[0-9a-fA-F]{3,8}' src/styles/*.css` found ~140 raw hex values.
Of those:
- **~45** were the actual live root theme tokens (light + dark) — the ones
  in scope for this change.
- **~90** were inside code comments documenting past fixes (e.g. "Was
  #0284c7") — not live styles, left untouched.
- **14** (`--chart-5` … `--chart-11`, light + dark) are a *qualitative*
  data-visualization palette — see exception below.
- **2** (`#000` in a `mask-image`) are a CSS mask luminance channel, not a
  rendered color.
- **2** (`design-system.css`, `#dfe3ff`) style a fixed-dark "code console"
  block on the internal `/design-system` docs page, not the participant
  app.

## 2. What changed

Every one of the ~45 live root tokens (both `:root` and
`:root[data-theme="dark"]`) now resolves to a `--theme-*` variable from
`core-color-palette.css` instead of an independent hex literal:

| App token | Light source | Dark source |
|---|---|---|
| `--brand` / `--brand-fill` | `theme-brand-background-primary-default` | `theme-primitive-color-primary-300` (brand) / same default (fill) |
| `--brand-text-primary-oncolor` | `theme-brand-text-primary-oncolor` | same |
| `--ink` / `--ink-soft` / `--muted` | `theme-neutral-text-primary-default` / `-subtle` / `-subtleleast` | `theme-colors-neutral-50` / `-300` / `-400` |
| `--line` / `--line-strong` | `theme-neutral-border-primary-default` / `theme-colors-neutral-300` | `theme-colors-neutral-800` / `-700` |
| `--bg` / `--panel` / `--sidebar` | `theme-colors-neutral-50` / `-white` / `-white` | `theme-colors-neutral-950` / `-900` / `-900` |
| `--surface-2` / `--surface-3` | `theme-colors-neutral-50` / `theme-neutral-border-subtle` | `theme-colors-neutral-800` / `-700` |
| `--hover-bg` | `theme-colors-neutral-50` | `theme-colors-neutral-800` |
| `--green` / `-bg` / `-line` | `theme-semantics-success-text` / `-light-background` / `-border` | `theme-colors-success-300` / `-900` / `-700` |
| `--amber` / `-bg` / `-line` | `theme-semantics-warning-text` / `-light-background` / `-border` | `theme-colors-warning-300` / `-900` / `-700` |
| `--red` / `-bg` / `-line` | `theme-semantics-critical-text` / `-light-background` / `-border` | `theme-colors-red-300` / `-900` / `-700` |
| `--scene-sky` / `-ground` | `theme-brand-background-primary-subtle` / `theme-secondary-background-primary-light` | `theme-primitive-color-primary-800` / `-900` |
| `--text-inverse` | `theme-neutral-text-on-color` | same |
| `--rgs-base-1/2/3` (Retirement card) | `theme-colors-neutral-white` / `-white` / `-50` | `theme-primitive-color-primary-800` / `-900` / `-950` |
| `--rgs-ink` / `-soft` / `-muted` | via `--ink`/`--ink-soft`/`--muted` (unchanged) | `theme-colors-neutral-50` + `color-mix()` |
| `--rgs-success/warn/danger` (+`-bg`) | via `--green/amber/red` (unchanged) | `theme-colors-success/warning/red-300` + `color-mix()` |
| `--learn-surface-1/2` (Learning card) | `theme-colors-neutral-white` / `theme-brand-background-primary-light` | `theme-primitive-color-primary-900` / `-800` |
| `--learn-ink` / `-desc` | `theme-neutral-text-primary-default` / `-subtle` | `theme-colors-neutral-50` / `-300` |
| `--inv-surface-1/2` (Investment Style card) | `theme-colors-neutral-white` / `theme-semantics-success-light-background` | `theme-colors-success-950` / `-900` |
| `--inv-ink` / `-desc` | `theme-neutral-text-primary-default` / `-subtle` | `theme-colors-neutral-50` / `-400` |

`core-color-palette.css` itself carries an **"Applied at" comment on every
single line** naming the exact `index.css` token(s) that source from it,
or `"Not yet applied"` for palette entries the app has no current use case
for (e.g. hover/active border states nothing in the app currently needs) —
so every color in the supplied file is accounted for, not silently ignored.

## 3. Explicit exceptions (not converted — with reasons)

1. **`--chart-5` … `--chart-11`** (both themes) — an 11-slice categorical
   chart/legend palette (asset-class donut + portfolio line chart). The
   supplied file only defines 4 hue families (brand blue, secondary cyan,
   tertiary gold, plus red/success/warning/info semantics); reusing any of
   them for 7 more categories would make two asset classes render in the
   same or a near-identical color, defeating the chart's purpose. Chart 1-4
   *do* already track the theme (`var(--brand)`, `var(--green)`, etc.) and
   picked up the new palette automatically.
2. **`mask-image: radial-gradient(... #000 ...)`** — a mask luminance
   value (opacity channel), not a rendered UI color.
3. **`design-system.css`'s `#dfe3ff`** — styles a fixed dark "code
   console" block on the internal `/design-system` docs route, which is
   explicitly styled as a permanent dark terminal regardless of app theme,
   not a page real participants see.

## 4. Verification performed

- `npm run build` — clean, no errors, both before and after.
- Live browser check (`localhost:5701`), both light and dark theme:
  - Login page primary button — new CORE navy blue (`#1F4F8D`), not the
    old LendGuard cyan (`#0270a9`).
  - Dashboard (balances, plan cards, badges, Retirement Readiness scene
    card, Learning card) — correct in both themes.
  - Investment Portfolio page — asset-class performance chart lines
    (brand/green/amber/red-derived series) recolored correctly; table,
    tabs, and dropdown unaffected.
  - No new console errors in either theme.
- `grep` re-audit of every root token block post-change: zero hardcoded
  hex remains outside the three documented exceptions above.
- Token-name diff against the source file: `core-color-palette.css`'s
  variable names are byte-identical to `Core-Color-Palette (2).scss` (no
  renames), confirmed with `diff` on the sorted variable-name lists.

## 5. Known trade-off to flag

Re-theming `--brand` to the CORE palette's navy (`#1F4F8D`) changes this
branch's primary color away from LendGuard's existing cyan-blue
(`#0270a9`) everywhere brand color is used (buttons, links, active nav,
charts, badges). That's the literal result of "only these colors, used
everywhere" — flagging it explicitly since earlier work on this branch
had gone the other direction (keeping LendGuard's own brand distinct from
CORE's). If LendGuard's blue should stay as the brand color while only
the *neutral/semantic* (text, border, background, success/warning/danger)
tokens adopt the CORE palette, say so and `--brand`/`--brand-fill`/dark
`--brand` can be reverted to the old hex in one place.
