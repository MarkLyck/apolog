import { ConvexError } from "convex/values";
import type { Value } from "convex/values";
import * as v from "valibot";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const emailInputSchema = v.string();

export function normalizeEmail(value: Value | undefined) {
  const parsed = v.safeParse(emailInputSchema, value);
  if (!parsed.success) {
    throw new ConvexError("A valid email address is required");
  }

  const email = parsed.output.trim().toLowerCase();
  if (email.length > 320 || !emailPattern.test(email)) {
    throw new ConvexError("A valid email address is required");
  }

  return email;
}
