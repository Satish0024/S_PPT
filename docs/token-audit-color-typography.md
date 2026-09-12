# Color & typography token audit

Sources (local Downloads, analyzed as-is):

- `Core-Color-Palette.scss` — CORE primitive ramps + light/dark semantic tokens + `--theme-*` aliases
- `typography.json` — `$schema: "Typography tokens -- design-system branch"`

App audited: this repo on the current branch. Color primitives/semantics are imported via `src/styles/core-color-palette.css` (from **Core-Color-Palette 2.scss**, not the unprefixed names in the attached v1 file). Product CSS mostly reads **app aliases** in `src/styles/index.css` (`--brand`, `--ink`, `--text-h1-size`, …).

**Usage** = `var(--token)` / `'--token'` outside the defining `:root` line. **Product** excludes `design-system.css` + `DesignSystem.jsx`. **Via alias** = a product-used app token whose value is `var(--that-source-token)`.

---

## How the two files name things vs the app

| Layer | Attached source | What the app actually calls |
|---|---|---|
| Primitive ramp | `--theme-primitive-color-primary-500` | Almost never referenced. Hex is applied through a semantic token. |
| Semantic (unprefixed) | `--brand-text-primary-default`, `--neutral-text-default` | **Not used** except `--brand-text-primary-oncolor` |
| Semantic (`--theme-*` alias) | `--theme-brand-text-primary-default` | Used in `index.css` mappings + a few product rules (`documents.css`) |
| App role alias | — | `--brand`, `--ink`, `--panel`, `--green` (what 95% of UI reads) |
| Type style | `headings.h2` / `body.md` in JSON | `--text-h2-size` / `--text-body-md-size` |
| Type scale | `fontSize.sm` = 14px | `--text-sm-size` **and** `--text-body-md-size` **and** `--text-body-sm-size` |

Exact same color name in source and product UI: **`--brand-text-primary-oncolor`** only.

---

## 1. Color — mapped comparison (source → app)

Status: **Used** = product `var()` or used via a product alias. **Never** = in the attached SCSS, no product/docs use. **Name different** = same role, different identifier.

### Brand

| Source token (attached SCSS) | Light hex | App token in use | Product uses | Status | Name |
|---|---|---|---|---|---|
| `--brand-text-primary-oncolor` | `#FFFFFF` | `--brand-text-primary-oncolor` | 40 | Used | **Same** |
| `--theme-brand-text-primary-oncolor` | `#FFFFFF` | same + `--brand-text-primary-oncolor` | 1 + 40 via | Used | Prefix added |
| `--brand-text-primary-default` | `#1F4F8D` | — | 0 | Never (unprefixed) | — |
| `--theme-brand-text-primary-default` | `#1F4F8D` | `--brand` / `--link` | 1 + 299 via | Used | **Different** (`--brand`) |
| `--brand-text-primary-hover` / `--theme-brand-text-primary-hover` | `#1B4479` | `--brand-dark` (mix, not this hex) | 0 | Never as named token | **Different** |
| `--brand-text-primary-active` / `--theme-…-active` | `#17365E` | — | 0 | **Never** | — |
| `--brand-text-primary-disabled` / `--theme-…-disabled` | `#86ADDF` | — | 0 | **Never** | — |
| `--brand-background-strong` | `#1F4F8D` | — | 0 | Never (unprefixed) | — |
| `--theme-brand-background-strong` | `#1F4F8D` | `--brand-fill` | 1 + 27 via | Used | **Different** (`--brand-fill`) |
| `--theme-brand-background-hover` | `#1B4479` | used in `documents.css` search btn | 1 | Used (1 page) | Prefix only |
| `--theme-brand-background-active` | `#17365E` | `documents.css` | 2 | Used (1 page) | Prefix only |
| `--theme-brand-background-primary-light` | `#F5F7FA` | `--learn-surface-2` | 1 + 1 via | Used | **Different** |
| `--theme-brand-background-primary-subtle` | `#E2E9F3` | `--scene-sky` | 1 + 3 via | Used | **Different** |
| `--theme-brand-background-disabled-light` | `#EEEEF2` | — | 0 | **Never** | — |
| `--theme-brand-background-disabled-strong` | `#BACEE9` | `documents.css` | 1 | Used (1 page) | Prefix only |
| `--brand-borders-primary-default` | `#1F4F8D` | — | 0 | Never (unprefixed) | — |
| `--theme-brand-borders-primary-default` | `#1F4F8D` | `documents.css` | 1 | Used (1 page) | Prefix only |
| `--theme-brand-borders-hover` / `-disabled` | `#1B4479` / `#BACEE9` | `documents.css` | 1 each | Used (1 page) | Prefix only |
| `--brand-text-primaryhover` (typo alias in source) | `#1B4479` | — | 0 | **Never** | Source-only typo |

### Neutral

| Source token | Light hex | App token | Product uses | Status | Name |
|---|---|---|---|---|---|
| `--neutral-text-default` | `#1D1C24` | — | 0 | Never (unprefixed) | — |
| `--theme-neutral-text-primary-default` / `--theme-neutral-text` | `#1D1C24` | `--ink` | via 174 | Used | **Different** (`--ink`) |
| `--neutral-text-subtle` | `#5C5C6B` | — | 0 | Never (unprefixed) | — |
| `--theme-neutral-text-subtle` | `#5C5C6B` | `--ink-soft` | via 200 | Used | **Different** (`--ink-soft`) |
| `--neutral-text-subtle-light` | `#787887` | — | 0 | Never (unprefixed) | — |
| `--theme-neutral-text-subtle-least` / `--theme-neutral-text-subtleleast` | `#787887` | `--muted` (dark only; light `--muted` is `--theme-colors-neutral-600`) | via | Partial | **Different** (three names for one role) |
| `--neutral-text-on-color` | `#FFFFFF` | `--text-inverse` (unused) | 0 | Alias unused | **Different** |
| `--theme-neutral-text-on-color` / `-oncolor` | `#FFFFFF` | `--text-inverse` | 0 product | **Never** in product | Duplicate aliases |
| `--neutral-border-light` | `#DFDFE6` | — | 0 | Never (unprefixed) | — |
| `--theme-neutral-border-primary-default` / `--theme-neutral-border-light` | `#DFDFE6` | `--line` | via 215 | Used | **Different** (`--line`) |
| `--neutral-border-subtle` | `#EEEEF2` | `--surface-3` via `--theme-neutral-border-subtle` | via 19 | Used | **Different** |
| `--neutral-border-strong` | `#9E9EAD` | `--line-strong` | via 32 | Used | **Different** |
| `--neutral-border-inverse` / `--theme-neutral-border-inverse` | `#FFFFFF` | — | 0 | **Never** | — |
| `--theme-colors-neutral-white` | `#FFFFFF` | `--panel`, `--sidebar` | 6 + 163 via | Used | **Different** |
| `--theme-colors-neutral-50` | `#F7F7F9` | `--bg`, `--hover-bg`, `--surface-2` | 7 + 100 via | Used | **Different** |
| `--theme-colors-neutral-600` | `#5C5C6B` | `--muted` (light) | 1 + 101 via | Used | **Different** |
| `--theme-colors-neutral-800/900/950` | dark greys | dark `--line` / `--panel` / `--bg` | yes (dark block) | Used | **Different** |
| `--theme-colors-neutral-grey-black`, `-0`, `-1000` | `#000` / `#FFF` | — | 0 | **Never** | — |

### Semantics (success / warning / critical / highlight / disabled)

| Source token | Light hex | App token | Product uses | Status | Name |
|---|---|---|---|---|---|
| `--semantics-success-text` | `#116840` | — | 0 | Never (unprefixed) | — |
| `--theme-semantics-success-text` | `#116840` | `--green` | 1 + 78 via | Used | **Different** (`--green`) |
| `--theme-semantics-success-light-background` | `#EDFAF2` | `--green-bg` | 2 + 26 via | Used | **Different** |
| `--theme-semantics-success-background-light` | same hex | — | 0 | **Never** (duplicate name) | Source ships both `*-light-background` and `*-background-light` |
| `--theme-semantics-success-border` | `#A8E7C6` | `--green-line` | 1 + 9 via | Used | **Different** |
| `--theme-semantics-success-strong-background` / `-background-strong` | `#22A369` | — | 0 | **Never** | — |
| `--theme-semantics-warning-text` | `#95590A` | `--amber` | 1 + 58 via | Used | **Different** (`--amber`) |
| `--theme-semantics-warning-light-background` | `#FFF8EA` | `--amber-bg` | 1 + 20 via | Used | **Different** |
| `--theme-semantics-warning-border` | `#FCDB94` | `--amber-line` | 1 + 5 via | Used | **Different** |
| `--theme-semantics-warning-strong-background` | `#E89A1C` | — | 0 | **Never** | — |
| `--theme-semantics-critical-text` | `#8F212A` | `--red` | 1 + 52 via | Used | **Different** (`--red`) |
| `--theme-semantics-critical-light-background` | `#FDEFEF` | `--red-bg` | 1 + 21 via | Used | **Different** |
| `--theme-semantics-critical-border` | `#F4B1B1` | `--red-line` | 1 + 3 via | Used | **Different** |
| `--theme-semantics-critical-strong-background` | `#D8434A` | — | 0 | **Never** | — |
| `--semantics-highlight-*` / `--theme-semantics-highlight-*` (all 8) | info blue | — | 0 | **Never** | App `--info` is a `color-mix` of `--brand`, not this ramp |
| `--semantics-disabled-*` / `--theme-semantics-disabled-*` | broken + `#EEEEF2` | — | 0 | **Never** | Source `--semantics-disabled-background/border` point at **undefined** `--theme-colors-neutral-lightgrey-50/700` |

### Secondary & tertiary (entire groups)

Every unprefixed `--secondary-*` / `--tertiary-*` token: **never used**.

| Source `--theme-*` | Light hex | In app? |
|---|---|---|
| `--theme-secondary-background-primary-light` | `#F4F9FB` | Used once (`--scene-ground`) |
| All other `--theme-secondary-*` (13 tokens) | cyan ramp | **Never** |
| All `--theme-tertiary-*` (14 tokens) | gold ramp | **Never** (warning uses the semantics tokens, not tertiary) |

---

## 2. Color — primitive ramps never used

Attached SCSS defines 92 `--theme-primitive-*` / `--theme-colors-*` steps. **75 are never referenced** in product (not even via an app alias). The app is supposed to go through semantics; comments in `core-color-palette.css` already mark most as “Not yet applied”.

Never-used primitive families (all steps unused unless noted):

| Family | Steps | Any product use? |
|---|---|---|
| `--theme-primitive-color-primary-50` … `700` | 50–700 | No (800/900/950 used in dark widget CSS only) |
| `--theme-primitive-color-secondary-50` … `950` | all 11 | **Never** |
| `--theme-primitive-color-tertiary-50` … `950` | all 11 | **Never** |
| `--theme-colors-success-50` … `800` except 300/900/950 | most | 300/900/950 used in dark overrides only |
| `--theme-colors-red-50` … `950` except 300 | most | 300 used in dark only |
| `--theme-colors-info-50` … `950` | all 11 | **Never** |
| `--theme-colors-warning-*` except 300 | most | 300 used in dark only |
| `--theme-colors-neutral-grey-black`, `0`, `100`, `200`, `1000` | extras | **Never** |

---

## 3. Color — what the app actually paints with

These are the tokens product CSS/JSX calls. Most are **aliases**, not CORE names.

| App token | Wired to (light) | Product uses | Role |
|---|---|---|---|
| `--brand` | `--theme-brand-text-primary-default` `#1F4F8D` | ~295 | Text, focus, links, charts |
| `--line` | `--theme-neutral-border-primary-default` `#DFDFE6` | ~215 | Borders |
| `--ink-soft` | `--theme-neutral-text-subtle` `#5C5C6B` | ~200 | Secondary text |
| `--ink` | `--theme-neutral-text-primary-default` `#1D1C24` | ~174 | Primary text |
| `--panel` | `--theme-colors-neutral-white` | ~151 | Cards |
| `--muted` | `--theme-colors-neutral-600` `#5C5C6B` | ~96 | Tertiary text (same hex as `--ink-soft` in light) |
| `--green` | `--theme-semantics-success-text` | ~76 | Success |
| `--active-bg` | `color-mix(--brand 12%, white)` | ~74 | **Not a CORE token** — generated |
| `--surface-2` | `--theme-colors-neutral-50` | ~73 | Recessed surface |
| `--amber` / `--red` | warning / critical text | ~58 / ~52 | Status |
| `--brand-text-primary-oncolor` | `#FFFFFF` | 40 | On-brand text |
| `--brand-fill` | `--theme-brand-background-strong` | ~26 | Solid buttons |
| `--brand-dark` | `color-mix(--brand, black/white)` | ~27 | **Not a CORE token** — generated hover |
| `--green-bg` / `--amber-bg` / `--red-bg` | `*-light-background` | 24 / 20 / 21 | Status fills |

App aliases defined but **never used in product**: `--brand-soft`, `--accent-primary`, `--accent-secondary`, `--success`, `--warning`, `--danger`, `--text-primary`, `--text-secondary`, `--text-muted`, `--text-inverse`, `--surface-page`, `--surface-card`, `--surface-glass`, `--border-subtle`, `--border-glass`.

---

## 4. Color — name-diff cheat sheet

| If the source file says… | Use this in the app… |
|---|---|
| `--brand-text-primary-default` | `--brand` (via `--theme-brand-text-primary-default`) |
| `--brand-background-strong` | `--brand-fill` |
| `--brand-text-primary-oncolor` | `--brand-text-primary-oncolor` (same) |
| `--brand-borders-primary-default` | `--brand` or `--theme-brand-borders-primary-default` |
| `--neutral-text-default` | `--ink` |
| `--neutral-text-subtle` | `--ink-soft` |
| `--neutral-text-subtle-light` | `--muted` (and note source also aliases this as `subtle-least` / `subtleleast`) |
| `--neutral-border-light` | `--line` |
| `--neutral-border-strong` | `--line-strong` |
| `--neutral-surface` (not in this SCSS) | `--panel` / `--bg` / `--surface-2` |
| `--semantics-success-text` | `--green` |
| `--semantics-warning-text` | `--amber` |
| `--semantics-critical-text` | `--red` |
| `--theme-primitive-color-primary-500` | do not use; same hex already on `--brand-fill` |

---

## 5. Typography — `typography.json` vs app

### Font family & weight

| JSON | App token | Match? | Product uses |
|---|---|---|---|
| `fontFamily.sans` = Inclusive Sans | `--font-family-sans` | Same family; app adds `sans-serif` fallback | 3 |
| `fontWeight.regular` 400 | `--font-weight-regular` | Same | 1 |
| `medium` 500 | `--font-weight-medium` | Same | 3 |
| `semibold` 600 | `--font-weight-semibold` | Same | 18 |
| `bold` 700 | `--font-weight-bold` | Same | 48 |
| `extrabold` 800 | `--font-weight-extrabold` | Same | 23 |

JSON has no `fontWeight` token *names* like `--font-weight-*`. Names differ; values match.

### Scale (`fontSize`)

| JSON key | JSON px | App token | App px | Status |
|---|---|---|---|---|
| `xs` | 12 | `--text-xs-size` / `--text-2xs-size` / `--text-caption-size` | 12 | Used (3 names) |
| `sm` | 14 | `--text-sm-size` / `--text-body-md-size` / `--text-body-sm-size` | 14 | Used (3 names) |
| `md` | 16 | `--text-base-size` / `--text-body-lg-size` | 16 | Used |
| `lg` | **20** | `--text-lg-size` | **18** | **Value different**; JSON `lg` = app `--text-xl-size` / `--text-h3-size` |
| `xl` | **24** | `--text-xl-size` | **20** | **Value + name off by one step** |
| `2xl` | **28** | `--text-2xl-size` | **24** | **Value different**; 28px does not exist in the app |
| `3xl` | 32 | `--text-3xl-size` / `--text-h1-size` | 32 | Used |
| *(not in JSON)* | — | `--text-lg-size` 18px | 18 | App-only (2 product uses) |
| *(not in JSON)* | — | `--text-4xl-size` 40px | 40 | **Never used** (display-sm 40px is used) |
| *(not in JSON)* | — | `--text-5xl-size` 48px | 48 | **Never used** |

JSON `letterSpacing` is **all `0`**. App `--ls-tightest` … `--ls-wider` are non-zero and **used** (`--ls-wide` 45, `--ls-snug` 35). `--ls-normal` is never referenced.

### Headings

| JSON | Size / lh / weight | App `--text-hN-*` | App size / lh | Product uses (size) | Status |
|---|---|---|---|---|---|
| `h1` | 32 / 40 / 700 | `--text-h1-*` | 32 / 40 | 5 | Size+lh match; app also sets `ls: -0.4px` (JSON `0`) |
| `h2` | **28 / 36** / 700 | `--text-h2-*` | **24 / 32** | 7 | **Different size and lh** |
| `h3` | **24 / 32** / 700 | `--text-h3-*` | **20 / 28** | 9 | **Different** (app h3 = JSON h4) |
| `h4` | **20 / 28** / 700 | `--text-h4-*` | **16 / 24** | 25 | **Different** (app h4 = JSON h5) |
| `h5` | 16 / 24 / 700 | `--text-h5-*` | 16 / 24 | 18 | Size+lh match |
| `h6` | 14 / **21** / 700 | `--text-h6-*` | 14 / **1.5 (21→24)** | 5 | Size match; **lh raised for WCAG 1.4.12** |

### Body, label, caption, buttons

| JSON | Size / lh / weight | App tokens | App lh | Product uses | Status |
|---|---|---|---|---|---|
| `body.lg` | 16 / 24 / 400 | `--text-body-lg-*` | 1.5 (24) | 18 | Match |
| `body.md` | 14 / **21** / 400 | `--text-body-md-*` | **1.5 (21→24)** | 100 | Size match; **lh different** |
| `body.sm` | 14 / **21** / 400 | `--text-body-sm-*` | **1.5** | 103 | Duplicate of `body.md` in both files; lh different |
| `body.xs` | 12 / **18** / 400 | `--text-body-xs-*` | **1.5 (18→18 unitless=18)** | 58 | Size match; JSON lh 18px vs app unitless 1.5 |
| `label` | 14 / **21** / 700 | `--text-label-*` | **1.5** | 4 | lh different |
| `caption` | 12 / **18** / 500 | `--text-caption-*` | **1.5** + `ls: 0.4px` | 104 | lh + tracking different |
| `helper` | 12 / **18** / 400 | `--text-helper-*` | **1.5** | 4 | lh different |
| `eyebrow` | 12 / **18** / 800 | `--text-eyebrow-*` | **1.5** + `ls: 0.8px` | 10 | lh + tracking different |
| `button.lg/md/sm` | 16/14/14 / 24/21/21 / 700 | `--text-button-*-*` | 1.5 | 3 / 10 / 1 | md/sm lh different |
| `link` | 14 / 21 / 700 | `--text-link-*` | 1.5 | 1 | lh different |
| `placeholder` | 14 / 21 / 400 | `--text-placeholder-*` | 1.5 | 1 | lh different |

JSON has **no display styles**. App defines `--text-display-xl/lg/md/sm-*` (48/32/24/40). Product uses display-lg/md/sm; **`--text-display-xl-*` is Design System docs only**.

---

## 6. Typography — app tokens never used in product

| Token | Value | Notes |
|---|---|---|
| `--ls-normal` | `0` | Default |
| `--text-4xl-size` / `--text-4xl-lh` | 40 / 48 | Role `--text-display-sm-size` used instead |
| `--text-5xl-size` / `--text-5xl-lh` | 48 / 60 | Unused scale |
| `--text-2xl-lh`, `--text-2xs-lh`, `--text-base-lh`, `--text-sm-lh`, `--text-lg-lh`, `--text-xl-lh`, `--text-xs-lh` | scale lh | Size used; matching lh unused |
| `--text-description-*` | 14 / 20 / 400 | Legacy, unused |
| `--text-title-description-*` | 16 / 24 / 600 | Legacy, unused |
| `--text-page-title-*` | 24 / 32 | Legacy; `--text-h2-*` used |
| `--text-paragraph-sm-lh`, `--text-paragraph-xs-lh` | 1.5 | Size tokens used |
| `--text-heading-lh` | 28px | `--text-heading-size` used once |

---

## 7. Source-file issues (attached SCSS)

1. **Disabled tokens are broken** — `--semantics-disabled-background` and `-border` reference `--theme-colors-neutral-lightgrey-50/700`, which are **not defined** in this file (those names belong to an older palette).
2. **Duplicate semantic names** — each status color is exported twice (`--theme-semantics-success-light-background` and `--theme-semantics-success-background-light`). The app wired the `*-light-background` form; the other is dead.
3. **`--brand-text-primaryhover`** is a typo alias of hover.
4. App CSS was generated from **Core-Color-Palette 2.scss** (`--theme-*` + explicit dark hex). The attached **v1** file’s dark block uses different on-color (`primary-50` instead of `#FFFFFF`) and is **not** what `core-color-palette.css` implements.

---

## 8. Summary counts

| | Color (`Core-Color-Palette.scss`) | Typography (`typography.json`) |
|---|---|---|
| Tokens in source | 249 light (+ 72 dark overrides) | 5 weights + 7 sizes + 6 headings + 4 body + 8 UI roles |
| Exact same name used in product | 1 (`--brand-text-primary-oncolor`) | 0 (roles match, CSS names differ) |
| Same role, different name | ~25 (see §4) | All `headings.*` / `body.*` → `--text-*` |
| Source never used | All unprefixed semantics except oncolor; 53 `--theme-*` aliases; 75 primitives; all highlight/disabled; almost all secondary/tertiary | `fontSize.2xl` 28px; JSON letter-spacing (all zero, unused); JSON 21px/18px line-heights |
| App-only extras | `--brand-dark`, `--active-bg`, `--info` mixes, `--chart-5`…`11` hexes | Display styles, 18px `--text-lg`, `--ls-*` tracking, WCAG 1.5 body lh |
| Value mismatches on mapped roles | Light brand hex **matches** `#1F4F8D` (unlike older LendGuard `#0270a9` on other branches) | H2/H3/H4 sizes off by one step; body/caption lh 21/18 vs 1.5 |

### Practical takeaway

1. Search the app for **`--brand` / `--ink` / `--green`**, not `--brand-text-primary-default` or `--neutral-text-default`.
2. The attached SCSS unprefixed names are **not** what components use; the `--theme-*` copies are, and even those are usually wrapped once more.
3. `typography.json` H2=28, H3=24, H4=20 — the app is **one step smaller** (H2=24, H3=20, H4=16) and uses **1.5 line-height** on body/UI text instead of the JSON 21px/18px.
4. Safe deletes (no visual change): unused app aliases in §3, unused `--text-description-*` / `--text-page-title-*` / `--text-4xl-*` / `--text-5xl-*`, and unused `--theme-secondary-*` / `--theme-tertiary-*` / `--theme-semantics-highlight-*` if you are not planning those roles.
