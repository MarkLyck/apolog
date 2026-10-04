import { describe, expect, test } from "bun:test";

import type { ChatRequest } from "./chat";
import {
  createAnonymousSession,
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
