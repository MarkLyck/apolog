import { ConvexError } from "convex/values";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export function normalizeEmail(value: unknown) {
  if (typeof value !== "string") {
    throw new ConvexError("A valid email address is required");
  }

  const email = value.trim().toLowerCase();
  if (email.length > 320 || !emailPattern.test(email)) {
    throw new ConvexError("A valid email address is required");
  }

  return email;
}
