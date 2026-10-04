import { ConvexError } from "convex/values";
import type { Value } from "convex/values";
import * as Result from "effect/Result";
import * as Schema from "effect/Schema";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const emailInputSchema = Schema.String;

export function normalizeEmail(value: Value | undefined) {
  const parsed = Schema.decodeUnknownResult(emailInputSchema)(value);
  if (Result.isFailure(parsed)) {
    throw new ConvexError("A valid email address is required");
  }

  const email = parsed.success.trim().toLowerCase();
  if (email.length > 320 || !emailPattern.test(email)) {
    throw new ConvexError("A valid email address is required");
  }

  return email;
}
