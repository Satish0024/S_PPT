import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import primitives from "./tokens/primitives.json";
import semantic from "./tokens/semantic.json";

/**
 * Token layer 1: primitives (./tokens/primitives.json) — raw color ramps and
 * type-scale values, sourced verbatim from Core-Color-Palette 2.scss and
 * Core-Typography-Variables.json. Never referenced directly in page code.
 *
 * Token layer 2: semantic (./tokens/semantic.json) — the Figma-aligned
 * light/dark semantic pairs from the same source file. Page/component code
 * should only ever reference these (e.g. `color="brand.text.primaryDefault"`)
 * or the textStyles built below (e.g. `textStyle="h2"`).
 */
const p = primitives;
const s = semantic as Record<string, any>;

function colorRamp(ramp: Record<string, string>) {
  return Object.fromEntries(Object.entries(ramp).map(([k, v]) => [k, { value: v }]));
}

// Walks a semantic.json branch (nested objects bottoming out in {light,dark})
// into Chakra's semanticTokens shape: { value: { base, _dark } }.
function semanticBranch(branch: Record<string, any>): Record<string, any> {
  if (branch && typeof branch === "object" && "light" in branch && "dark" in branch) {
    return { value: { base: branch.light, _dark: branch.dark } };
  }
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(branch)) {
    if (k === "_comment") continue;
    out[k] = semanticBranch(v);
  }
  return out;
}

const config = defineConfig({
  cssVarsPrefix: "core",
  // Apply Inclusive Sans (fonts.body / fonts.heading from primitives) app-wide.
  // Matches the live prototype and Core Typography Variables.
  globalCss: {
    html: {
      fontFamily: "body",
    },
    body: {
      fontFamily: "body",
      bg: "neutral.surface.layer02",
      color: "neutral.text.default",
      margin: 0,
    },
    "#root": {
      minHeight: "100svh",
      fontFamily: "body",
    },
    "button, input, select, textarea": {
      fontFamily: "inherit",
    },
  },
  theme: {
    tokens: {
      colors: {
        primary: colorRamp(p.color.primary),
        secondary: colorRamp(p.color.secondary),
        tertiary: colorRamp(p.color.tertiary),
        success: colorRamp(p.color.success),
        neutral: colorRamp(p.color.neutral),
        red: colorRamp(p.color.red),
        info: colorRamp(p.color.info),
        warning: colorRamp(p.color.warning),
        chart: colorRamp(p.chart),
      },
      fontSizes: Object.fromEntries(Object.entries(p.font.size).map(([k, v]) => [k, { value: v }])),
      lineHeights: Object.fromEntries(Object.entries(p.font.lineHeight).map(([k, v]) => [k, { value: v }])),
      letterSpacings: Object.fromEntries(Object.entries(p.font.letterSpacing).map(([k, v]) => [k, { value: v }])),
      fontWeights: Object.fromEntries(Object.entries(p.font.weight).map(([k, v]) => [k, { value: v }])),
      spacing: Object.fromEntries(Object.entries(p.spacing).map(([k, v]) => [k, { value: v }])),
      sizes: {
        headerHeight: { value: p.layout.headerHeight },
        sidebarRailWidth: { value: p.layout.sidebarRailWidth },
        sidebarColumn: { value: p.layout.sidebarColumn },
        asidePanel: { value: p.layout.asidePanel },
        asidePanelSm: { value: p.layout.asidePanelSm },
        chartHeight: { value: p.layout.chartHeight },
        donutChart: { value: p.layout.donutChart },
        scoreRingLg: { value: p.layout.scoreRingLg },
        scoreRingMd: { value: p.layout.scoreRingMd },
        formMaxW: { value: p.layout.formMaxW },
        cardMaxW: { value: p.layout.cardMaxW },
        wizardMaxW: { value: p.layout.wizardMaxW },
        loginFormMaxW: { value: p.layout.loginFormMaxW },
        loginBrandMaxW: { value: p.layout.loginBrandMaxW },
        logoHeight: { value: p.layout.logoHeight },
        mobileNavOffset: { value: p.layout.mobileNavOffset },
        filterMinW: { value: p.layout.filterMinW },
        selectMinW: { value: p.layout.selectMinW },
        planSelectMinW: { value: p.layout.planSelectMinW },
      },
      fonts: {
        heading: { value: p.font.family },
        body: { value: p.font.family },
      },
    },
    semanticTokens: {
      colors: {
        brand: semanticBranch(s.brand),
        secondaryBrand: semanticBranch(s.secondary),
        tertiaryBrand: semanticBranch(s.tertiary),
        neutral: semanticBranch(s.neutral),
        semantics: semanticBranch(s.semantics),
        chart: semanticBranch(s.chart),
      },
      shadows: {
        elevation: {
          "01": { value: { base: "0px 2px 5px 0px rgba(29,28,36,0.10)", _dark: "0px 2px 5px 0px rgba(0,0,0,0.4)" } },
          "02": { value: { base: "0px 5px 18px -2px rgba(29,28,36,0.14)", _dark: "0px 5px 18px -2px rgba(0,0,0,0.5)" } },
          "03": { value: { base: "0px 8px 29px 1px rgba(29,28,36,0.18)", _dark: "0px 8px 29px 1px rgba(0,0,0,0.6)" } },
        },
      },
    },
    // Named, reusable type styles straight from Core-Typography-Variables.json
    // — page code sets `textStyle="h2"` / `"body.md"` / `"button.sm"` instead
    // of ever picking a fontSize/lineHeight/letterSpacing combo by hand.
    textStyles: {
      h1: { value: { fontSize: "3xl", lineHeight: "3xl", letterSpacing: "tight", fontWeight: "bold" } },
      h2: { value: { fontSize: "2xl", lineHeight: "2xl", letterSpacing: "snug", fontWeight: "bold" } },
      h3: { value: { fontSize: "xl", lineHeight: "xl", letterSpacing: "snug", fontWeight: "bold" } },
      h4: { value: { fontSize: "base", lineHeight: "base", letterSpacing: "normal", fontWeight: "bold" } },
      h5: { value: { fontSize: "base", lineHeight: "base", letterSpacing: "normal", fontWeight: "bold" } },
      h6: { value: { fontSize: "sm", lineHeight: "sm", letterSpacing: "normal", fontWeight: "bold" } },
      "display.xl": { value: { fontSize: "5xl", lineHeight: "5xl", letterSpacing: "tighter", fontWeight: "extrabold" } },
      "display.lg": { value: { fontSize: "3xl", lineHeight: "3xl", letterSpacing: "tighter", fontWeight: "bold" } },
      "display.md": { value: { fontSize: "2xl", lineHeight: "2xl", letterSpacing: "tight", fontWeight: "bold" } },
      "display.sm": { value: { fontSize: "4xl", lineHeight: "4xl", letterSpacing: "tighter", fontWeight: "extrabold" } },
      "body.lg": { value: { fontSize: "base", lineHeight: "base", fontWeight: "regular" } },
      "body.md": { value: { fontSize: "sm", lineHeight: "sm", fontWeight: "regular" } },
      "body.sm": { value: { fontSize: "sm", lineHeight: "sm", fontWeight: "regular" } },
      "body.xs": { value: { fontSize: "xs", lineHeight: "sm", fontWeight: "regular" } },
      label: { value: { fontSize: "sm", lineHeight: "sm", letterSpacing: "normal", fontWeight: "bold" } },
      caption: { value: { fontSize: "xs", lineHeight: "sm", letterSpacing: "wide", fontWeight: "medium" } },
      helper: { value: { fontSize: "xs", lineHeight: "sm", letterSpacing: "normal", fontWeight: "regular" } },
      eyebrow: { value: { fontSize: "xs", lineHeight: "sm", letterSpacing: "wider", fontWeight: "extrabold", textTransform: "uppercase" } },
      link: { value: { fontSize: "sm", lineHeight: "sm", letterSpacing: "normal", fontWeight: "bold" } },
      "button.lg": { value: { fontSize: "base", lineHeight: "sm", fontWeight: "bold" } },
      "button.md": { value: { fontSize: "sm", lineHeight: "sm", fontWeight: "bold" } },
      "button.sm": { value: { fontSize: "sm", lineHeight: "sm", fontWeight: "bold" } },
    },
  },
});

export const system = createSystem(defaultConfig, config);
