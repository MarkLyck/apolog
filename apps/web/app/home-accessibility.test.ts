import { describe, expect, test } from "bun:test";

describe("home page accessibility", () => {
  test("uses the theme-aware inverse text token in the geography panel", async () => {
    const source = await Bun.file(new URL("page.tsx", import.meta.url)).text();
    expect(source).not.toContain("text-white/65");
    expect(source).toContain("text-[var(--inverse-muted)]");
  });
});
