import { describe, expect, test } from "bun:test";

import { getSiteFooterLinks } from "./site-footer-links";

describe("site footer corpus links", () => {
  test("preserve the active Quran corpus", () => {
    expect(getSiteFooterLinks("quran")).toEqual([
      { href: "/evidence?text=quran", label: "Methods" },
      { href: "/debate?text=quran", label: "Debate" },
    ]);
  });
});
