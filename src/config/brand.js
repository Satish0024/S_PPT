// Single place to swap identity when this app is re-skinned for a different
// client. Component code should never hardcode a company name, logo path, or
// tagline directly — it should read from here, so a client branch only has to
// touch this file (plus its CSS theme tokens in src/styles/index.css and its
// own /public logo asset) instead of scattered JSX across the app.
export const BRAND = {
  name: 'Saturna Capital',
  shortName: 'Saturna',
  // Logo on light/white surfaces (topbar, login card) — navy #292670 + red #BA141A, no background.
  logo: '/core-logo.svg',
  // Logo on dark surfaces (dark theme, login hero gradient). White wordmark + red accent.
  // Falls back to `logo` for brands with a single all-purpose mark.
  logoOnDark: '/core-logo-dark.svg',
  tagline: 'Plan With Confidence.',
  taglineBody: 'Access your 401(k), deferrals, and retirement tools in one secure participant portal.',
  supportPlanNoun: 'your Saturna plan'
}
