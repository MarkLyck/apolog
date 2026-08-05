import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

import type { DataModel } from "./_generated/dataModel";
import { normalizeEmail } from "./email";
import { ensureDefaultUserRole } from "./userRoles";

const password = Password<DataModel>({
  profile(params) {
    return { email: normalizeEmail(params.email) };
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId }) {
      await ensureDefaultUserRole(ctx, userId);
    },
  },
  providers: [password],
});
