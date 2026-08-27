# Project Notes — Saturna Participant Portal

This is the single reference document for what this project is, how it's structured, and everything that's been built or changed on it. `README.md` covers quick-start; `CHANGELOG.md` and `RELEASE_NOTES.md` cover dated release entries. This file is the fuller narrative — read this first if you're new to the repo or picking work back up after a gap.

---

## 1. What this is

A React/Vite single-page app simulating a 401(k) participant portal — the kind of self-service site a retirement plan record-keeper gives its participants (Dashboard, Enrollment, Investments, Transactions, Documents, Profile). It's a **demo/prototype app**, not connected to a real record-keeping backend — all data lives in `src/data/*.js` and browser `sessionStorage`.

**Stack:** React 18, Vite 6, React Router 6, Chart.js + react-chartjs-2, Lucide icons, plain CSS (no framework, all hand-written).

**Live demo:** https://satish0024.github.io/S_PPT/ (GitHub Pages, deploys automatically on push to `main` via `.github/workflows/deploy.yml`)

**Repo:** `Satish0024/S_PPT`

---

## 2. How to run it

```bash
npm install
npm run dev      # http://localhost:5173 (or whichever port you pass with --port)
npm run build    # production build to dist/
```

Demo login: pick "Try a participant" on the login screen, or sign in with any participant's email + password `Saturna2026` (see `DEMO_PASSWORD` in `src/data/participants.js`).

---

## 3. Branching strategy — one trunk, per-client branches

As of this session, the repo moved to a **trunk + client-branch** model so the same codebase can be re-skinned for different clients without maintaining separate repos.

| Branch | Purpose |
|---|---|
| `main` | The trunk. Every feature/module lands here first. Fully generic — Saturna is just the default branding baked into `src/config/brand.js`. |
| `saturna` | The Saturna client demo. Currently identical to `main` (no client-specific divergence yet beyond the default branding). |
| `journey-retirement` | The Journey Retirement client demo. Diverges from `main` only in branding: `src/config/brand.js`, `public/journey_logo.svg`, and the CSS color tokens (teal/forest palette instead of Saturna's navy/indigo). |

**Workflow going forward:**
1. New features and bug fixes are always built and merged into `main` first.
2. `main`'s new work is merged **outward** into each client branch (`git checkout <branch> && git merge main`) — never build a feature directly on a client branch.
3. Client-specific customization (branding, hidden modules, tweaked copy) only ever lives on that client's own branch, ideally confined to `src/config/brand.js` + CSS tokens so merges from `main` stay conflict-free.
4. GitHub Pages currently only auto-deploys `main`. The `saturna`/`journey-retirement` branches build and run locally but don't have their own public preview URL yet — that would need a second deploy workflow or a build matrix if a live link per client is wanted.

### Re-skinning checklist (what a new client branch needs to touch)
- `src/config/brand.js` — name, short name, logo path, tagline, tagline body, plan noun
- `public/<client>_logo.svg` (or `.png`) — the logo asset itself
- `src/styles/index.css` `:root` — `--brand`, `--brand-dark`, `--accent`, `--link`, `--active-bg`
- Same `:root` block duplicated in `src/styles/enrich.css` and `src/styles/enrollment.css` (historical duplication, not yet consolidated — see "Known issues" below)
- Any hardcoded brand hex literals used outside `:root` (gradients in `login.css`, confetti colors in `RetirementGoal.jsx`, chart series colors in `Portfolio.jsx`/`accountSummary.js`, focus-ring `rgba()` literals) — grep for the old hex codes to find stragglers
- `index.html` — `<title>` and favicon `<link>` (can't read `brand.js` at build time, so this is a manual one-line edit per branch)

---

## 4. App structure

```
src/
  pages/            One component per route (Dashboard, Enrollment, Investments, Transactions,
                     TransactionRequest, Reports, Profile, PlanDetails, AccountSummary,
                     RetirementGoal, Portfolio, Enrich, Login)
  components/
    dashboard/       Dashboard widgets (PlanCard, OverallBalance, RetirementGoalSimulator,
                      LearningPortal, QuickLinks, Transactions widget, ReadinessVisuals)
    layout/          Header, Sidebar, AppLayout, EnrollmentLayout, AuthGates
    profile/         AddBeneficiary wizard, shared profile field components
  data/              Demo content: participants.js, portfolio.js, documents.js,
                      transactions.js — the "database" of this prototype
  lib/               Pure helper/calculation modules (accountSummary.js, retirementGoal.js,
                      profileDetails.js)
  context/           ParticipantContext — who's "logged in", session persistence
  config/            brand.js — the client-identity config described above
  styles/            One CSS file per page/area, all globally bundled by Vite regardless of
                      which page imports them (see "Known issues")
```

### The five demo participants
Defined in `src/data/participants.js`, selectable from the login screen:
1. **Jordan Hale** — auto-enrolled, multiple plans (401(k), Profit Sharing, Roth 401(k) eligible, Deferred Comp not-eligible, and a Cash Balance plan), has a loan.
2. **Kayla Brooks** — not eligible for anything, $0 balances everywhere.
3. **Michael Harris** — eligible but not enrolled.
4. **Ava Sullivan** — eligible and enrolled.
5. **Noah Parker** — opted out.

These five scenarios are the standard test matrix — any new feature should be checked against all five (or at least the relevant subset) before shipping.

---

## 5. What's been built, in order

### 5.1 Retirement Goal Simulator rework
- Per-plan deferral accordion for participants with more than one deferral-eligible plan (previously deferral rates were merged/aggregated across plans, which was confusing for someone with e.g. a 401(k) *and* a Roth 401(k)).
- Auto Increase configured independently per plan (was previously one global toggle affecting every plan at once).
- Sliders color-code direction: green when raised above the saved value, amber when lowered.
- "Ways To Improve" section removed (was hidden via CSS first, then deleted outright per a later request).
- Retirement Readiness panel lists one deferral line per plan when multi-plan.

### 5.2 Enrollment flow
- Added a **Cancel** button next to Continue/Confirm throughout the standalone `/enrollment` wizard, respecting the existing `?return=` query param convention to go back to the originating plan page.
- Wording branches correctly on `isNotEligibleUser()` — a participant pre-electing before eligibility sees "Confirm Elections" / "Your Elections Are Saved" instead of enrollment language.
- Opt Out hidden for participants with nothing to opt out of.
- Two rounds of verbiage updates against a content spreadsheet ("Verbiage changes for prototype") — see `CHANGELOG.md` v1.2.0–v1.7.0 for the itemized list (deferral rate copy, auto-increase copy, source descriptions, investment election labels, summary wording, sidebar step descriptions, success-popup wording).

### 5.3 Add Beneficiary
- The "Add Beneficiary" prompt after enrollment now navigates to Profile's existing multi-step Add Beneficiary flow (`/profile?section=beneficiary&add=1`) instead of a separate inline pop-up.

### 5.4 Dashboard "Enrich" card
- Iteratively redesigned (several rounds of feedback: too flashy → too plain → landed on a light, brand-accented card with an icon badge, topic pills, and a small CTA button) — see `src/components/dashboard/LearningPortal.jsx`.

### 5.5 Account Summary — Investments table
- Added a **Units** column.
- Added an accordion per row revealing Asset Class, Category (Stock/Bond), and Price Per Unit.
- `assetCategory()` returns an array so multi-asset funds (target-date, balanced) show every category they're made up of, instead of being forced into one label.

### 5.6 Accessibility pass (WCAG 2.1 AA)
Full audit + fix, see the "Portal Accessibility Audit" artifact from that session for the itemized findings:
- Darkened `--muted`, `--green`, `--amber` tokens — several were failing the 4.5:1 contrast minimum.
- Account Summary's accordion rows were `role="button"` on a `<tr>` with no `tabIndex`/key handler (not keyboard-operable at all) — replaced with a real `<button>`.
- Added visible `:focus-within` rings to several inputs that had lost their outline with no replacement.
- Added Escape-to-close (`src/hooks/useEscapeToClose.js`) to all 7 dismissible modals.
- Enlarged the Login page's show/hide password button to a 36×36px hit target.

### 5.7 Verbiage passes (rounds 1–3) and sentence-casing pass
- Two rounds of content updates against client feedback spreadsheets (exact wording changes — opt-out copy, loan/deferral terminology, investment election labels, document type names).
- A full app-wide pass converting Title Case UI text (headings, buttons, table headers) to sentence case, while leaving primary navigation, section-identity tabs, and proper nouns (plan names, "Roth", brand names) untouched.
- Added Cash Balance plan support to `PlanCard.jsx` — a plan with `type: 'Cash Balance'` shows "Cash balance benefit is $X. This is a notional value." instead of Balance/Vested figures, with no View Details/Enroll link.
- Real checkboxes on the Investment Portfolio asset-class legend (previously toggle-pill buttons).

### 5.8 Transactions and Documents flow (the big build)
Built end-to-end against a reference portal's Loan/Distribution wizards (analyzed live via browser + Teams thread screenshots) and a written plan reviewed before implementation.

**Transactions** (`src/pages/Transactions.jsx`, `src/pages/TransactionRequest.jsx`, `src/data/transactions.js`, `src/styles/transactions.css`):
- New **Requests** tab alongside the existing **History** ledger — plan tabs, plan/vested balance strip, and a "New Request" menu (Loan / Withdrawal / Transfer) gated by `canRequest()` eligibility (a plan needs a real balance to raise most request types).
- **Loan wizard**, 4 steps: Loan Details → Payment & Fee Details → Upload Documents → Loan Request Summary.
  - "Length of the loan term" (not "Tenure") and Periodic Payment shown on the same line with an auto-update note.
  - Repayment method fixed to Payroll deduction only.
  - "Your personal eligible maximum limit is $X" copy instead of a bare "maximum".
  - Editing a value from the summary screen (e.g. wrong loan type) jumps back to that step and preserves every other already-entered field — the reference portal forced a full restart on any correction, which this specifically fixes.
- **Withdrawal (Distribution) wizard**: Direct Distribution / Rollover / IRA Account (Rollover listed before IRA Account; no beneficiary names shown), "Mail check payable to" locked to the participant's legal name (no free-text override), and a live admin-facing banner when a custom address is entered on the request.
- **Transfer wizard**: simple allocation-percentage → summary flow.
- Document uploads state plainly whether they're required — no "Optional" wording (a specific piece of client feedback).

**Documents** (`src/pages/Reports.jsx`, `src/data/documents.js`, `src/styles/documents.css`):
- Extended filter bar: Search by name, Plan Name/ID multi-select (covers *all* of a participant's plans, not just transaction-eligible ones), Document Type multi-select, date range.
- Document type taxonomy corrected: "Annual Fee Disclosure" / "Quarterly Fee Disclosure" (not just "Annual/Quarterly Disclosure"), plus Summary Plan Description, Enrollment Notice, Investment & Fee Change Notice, Plan Document.
- **Generate Statement** modal (plan + statement period → on-demand statement).

### 5.9 Brand config extraction (prep for multi-client branching)
- `src/config/brand.js` created — name, short name, logo path, tagline, tagline body, plan noun.
- `Header.jsx`, `Login.jsx`, `Enrich.jsx`, `profileDetails.js` updated to read from it instead of hardcoding "Saturna Capital" / the logo path / the tagline.
- This was the prerequisite that made the `saturna` / `journey-retirement` branch split low-friction.

### 5.10 Journey Retirement re-skin
- New original SVG logo (`public/journey_logo.svg`) — a simple path/mountain icon + wordmark.
- New brand config values (name, tagline, plan noun).
- Full color re-theme: every hardcoded Saturna navy/indigo hex literal and `rgba()` focus-ring value across `index.css`, `enrich.css`, `enrollment.css`, `login.css`, `portfolio.css`, `documents.css`, `transactions.css`, plus JS-level chart colors in `Portfolio.jsx`, `RetirementGoal.jsx`, and `accountSummary.js`, replaced with a teal/forest palette.
- `index.html` title and favicon updated.

---

## 6. Known issues / things worth cleaning up later

- **CSS variable duplication:** `src/styles/index.css`, `enrich.css`, and `enrollment.css` each declare their own `:root{ --brand: ...}` block independently, with slightly different sets of tokens. Because Vite bundles all imported CSS globally regardless of which page imports it, whichever file's `:root` block loads last in the final bundle order wins for any token all three declare. They currently hold the same *intended* values, but a future edit that only touches one of the three could silently diverge. Worth consolidating into a single `:root` block in one file.
- **Hardcoded hex literals outside `:root`:** several files use a literal brand hex (in gradients, `rgba()` focus rings, inline SVG data-URI fills, JS chart color arrays) instead of `var(--brand)`. These were all manually swapped for the Journey Retirement re-skin; a `grep -rn` for the old hex code is the fastest way to find any that were missed on a future re-skin.
- **Demo data still says "Saturna 401(k) Plan" etc.:** plan/document names in `src/data/participants.js`, `documents.js`, `transactions.js`, and `portfolio.js` are literal Saturna-branded strings. These were left alone intentionally — they're demo *content*, which a real client engagement would replace wholesale, not UI chrome that needs to stay generic.
- **`DEMO_PASSWORD`** (`src/data/participants.js`) is literally `'Saturna2026'` — cosmetic only, not changed on the Journey Retirement branch, shown on the login screen hint.
- **GitHub Pages** only serves one live site per repo, tied to `main`. `saturna` and `journey-retirement` build and run locally but have no public preview URL of their own yet.

---

## 7. Where to look for more detail

- `CHANGELOG.md` — dated, itemized technical changelog (Keep a Changelog format).
- `RELEASE_NOTES.md` — the same history written as user-facing release notes.
- `README.md` — quick-start and page list.
- This file — the narrative version, updated as work continues.
