// Single place to swap identity when this app is re-skinned for a different
// client. Component/page code should never hardcode a company name, logo
// path, or tagline — always read from here.
export const BRAND = {
  name: "LendGuard",
  shortName: "LendGuard",
  logo: "/logo-lockup-light.svg",
  logoOnDark: "/logo-lockup-dark.svg",
  tagline: "Your Path To A Confident Retirement.",
  taglineBody:
    "Access your 401(k), deferrals, and retirement tools in one secure participant portal.",
  supportPlanNoun: "your LendGuard plan",
  supportEmail: "support@lendguard.com",
} as const;
