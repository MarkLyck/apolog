import type { ResolvedTheme, ThemeSelection } from "@wrksz/themes/client";

export interface ThemeTogglePresentation {
  icon: "moon" | "sun";
  label: string;
  nextTheme: ThemeSelection;
}

export function getThemeTogglePresentation(
  resolvedTheme: ResolvedTheme | undefined,
  systemTheme: ResolvedTheme | undefined,
  hydrated: boolean
): ThemeTogglePresentation {
  const currentTheme = hydrated ? (resolvedTheme ?? "light") : "light";
  const currentSystemTheme = hydrated ? systemTheme : undefined;
  const targetTheme = currentTheme === "dark" ? "light" : "dark";

  return {
    icon: targetTheme === "light" ? "sun" : "moon",
    label: `Use ${targetTheme} theme`,
    nextTheme: targetTheme === currentSystemTheme ? "system" : targetTheme,
  };
}
