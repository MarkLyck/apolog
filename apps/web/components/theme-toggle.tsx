"use client";

import { useTheme } from "@wrksz/themes/client";
import { useSyncExternalStore } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

import { getThemeTogglePresentation } from "./theme-toggle-state";

const subscribeHydration = () => {
  const controller = new AbortController();
  return () => controller.abort();
};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false
  );
  const presentation = getThemeTogglePresentation(resolvedTheme, hydrated);
  return (
    <button
      aria-label={presentation.label}
      className="grid size-11 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
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
