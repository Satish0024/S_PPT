# Release Notes — August 26, 2026

This update is an accessibility pass across the whole portal: color contrast, keyboard operability, and visible focus states were audited against WCAG 2.1 AA and brought into compliance.

## Accessibility

- Darkened secondary text, positive (green), and warning (amber) colors so labels, balances, badges, and status text meet the 4.5:1 contrast minimum on every background they appear on.
- The Account Summary Investments table's expandable rows are now real, focusable buttons — they can be opened and closed with the keyboard, not just a mouse.
- Added a visible focus ring to inputs that previously had none while tabbing through them (Enrich search, Retirement Goal target fields, Deferral/Auto-Increase percentage fields).
- All dismissible modals (opt-out, fund picker, beneficiary detail, percent-share, disclaimer, leave-page) can now be closed by pressing Escape.
- Enlarged the show/hide password toggle's hit area on the Sign In page.

# Release Notes — August 25, 2026

This update reworks the Retirement Goal Simulator for participants with multiple deferral-eligible plans, fixes the Add Beneficiary flow, corrects enrollment verbiage for not-yet-eligible participants, and refreshes the Learning Portal card design.

## Retirement Goal Simulator

- Participants with more than one deferral-eligible plan (e.g. a 401(k) and a Roth 401(k)) now see each plan as its own collapsible card, with independent Pre-Tax/Roth sliders and its own deferral summary — no more merged/aggregated numbers.
- Auto Increase is now configured per plan for multi-plan participants, instead of one setting applying to every plan at once.
- Sliders now change color to reflect direction: green when raised above the saved value, amber when lowered below it.
- The Retirement Readiness panel lists each plan's deferral rate separately when a participant has multiple plans.
- The "Ways To Improve" section is temporarily hidden from view (kept in code) while the two remaining sections have been reordered and realigned to the top.

## Enrollment

- Added a Cancel option next to Continue/Confirm throughout the standalone enrollment wizard (Deferral, Investments, Review & Confirm), returning to the originating plan page or Dashboard as appropriate.
- The Opt Out option is now hidden for participants who are not yet eligible for any plan, since there is nothing to opt out of.
- Enrollment summary and confirmation wording now correctly reflects a not-yet-eligible participant's scenario (e.g. "Confirm Elections" / "Your Elections Are Saved") instead of implying immediate enrollment.

## Add Beneficiary

- The "Add Beneficiary" prompt shown after enrollment now takes participants directly to the Add Beneficiary step in My Profile instead of opening a separate pop-up form.

## Learning Portal

- Refreshed the "Enrich" Learning Portal card on the Dashboard with a more modern look — accent border, topic icons, and an updated call-to-action.

## Account Summary

- The Investments table now shows a Units column and expands each row (accordion) to reveal its Asset Class, Category (Stock/Bond), and Price Per Unit.
- Funds that hold more than one asset type (e.g. a target-date or balanced fund) now display all of their categories together, instead of being forced into a single label.

# Release Notes — August 24, 2026

This update makes plan balances and retirement information easier to understand and adds richer account-management tools.

## Highlights

- See each participating plan's YTD rate of return directly beside its balance.
- Review balances by source or investment from the new Account Summary.
- Manage personal, employment, bank, and beneficiary information from My Profile.
- Set a retirement goal and view readiness only after supplying the required details.
- Navigate the portal with the reorganized sidebar.

## Eligibility Experience

- Plans without a balance are omitted from Account Summary.
- Participants who are not eligible do not see Retirement Readiness.
- Participants who have not started goal planning see a short explanation instead of a 0% score.
