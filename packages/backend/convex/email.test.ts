import { describe, expect, test } from "bun:test";

import { normalizeEmail } from "./email";

describe("email identity boundary", () => {
  test("normalizes whitespace and case once", () => {
    expect(normalizeEmail("  Owner@Example.COM ")).toBe("owner@example.com");
  });

  test("rejects values that are not email addresses", () => {
    expect(() => normalizeEmail("not-an-email")).toThrow(
      "A valid email address is required"
    );
    expect(() => normalizeEmail(null)).toThrow(
      "A valid email address is required"
    );
  });
});
