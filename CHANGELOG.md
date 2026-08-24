# Changelog

All notable changes to the Saturna Participant Portal are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

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
