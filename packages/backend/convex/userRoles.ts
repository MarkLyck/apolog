import { ConvexError, v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { normalizeEmail } from "./email";
import { userRoleValidator } from "./validators";

export async function ensureDefaultUserRole(
  ctx: MutationCtx,
  userId: Id<"users">
) {
  const existing = await ctx.db
    .query("userRoles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();

  if (existing === null) {
    await ctx.db.insert("userRoles", { role: "user", userId });
  }
}

export const setByEmail = internalMutation({
  args: { email: v.string(), role: userRoleValidator },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();

    if (user === null) {
      throw new ConvexError(`No user found for ${email}`);
    }

    const existing = await ctx.db
      .query("userRoles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    if (existing === null) {
      await ctx.db.insert("userRoles", { role: args.role, userId: user._id });
      return { email, role: args.role, userId: user._id };
    }

    await ctx.db.patch("userRoles", existing._id, { role: args.role });
    return { email, role: args.role, userId: user._id };
  },
});
