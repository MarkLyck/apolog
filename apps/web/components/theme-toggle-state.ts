export interface ThemeTogglePresentation {
  icon: "moon" | "sun";
  label: string;
  nextTheme: "dark" | "light";
}

export function getThemeTogglePresentation(
  resolvedTheme: string | undefined,
  hydrated: boolean
): ThemeTogglePresentation {
  const isDark = hydrated && resolvedTheme === "dark";
  return {
    icon: isDark ? "sun" : "moon",
    label: `Use ${isDark ? "light" : "dark"} theme`,
    nextTheme: isDark ? "light" : "dark",
  };
}
