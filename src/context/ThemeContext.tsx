import { createContext, useContext, useMemo, type PropsWithChildren } from "react";
import { useTheme as useNextTheme } from "next-themes";

type ThemePreference = "light" | "dark" | "system";

interface ThemeContextValue {
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
  theme: "light" | "dark";
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Thin adapter over next-themes (already mounted by components/ui/provider's
// ColorModeProvider, attribute="class") so page code can keep calling
// useTheme()/theme/toggle exactly like the original prototype, while the
// actual dark/light switching + persistence is next-themes', which is also
// what drives Chakra's _dark semantic-token variants.
export function ThemeProvider({ children }: PropsWithChildren) {
  const { theme, resolvedTheme, setTheme } = useNextTheme();
  const resolved = (resolvedTheme as "light" | "dark") || "dark";

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference: (theme as ThemePreference) || "system",
      setPreference: setTheme,
      theme: resolved,
      toggle: () => setTheme(resolved === "dark" ? "light" : "dark"),
    }),
    [theme, resolved, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
