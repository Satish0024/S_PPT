# LendGuard Participant Portal — Rebuild

A from-scratch rebuild of the `S_PPT` prototype (`journey-retirement` branch) on a real
design-system foundation: Chakra UI v3, tokens sourced from the official Core Design
System files, and no hardcoded colors/spacing/typography in page or component code.

## Goal

- Recreate the finalized prototype flows/layouts (reference: https://participantportal-core.netlify.app/)
- On a proper design system (reference: https://coredesignsystemv1.netlify.app/), rebuilt with **Chakra UI v3** instead of the reference's hand-rolled CSS
- Zero hardcoded design values — everything traces back to token files
- WCAG 2.2 AA accessible, responsive at every breakpoint
- A docs/style-guide route mirroring the reference design-system site's layout — **not started yet**

## Sources

| Source | Used for |
|---|---|
| `S_PPT` repo, `journey-retirement` branch | Flow/layout/page reference (superseded in places by the **live deployed site**, which runs newer code than that branch — see "Known discrepancy" below) |
| `Core-Design-system-1.1` repo | Token structure reference (primitive → semantic → component layering) |
| `Core-Color-Palette 2.scss` (user-provided) | **Authoritative color palette** — primitive ramps (primary/secondary/tertiary/success/neutral/red/info/warning) + Figma-aligned semantic light/dark pairs |
| `Core-Typography-Variables.json` (user-provided) | **Authoritative type scale** — fontSize/lineHeight/letterSpacing/fontWeight, headings h1–h6, body, button, label, caption, helper, eyebrow, link |
| Original `forbidden-tokens.scss` / `variables.scss` (user-provided, superseded) | First-pass palette; replaced once the Core-Color-Palette file was provided since that one matches the live site exactly |

**Known discrepancy**: the deployed prototype runs different/newer code than the
`journey-retirement` branch in places (confirmed on the Documents/Reports page, which has
a completely different UI live than in that branch's source). Live DOM/computed-styles are
treated as ground truth over the cloned source when they conflict.

## Stack

- Vite + React 18 + TypeScript
- Chakra UI v3 (`createSystem` / `defineConfig`), all official CLI-generated component
  snippets (`components/ui/*`) rather than hand-rolled primitives
- React Router
- Recharts for charts (line, donut/pie) — matches the reference design system's own choice
- FontAwesome **Free** icons where the prototype's own icon set is used (FontAwesome Pro
  was requested but isn't installable here — no private-registry token configured; see
  `npm view @fortawesome/pro-solid-svg-icons` → 404)
- Prototype's own data/logic files (`src/data/*.js`, `src/lib/*.js`) ported verbatim —
  these are pure fixture data and calculation logic, not styling, so porting them as-is
  doesn't violate the no-hardcode rule

## Token architecture (`src/theme/`)

```
tokens/primitives.json   → raw color ramps + type scale, never referenced directly
tokens/semantic.json     → Figma-aligned light/dark pairs (brand/neutral/semantics/secondary/tertiary)
system.ts                → builds the Chakra theme from both files:
                            - colors (primitive ramps + semantic tokens with _dark variants)
                            - fontSizes/lineHeights/letterSpacings/fontWeights
                            - spacing scale
                            - sizes.headerHeight / sizes.sidebarRailWidth (layout constants as tokens)
                            - textStyles (h1–h6, display.*, body.*, label, caption, helper, eyebrow, link, button.*)
```

Page/component code must only reference semantic tokens (`brand.text.primaryDefault`,
`neutral.surface.layer01`, `semantics.success.text`, ...) or named type-scale steps
(`fontSize="sm"`, `textStyle="h2"`), never raw hex or arbitrary pixel values.

## What's done (built + verified against the live app)

Verified means: compared against the actual deployed DOM/computed styles (not just
screenshots) — colors, layout structure, spacing, and interactive behavior checked, across
multiple participant scenarios where relevant, and in both light/dark themes.

- **Login** — split brand/sign-in panes, scenario picker, real auth flow
- **App shell** — Header, Sidebar (desktop icon-rail + mobile bottom tab bar), Footer
  (correctly scoped to the content column, not full-bleed), skip link, `AuthGates`
- **Dashboard** — all 5 participant scenarios (Auto Enrolled / Not Eligible /
  Eligible-Not-Enrolled / Eligible Enrolled / Opted Out): overall balance, plan cards
  (badge/notice color mapping fixed to match real `badgeClass`/`noticeClass` values),
  quick links, recent transactions, Retirement Readiness widget (real texture/wave
  decoration, real CTA button), Learning/Enrich card (correct row layout with absolutely
  positioned illustration)
- **Investment Portfolio** — My portfolio / Plan investments tabs, summary tiles, asset
  class performance chart (recharts, with axis titles + toggleable legend), sortable
  holdings table, fund detail dialog
- **Transactions** — Requests/History tabs, plan switcher, new-request menu, filters
- **Profile** — Personal/Bank/Employment/Classification/Beneficiary sections (view-only;
  edit-mode forms not yet built)
- **Account Summary** — Sources/Investments tabs, real donut chart, expandable breakdown
  table
- **Plan Details** — Deferrals/Investments tabs
- **Retirement Goal simulator** — live-updating score ring, retirement target inputs,
  deferral sliders wired to the prototype's actual scoring algorithm, confirm/cancel
- **Settings** — Appearance (drives the real app theme), Notifications, password form
- **Risk Questionnaire** — 5 Likert-scale questions (one at a time, 01/05 progress pips),
  financial-profile step (income range + time horizon), results card with risk level badge
  (Conservative / Moderate / Aggressive), outlook quote, key insights. Wired to
  `scoreQuestionnaire()` / `setRiskProfileId()` / `setRiskAnswers()` from `lib/riskProfile.js`;
  pre-populates from `getRiskAnswers()` when re-opened.
- **Enrollment wizard** — 3-step wizard (`/enrollment` + `/enrollment/summary` both route
  here): Step 1 — pre-tax + Roth deferral sliders + auto-increase toggle/rate; Step 2 —
  investment election across `PLAN_FUNDS` (numeric inputs, live % total, must reach 100%);
  Step 3 — summary/review then confirm. On confirm writes to `DEFERRAL_KEY` /
  `INVESTMENT_KEY` session storage and calls `markPlanManuallyEnrolled()` (Eligible /
  Opted-Out scenarios) or `markAdvanceElections()` (Not-Eligible scenario). Lands on a
  confirmed screen then navigates home.
- **Enrich** — content library page: search bar, category-filter pill tabs (CATS),
  featured article hero card, responsive grid of article cards; all data from
  `data/learning.js` (shared with Dashboard's Learning Portal widget so they stay in sync);
  filter + search are combined client-side with no hardcoded copy.

## What's NOT done yet

- **Docs / style-guide route** — mirroring the reference design-system site's layout and
  content 1:1. Not started.
- **5 transaction wizards** — Loan, Withdrawal, Transfer, Rebalance, Rollover. Loan alone
  is a 4-step flow (Details → Payment & Fees → Upload Documents → Summary). This is the
  single largest remaining body of work. DOM for the Loan wizard's first step has been
  captured from the live site; none of the 5 are implemented.
- **Profile edit mode** — forms for editing personal/bank/employment sections and the
  add-beneficiary / set-percentage flows
- **FontAwesome Pro → Free icon swap** — pages built early in the session
  (Login/Dashboard/Sidebar/Header/Portfolio/etc.) still use `lucide-react`; FontAwesome
  Free was installed later per a mid-session request but the swap across already-built
  components hasn't been done yet
- **Full responsive/breakpoint audit** — only Dashboard has been explicitly checked at
  tablet width; a systematic pass across every built page at mobile/tablet/desktop is
  still owed
- **WCAG AA audit** — one contrast pass has been run (script-based luminance-ratio check)
  across the core semantic token pairs and two real failures were fixed (sidebar
  active-state text, a caption-text color). Not yet re-run against every new page/component
  added since, and no keyboard-navigation/focus-trap audit has been done beyond what
  Chakra's Dialog/Drawer/Menu primitives provide by default.

## Known issues to revisit

- Chakra's type-safe token codegen (`chakra typegen`) hasn't been run, so invalid/stale
  token strings (e.g. a leftover `lightgrey.white` reference) don't get caught by
  TypeScript — they were only caught by manual grep sweeps. Worth setting up so future
  token typos fail the build instead of silently rendering wrong colors.
- `journey-retirement` branch vs. live-deployed-site drift (see "Known discrepancy" above)
  means any remaining unbuilt page should be re-verified against the live DOM before
  building, not built from the cloned source alone.
