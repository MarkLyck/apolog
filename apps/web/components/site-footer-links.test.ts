import { describe, expect, test } from "bun:test";

import { getSiteFooterLinks } from "./site-footer-links";

describe("site footer corpus links", () => {
  test("preserve the active Quran corpus", () => {
    expect(getSiteFooterLinks("quran")).toEqual([
      { href: "/evidence?text=quran", label: "Methods" },
      { href: "/debate?text=quran", label: "Debate" },
    ]);
  });

  test("leave the default Bible corpus out of the URL", () => {
    expect(getSiteFooterLinks("bible")).toEqual([
      { href: "/evidence", label: "Methods" },
      { href: "/debate", label: "Debate" },
    ]);
  });
});
