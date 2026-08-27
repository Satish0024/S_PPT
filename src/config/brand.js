// Single place to swap identity when this app is re-skinned for a different
// client. Component code should never hardcode a company name, logo path, or
// tagline directly — it should read from here, so a client branch only has to
// touch this file (plus its CSS theme tokens in src/styles/index.css and its
// own /public logo asset) instead of scattered JSX across the app.
export const BRAND = {
  name: 'LendGuard',
  shortName: 'LendGuard',
  logo: '/logo-lockup-dark.svg',
  tagline: 'Your Path To A Confident Retirement.',
  taglineBody: 'Access your 401(k), deferrals, and retirement tools in one secure participant portal.',
  supportPlanNoun: 'your LendGuard plan'
}
