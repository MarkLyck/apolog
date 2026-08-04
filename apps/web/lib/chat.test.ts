import { describe, expect, test } from "bun:test";

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
