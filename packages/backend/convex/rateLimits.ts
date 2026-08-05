/* oxlint-disable unicorn/prefer-ternary -- Explicit write branches keep mutations readable. */
import { v } from "convex/values";

import { internal } from "./_generated/api";
import { internalMutation, mutation } from "./_generated/server";

const LIMIT = 12;
const WINDOW_MS = 10 * 60_000;

export const consume = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    if (!/^[a-f\d]{64}$/u.test(args.key)) {
      throw new Error("Rate-limit keys must be opaque SHA-256 hashes");
    }
    const now = Date.now();
    const current = await ctx.db
      .query("rateLimits")
      .withIndex("by_key", (index) => index.eq("key", args.key))
      .unique();
    if (!current || current.expiresAt <= now) {
      const value = {
        count: 1,
        expiresAt: now + WINDOW_MS,
        key: args.key,
        updatedAt: now,
        windowStartedAt: now,
      };
      if (current) {
        await ctx.db.patch(current._id, value);
      } else {
        await ctx.db.insert("rateLimits", value);
      }
      return { allowed: true, remaining: LIMIT - 1, retryAfterMs: WINDOW_MS };
    }
    if (current.count >= LIMIT) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: Math.max(0, current.expiresAt - now),
      };
    }
    const count = current.count + 1;
    await ctx.db.patch(current._id, { count, updatedAt: now });
    return {
      allowed: true,
      remaining: LIMIT - count,
      retryAfterMs: current.expiresAt - now,
    };
  },
});

export const cleanupExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const expired = await ctx.db
      .query("rateLimits")
      .withIndex("by_expires_at", (index) => index.lt("expiresAt", Date.now()))
      .take(100);
    for (const record of expired) {
      await ctx.db.delete(record._id);
    }
    if (expired.length === 100) {
      await ctx.scheduler.runAfter(0, internal.rateLimits.cleanupExpired, {});
    }
    return expired.length;
  },
});
