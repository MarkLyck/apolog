import { describe, expect, test } from "bun:test";

import { normalizeSearchQuery } from "./search";

describe("search contracts", () => {
  test("normalizes whitespace without changing meaningful text", () => {
    expect(normalizeSearchQuery("  global   flood  ")).toBe("global flood");
  });
});
