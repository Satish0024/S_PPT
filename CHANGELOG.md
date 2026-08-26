# Changelog

All notable changes to the Saturna Participant Portal are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

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
