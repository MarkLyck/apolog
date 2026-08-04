import { describe, expect, test } from "bun:test";

import { getThemeTogglePresentation } from "./theme-toggle-state";

describe("theme toggle hydration state", () => {
  test("keeps the server and initial client presentation identical", () => {
    expect(getThemeTogglePresentation("light", false)).toEqual(
      getThemeTogglePresentation("dark", false)
    );
  });

  test("reflects the resolved theme after the component mounts", () => {
    expect(getThemeTogglePresentation("dark", true)).toEqual({
      icon: "sun",
      label: "Use light theme",
      nextTheme: "light",
    });
  });
});
