import { describe, expect, test } from "bun:test";

import { getThemeTogglePresentation } from "./theme-toggle-state";

describe("theme toggle hydration state", () => {
  test("keeps the server and initial client presentation identical", () => {
    expect(getThemeTogglePresentation("light", "light", false)).toEqual(
      getThemeTogglePresentation("dark", "dark", false)
    );
  });

  test("returns to the system preference when the target matches it", () => {
    expect(getThemeTogglePresentation("dark", "light", true)).toEqual({
      icon: "sun",
      label: "Use light theme",
      nextTheme: "system",
    });
  });

  test("stores an override when the target differs from the system", () => {
    expect(getThemeTogglePresentation("light", "light", true)).toEqual({
      icon: "moon",
      label: "Use dark theme",
      nextTheme: "dark",
    });
  });

  test("keeps an override that later happens to match the system", () => {
    expect(getThemeTogglePresentation("dark", "dark", true)).toEqual({
      icon: "sun",
      label: "Use light theme",
      nextTheme: "light",
    });
  });
});
