"use client";

import { useHydrated, useTheme } from "@wrksz/themes/client";
import { FiMoon, FiSun } from "react-icons/fi";

import { getThemeTogglePresentation } from "./theme-toggle-state";

export function ThemeToggle() {
  const { resolvedTheme, setTheme, systemTheme } = useTheme();
  const hydrated = useHydrated();
  const presentation = getThemeTogglePresentation(
    resolvedTheme,
    systemTheme,
    hydrated
  );

  return (
    <button
      aria-label={presentation.label}
      className="grid size-10 place-items-center border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] transition hover:border-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      onClick={() => setTheme(presentation.nextTheme)}
      type="button"
    >
      {presentation.icon === "sun" ? (
        <FiSun aria-hidden="true" />
      ) : (
        <FiMoon aria-hidden="true" />
      )}
    </button>
  );
}
