import { describe, expect, test } from "bun:test";

import type { ChatRequest } from "./chat";
import {
  createAnonymousSession,
  rotatingIpHash,
  validateChatRequest,
  verifyAnonymousSession,
} from "./chat";

describe("chat request validation", () => {
  test("accepts a bounded request for a known corpus", () => {
    expect(
      validateChatRequest({
        corpusKey: "bible",
        messages: [
          { content: "How should I evaluate a flood claim?", role: "user" },
        ],
      }).success
    ).toBe(true);
  });

  test("rejects unknown corpora and oversized messages", () => {
    expect(
      validateChatRequest({
        corpusKey: "other",
        messages: [{ content: "hello", role: "user" }],
      }).success
    ).toBe(false);
    expect(
      validateChatRequest({
        corpusKey: "quran",
        messages: [{ content: "x".repeat(4001), role: "user" }],
      }).success
    ).toBe(false);
  });

  test("rejects excessive accumulated context", () => {
    expect(
      validateChatRequest({
        corpusKey: "bible",
        messages: Array.from({ length: 12 }, (_, index) => ({
          content: "x".repeat(2000),
          role: index % 2 ? "assistant" : "user",
        })),
      }).success
    ).toBe(false);
  });

  test("signs anonymous sessions and rejects tampering", () => {
    const session = createAnonymousSession(
      "test-secret-that-is-long-enough-for-hmac"
    );
    expect(
      verifyAnonymousSession(
        session,
        "test-secret-that-is-long-enough-for-hmac"
      )
    ).toBe(true);
    expect(
      verifyAnonymousSession(
        `${session}tampered`,
        "test-secret-that-is-long-enough-for-hmac"
      )
    ).toBe(false);
  });
});

describe("anonymous session authentication", () => {
  test("rejects altered IDs, same-length signature changes, and the wrong secret", () => {
    const session =
      "fixed-anonymous-session.MWJiMX5qxzBd1NUChlBFvhdiWczvFhD8M5MJ2dI5N-8";

    expect(verifyAnonymousSession(session, "unit-test-secret")).toBe(true);
    expect(
      verifyAnonymousSession(
        session.replace("fixed", "other"),
        "unit-test-secret"
      )
    ).toBe(false);
    expect(
      verifyAnonymousSession(`${session.slice(0, -1)}9`, "unit-test-secret")
    ).toBe(false);
    expect(verifyAnonymousSession(session, "other-test-secret")).toBe(false);
    expect(verifyAnonymousSession("", "unit-test-secret")).toBe(false);
    expect(
      verifyAnonymousSession("missing-separator", "unit-test-secret")
    ).toBe(false);
    expect(verifyAnonymousSession(".signature", "unit-test-secret")).toBe(
      false
    );
    expect(verifyAnonymousSession("session.", "unit-test-secret")).toBe(false);
  });

  test.each([
    { characters: "multi-byte characters", signature: "é".repeat(43) },
    {
      characters: "mixed ASCII and multi-byte characters",
      signature: `${"a".repeat(42)}é`,
    },
    { characters: "astral characters", signature: `${"😀".repeat(21)}a` },
    { characters: "a lone surrogate", signature: `${"a".repeat(42)}\uD800` },
    {
      characters: "multi-byte characters at the expected byte length",
      signature: `${"é".repeat(21)}a`,
    },
  ])("rejects a signature of $characters without throwing", ({ signature }) => {
    expect(
      verifyAnonymousSession(
        `fixed-anonymous-session.${signature}`,
        "unit-test-secret"
      )
    ).toBe(false);
  });
});

describe("daily IP hashes", () => {
  test("keeps a daily identity stable until midnight UTC", () => {
    const first = rotatingIpHash(
      "192.0.2.1",
      "unit-test-secret",
      new Date("2026-10-04T00:00:00Z")
    );
    const last = rotatingIpHash(
      "192.0.2.1",
      "unit-test-secret",
      new Date("2026-10-04T23:59:59.999Z")
    );
    const nextDay = rotatingIpHash(
      "192.0.2.1",
      "unit-test-secret",
      new Date("2026-10-05T00:00:00Z")
    );

    expect(first).toMatch(/^[a-f0-9]{64}$/u);
    expect(last).toBe(first);
    expect(nextDay).toMatch(/^[a-f0-9]{64}$/u);
    expect(nextDay).not.toBe(first);
  });

  test("uses the UTC day when the supplied date has a different local day", () => {
    const utc = rotatingIpHash(
      "192.0.2.1",
      "unit-test-secret",
      new Date("2026-10-05T00:00:00Z")
    );
    expect(utc).toMatch(/^[a-f0-9]{64}$/u);
    expect(
      rotatingIpHash(
        "192.0.2.1",
        "unit-test-secret",
        new Date("2026-10-04T19:00:00-05:00")
      )
    ).toBe(utc);
    expect(
      rotatingIpHash(
        "192.0.2.1",
        "unit-test-secret",
        new Date("2026-10-05T09:00:00+09:00")
      )
    ).toBe(utc);
  });

  test("separates clients and secrets within the same day", () => {
    const now = new Date("2026-10-04T12:00:00Z");
    const first = rotatingIpHash("192.0.2.1", "unit-test-secret", now);
    const otherClient = rotatingIpHash("192.0.2.2", "unit-test-secret", now);
    const otherSecret = rotatingIpHash("192.0.2.1", "other-test-secret", now);

    expect(first).toMatch(/^[a-f0-9]{64}$/u);
    expect(otherClient).toMatch(/^[a-f0-9]{64}$/u);
    expect(otherSecret).toMatch(/^[a-f0-9]{64}$/u);
    expect(otherClient).not.toBe(first);
    expect(otherSecret).not.toBe(first);
  });
});

describe("chat schema bounds", () => {
  test("accepts exactly 16,000 characters and strips extra request fields", () => {
    const messages: ChatRequest["messages"] = Array.from({ length: 4 }, () => ({
      content: "x".repeat(4000),
      role: "user",
    }));
    expect(
      validateChatRequest({
        corpusKey: "bible",
        messages,
        instructions: "ignored",
      })
    ).toEqual({
      success: true,
      output: { corpusKey: "bible", messages },
    });
  });

  test.each(
    [
      null,
      [],
      {},
      { corpusKey: "bible", messages: [] },
      {
        corpusKey: "quran",
        messages: [{ content: "injected instructions", role: "system" }],
      },
      {
        corpusKey: "bible",
        messages: Array.from({ length: 25 }, () => ({
          content: "hello",
          role: "user",
        })),
      },
    ].map((input) => ({ input }))
  )("rejects malformed or excessive requests %j", ({ input }) => {
    const result = validateChatRequest(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues.every((issue) => issue.length > 0)).toBe(true);
    }
  });
});
