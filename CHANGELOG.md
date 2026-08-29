# Changelog

All notable changes to the Saturna Participant Portal are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

This repo carries three long-lived branches, each its own client build:
`main` (CORE branding), `saturna` (Saturna Capital branding), and
`journey-retirement` (LendGuard branding). Most feature work lands on
`main` first and is cherry-picked into the other two, so a given change
often appears on all three under different commit hashes — see
"Changes by branch" below for exactly what landed where.

## [1.9.0] - 2026-08-29

### Added
- **Risk questionnaire ("Risk check-in") redesign**: side-panel illustration
  replaced with the supplied reference image (static, no animation, reused
  unchanged across every step), swapped to a text-free version of that image
  with the app's own copy overlaid on top so per-step content can vary
  independently of the picture. Fixed two follow-on bugs: the image being
  cropped at the panel edge, and the overlaid copy overlapping the balloon
  graphic at narrower viewport widths.
- **Enrollment investment election**: new "Not sure? Take our risk
  questionnaire" 3rd option alongside plan-selected/self-selected investments
  — opens the risk questionnaire and returns with a matching preset
  allocation (conservative/moderate/aggressive fund mix) applied automatically.
- **Dashboard readiness card** (`ReadinessScoreCard`): rebuilt from scratch to
  match a supplied reference image — gauge with star badge, wallet/income/
  shortfall breakdown with a dashed connector, gradient trophy + confetti tip
  banner, single-line disclaimer footer — then rescaled twice for sidebar fit
  and height.
- **Learning Portal card**: redesigned to match a reference image — circular
  icon badge, "Quick topics" with three colored icon-circle topics, and an
  "Explore the library" CTA rebuilt as a highlighted panel with a circular
  arrow button.
- **Risk level sidebar card** (`RiskMeterV2`): redesigned to match a
  reference image — "Your Risk Level" tag + big colored headline, single
  gradient progress bar, "X Investor" pill, a new stacked-stones-and-leaf
  illustration, and a footer note ahead of the Edit preferences button.
- **Account Summary**: new "Asset class" tab alongside Sources/Investments —
  groups investments by asset class, each row expandable to show its member
  holdings.
- A not-yet-eligible participant who submits advance elections now sees
  "View saved details" instead of "Provide elections in advance" on their
  dashboard plan card afterward (tracked via a new session flag).
- "New request" menu in Transactions (start a loan, withdrawal, transfer, or
  rebalance from the header) — ported in from a teammate's branch work.

### Changed
- `/retirement-goal` registered as a route in `main`'s `App.jsx` — it had
  never been wired up, so every "Adjust your goal"/"On Track" link 404'd
  back to the dashboard.
- Sidebar label "Reports & documents" → "Document Center".
- Dashboard "Generate statement" link now hides when there are no recent
  transactions.
- Renamed "Retirement Goal Simulator" → "Retirement Readiness" across the
  dashboard widget and the `/retirement-goal` page heading.
- Retirement Readiness page: readiness ring/gauge now renders one consistent
  color regardless of score instead of switching green/amber/red; the
  multi-plan deferral note reworded to "Select a plan to update its deferral
  rate. Changes will affect your paycheck deductions."; the plan-card toggle
  now reads "Save changes" instead of "Done"; saving deferral/auto-increase
  edits now asks for confirmation ("Your changes impact your paycheck
  deduction. Do you agree to move forward?") before committing; the
  TargetCard icon moved to sit top-left above the label instead of
  vertically centered beside a wrapping hint, fixing a layout bug where the
  card ballooned to ~300px tall at narrower widths; the Disclaimer link
  moved to the top-right of the page header; money inputs now show 2 decimal
  places.
- CORE header logo shrunk (was oversized in the topbar).

### Fixed
- Login-hero logo bug on `journey-retirement`: the white "Lend" glyphs were
  invisible against a white background chip wrapping the logo, leaving only
  "Guard" visible — chip removed.

## [1.8.0] - 2026-08-26

### Added
- Cash Balance plan support: PlanCard shows "Cash balance benefit is $X. This is a notional value." instead of Balance/Vested figures and the View Details/Enroll link, for any plan with `type: 'Cash Balance'`. Added a demo Cash Balance plan to Jordan Hale's data.
- Real checkboxes on the Investment Portfolio asset-class legend, replacing the toggle-pill buttons.

### Changed
- App-wide sentence-casing pass: headings, buttons, choice labels, and table column headers converted from Title Case to sentence case across Dashboard, Portfolio, Account Summary, Transactions, Reports, Profile, Enrollment/Investments/Summary, Retirement Goal, Plan Details, Login, and shared layout components. Primary navigation, section-identity tabs/labels, and proper nouns (plan/fund names, "Roth", brand names) were left unchanged.
- Investment Portfolio: "Your investments" table heading renamed to "Investments".
- Dashboard: "Your Plans" section renamed to "My Plans"; plan card "Balance"/"Vested" labels renamed to "Account Balance"/"Vested Balance".

## [1.7.0] - 2026-08-26

### Changed
- Round 2 verbiage pass from the latest content sheet: Account Balance notional-cash footnote, removed Portfolio sub-message, "Are you sure you want to opt out?", "Set My Deferral Rate" step, updated Pre-Tax/Roth source descriptions, simplified Auto Increase copy, "Keep The Current Deferral Rate" panel, renamed Investment Election choices/helper text, Enrollment Summary Deferral+Auto Increase merged into one card with a single Edit action, Investments card renamed "Investment Election" with allocation-type sub-label removed, unified summary footer note, updated sidebar step descriptions, and reworded the enrollment success popup for both eligibility scenarios.

## [1.6.0] - 2026-08-26

### Fixed
- WCAG 2.1 AA contrast failures: darkened `--muted`, `--green`, and `--amber` design tokens so secondary text, positive/warning status text, and badges meet 4.5:1 against every background they're used on.
- Account Summary Investments table accordion rows were not keyboard-focusable or operable (`role="button"` on a `<tr>` with no `tabIndex`/key handler); replaced with a real `<button>` per row with `aria-expanded`/`aria-controls`.
- Missing visible focus indicator on the Enrich search input, Retirement Goal target/step fields, and Deferral/Auto-Increase percentage fields; added a `:focus-within` ring to each wrapper.
- Modals had no keyboard dismissal path; added a shared `useEscapeToClose` hook and wired it into all seven dismissible modals.
- Login's show/hide password button had a ~24×24px hit area; enlarged to 36×36px minimum with a visible focus ring.
- Retirement Goal Simulator's Goal Saved popup primary button renamed "Back To Dashboard" → "Save & Go To Dashboard" to reflect that the goal is already saved at that point.

## [1.5.0] - 2026-08-25

### Added
- Account Summary Investments table: Units column plus an accordion on each row revealing Asset Class, Category (Stock/Bond), and Price Per Unit.
- Multi-asset funds (e.g. target-date, balanced) now show every category they're made up of, instead of a single forced label.

## [1.4.0] - 2026-08-25

### Added
- Retirement Goal Simulator: per-plan deferral accordion for participants with multiple deferral-eligible plans, with independent Pre-Tax/Roth sliders and per-plan Auto Increase settings.
- Cancel option next to Continue/Confirm across the standalone enrollment wizard (Deferral, Investments, Review & Confirm).

### Changed
- Retirement Goal Simulator sliders now color-code direction (green = raised, amber = lowered vs. saved value).
- Retirement Readiness panel shows one deferral line per plan for multi-plan participants.
- Enrollment/Enrollment Summary wording now branches correctly for not-yet-eligible participants (e.g. "Confirm Elections" / "Your Elections Are Saved" instead of enrollment language).
- Opt Out is hidden for not-yet-eligible participants.
- "Add Beneficiary" prompt after enrollment now navigates to the Add Beneficiary step in My Profile instead of opening an inline pop-up form.
- Refreshed the Learning Portal ("Enrich") Dashboard card design.

### Removed
- "Ways To Improve" section hidden from the Retirement Goal Simulator UI (kept in code) while the goal-tracking sections are reordered.

## [1.3.0] - 2026-08-24

### Added
- Year-to-date rate of return on participating plan cards and plan details.

### Changed
- Rate of return now appears beside Balance as a compact YTD indicator.

### Notes
- Added user-facing release notes for the Account Summary, profile, readiness, navigation, and rate-of-return updates.

## [1.2.0] - 2026-08-24

Remaining content changes from the "Verbiage changes for prototype" sheet applied across the Investment Portfolio and Enrollment flows (the sheet rows the v1.1.0 pass didn't cover, since it was scoped to the Dashboard).

### Changed
- **Investment Portfolio**: "Holdings" → "Your investments"; sub-heading updated to "Summary of your retirement investment balances, returns, and gains."; Plan Investments sub-heading updated to "Browse and compare the funds available within your retirement plan."; chart Y-axis renamed to "Rate of return (%)".
- **Opt-out popup** (Plan Details + Enrollment, both copies): retitled from "Opt Out Of Paycheck Deferral?" to "Are you sure?" with updated body copy about missed employer match.
- **Deferral Rate step**: intro copy updated to "Choose your own deferral rate or use the plan deferral rate."
- **Auto Increase**: section copy, both choice labels/descriptions, and the "won't grow as fast" warning card all updated to the sheet's wording ("Keep Your Current Deferral Rate" etc).
- **Investment Election**: "I'll Choose My Own" → "Select My Own Investments"; both choice descriptions updated.
- **Enrollment Summary**: review intro, auto-increase note, investment-selection labels ("Own Election"/"Plan default selection" · "Source wise allocation"/"Investment wise allocation"), and footer note all updated.
- **Enrollment success message** now branches: not-yet-eligible participants see "Your enrollment preferences have been saved and will take effect once you're eligible for the plan."; everyone else keeps the original beneficiary-prompt message.
- **Enrollment sidebar** step descriptions updated to match sheet wording.

### Notes
- Confirmed via a full pass of both sheet tabs against the codebase: several sheet rows don't apply because the corresponding screens/features aren't built here (questionnaire/risk-level, loan & distribution, transfer, document center, contribution-election % display, source descriptions, sidebar "Enrollment" rename).

## [1.1.0] - 2026-08-24

Dashboard content updated per the "Verbiage changes for prototype" sheet.

### Changed
- Renamed balance labels on the dashboard from "Overall Account Balance" / "Total Vested Balance" to "Account Balance" / "Vested Balance".
- Updated the outstanding loan disclaimer to "This loan balance is tracked separately and is not reflected in the account balances shown above."
- Renamed the "My Plans" dashboard section (and its plan-details breadcrumb) to "Your Plans".

### Notes
- Plan-card status notices (auto-enrolled, manually enrolled, eligible, not eligible) already matched the sheet's expected copy — no change needed.
- Several sheet items (questionnaire/risk-level copy, loan & distribution flows, contribution/auto-increase screens, sidebar "Enrollment" rename) don't apply — those screens/flows don't exist in this build, or apply to Enrollment/Portfolio pages rather than the Dashboard.
- The Retirement Readiness disclaimer text was flagged in the sheet as unclear, but no replacement wording was provided yet — left unchanged pending that follow-up.

## [1.0.0] - 2026-08-24

Initial release, pushed to `main` on `Satish0024/S_PPT`.

### Added
- Saturna participant portal app scaffold (Vite + React 18 + React Router + Chart.js + Lucide icons).
- Login screen with a compact "try a participant" dropdown for demo sign-in.
- Dashboard: account summary, per-plan cards (401(k), Profit Sharing, Roth 401(k), Deferred Comp), vested/outstanding balances, and profile details.
- Retirement Readiness widget with a goal-based readiness score.
- Retirement goal simulator with live scoring and a save confirmation flow.
- Enrollment and Auto Increase flows.
- Investment Portfolio page.
- Enrich learning portal page.
- Dev server bound to `127.0.0.1` so `npm run dev` reliably serves on localhost.

### Fixed
- Local dev server binding issue preventing `localhost` from resolving.

---

## Changes by branch — 2026-08-28 to 2026-08-29

Everything below landed in this two-day window. Commits are newest-first per
branch; a commit cherry-picked onto multiple branches is listed under each,
with its own hash on each branch (identical subject line).

### `main` (CORE)
- `2602b4b` Apply xlsx feedback items tagged 'CORE' (13, 14, 19, 20, 21, 22, 23, 24, 25, 26)
- `93bcd63` Apply xlsx feedback items tagged 'Both' (10, 11, 12, 27, 28)
- `53e0e10` Add New request menu and remove portfolio export buttons
- `acc5867` Fix questionnaire side-panel text overlapping the balloon at narrower widths
- `fab7468` Swap to the text-free reference image, overlay app copy on top
- `8684967` Fix risk questionnaire image being cropped on the left edge
- `08dc805` Make risk questionnaire image fill the full side panel
- `77cdb57` Replace risk questionnaire illustration with the supplied reference image
- `84e1141` Redesign risk level sidebar card to match reference
- `4471cb4` Redesign Learning Portal card to match reference, shrink readiness card height
- `00c6c9a` Bring readiness score card proportions closer to the reference image
- `8c10806` Match Retirement Goal Simulator card to reference image exactly
- `69053bb` Move Retirement Goal Simulator card back to sidebar, compact scale
- `a07ae7a` Add Retirement Goal Simulator readiness score card to dashboard
- `46fdd5e` Add aggressive-investor risk questionnaire option to enrollment investments
- `81e0b93` Redesign risk questionnaire scene as a static sunrise illustration
- `a24594a` Add missing Figma withdrawal allocation sections
- `bf9b06f` Use brand blue (not white) for CORE dark-mode logo
- `938caa4` Add CORE dark-mode logo and drop logo background chip
- `fbcb79f` Shrink oversized header logo on main

### `saturna` (Saturna Capital)
- `ca9a8c9` Saturna-only feedback from Teams thread: remove risk content, drop redundant UI
- `419e11b` Apply xlsx feedback items tagged 'Both' (10, 11, 12, 27, 28)
- `ac9150e` Fix questionnaire side-panel text overlapping the balloon at narrower widths
- `e93fcdc` Swap to the text-free reference image, overlay app copy on top
- `cada79c` Fix risk questionnaire image being cropped on the left edge
- `4c67700` Make risk questionnaire image fill the full side panel
- `0aea85b` Replace risk questionnaire illustration with the supplied reference image
- `006fbb2` Add aggressive-investor risk questionnaire option to enrollment investments (later removed again by `ca9a8c9` — see below)
- `1ab33b9` Redesign risk questionnaire scene as a static sunrise illustration (later removed again by `ca9a8c9` — see below)
- `476a33f` Open Generate Statement from Recent transactions with modal actions *(teammate commit, not from this session)*
- `53e4274` Simplify My plans to the 401(k) card and stretch it full width *(teammate commit, not from this session)*
- `c4f53a5` Add New request menu and remove portfolio export buttons *(teammate commit, cherry-picked onto `main`/`journey-retirement` in this session)*

  `ca9a8c9` is Saturna-specific and diverges from `main`/`journey-retirement`:
  removed the dashboard risk widget, the risk-questionnaire 3rd option in
  enrollment investments (and its `/risk-check-in` route/nav entry entirely
  — no risk content anywhere on this branch), the auto-enroll→manual-edit
  confirmation popup, per-kind transaction amount colors (now one color),
  the redundant plan name/balance header in Account Summary's detail panel
  (already shown in the left panel), the duplicated "Units held" line in
  the Investments-tab detail accordion, and the "Auto Enrolled [date]" line
  under the auto-enrolled plan's name on the dashboard; relabeled the
  Portfolio holdings-grid "Fund return %" column to "Fund return % (YTD)".

### `journey-retirement` (LendGuard)
- `303190b` Fix LendGuard login-hero logo showing only 'Guard'
- `e7aef5a` Apply xlsx feedback items tagged 'CORE' (13, 14, 19, 20, 21, 22, 23, 24, 25, 26)
- `f519b2e` Add New request menu and remove portfolio export buttons
- `e22c9fb` Apply xlsx feedback items tagged 'Both' (10, 11, 12, 27, 28)
- `404e52f` Fix questionnaire side-panel text overlapping the balloon at narrower widths
- `4f222aa` Swap to the text-free reference image, overlay app copy on top
- `1ce0ecc` Fix risk questionnaire image being cropped on the left edge
- `4524070` Make risk questionnaire image fill the full side panel
- `46a6b9f` Replace risk questionnaire illustration with the supplied reference image
- `49a5fba` Add aggressive-investor risk questionnaire option to enrollment investments
- `a13689d` Redesign risk questionnaire scene as a static sunrise illustration
- `89bcc90` Redesign risk level sidebar card to match reference
- `6809da8` Redesign Learning Portal card to match reference, shrink readiness card height
- `97a18e3` Bring readiness score card proportions closer to the reference image
- `4f5457d` Match Retirement Goal Simulator card to reference image exactly
- `3b0bd8f` Move Retirement Goal Simulator card back to sidebar, compact scale
- `3340208` Add Retirement Goal Simulator readiness score card to dashboard

### Open item
- The YTD-increase-% badge shown against account balance in Portfolio was
  raised as an open question in the Teams thread ("are we planning to show
  this?"), not a directive — left as-is on every branch pending a decision.
- The attorney's separate feedback list (mentioned in the same Teams thread,
  not yet added to the tracking spreadsheet) hasn't been reviewed or
  implemented.

---

## How release notes are generated going forward

Each push to `main` should add an entry above, newest on top, summarizing the commits included since the last entry. Suggested flow:

```bash
git log <last-release-tag>..HEAD --pretty=format:'- %s (%h)'
```

Paste the output under a new `## [x.y.z] - YYYY-MM-DD` heading, group into Added/Changed/Fixed, then tag the release:

```bash
git tag -a vX.Y.Z -m "Release X.Y.Z"
git push origin vX.Y.Z
```
