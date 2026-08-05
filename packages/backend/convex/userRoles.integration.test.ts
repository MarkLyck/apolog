import { describe, expect, test } from "bun:test";

import { convexTest } from "convex-test";
import { makeFunctionReference } from "convex/server";

import schema from "./schema";
import { ensureDefaultUserRole } from "./userRoles";

const modules = {
  "./_generated/server.js": () => import("./_generated/server.js"),
  "./email.ts": () => import("./email"),
  "./userRoles.ts": () => import("./userRoles"),
};
const setByEmail = makeFunctionReference<"mutation">("userRoles:setByEmail");

describe("user roles", () => {
  test("provisions one default user role", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) =>
      ctx.db.insert("users", { email: "owner@example.com" })
    );

    await t.run((ctx) => ensureDefaultUserRole(ctx, userId));
    await t.run((ctx) => ensureDefaultUserRole(ctx, userId));

    const roles = await t.run((ctx) => ctx.db.query("userRoles").collect());
    expect(roles).toHaveLength(1);
    expect(roles[0]).toMatchObject({ role: "user", userId });
  });

  test("promotes and demotes by normalized email without duplicate rows", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) =>
      ctx.db.insert("users", { email: "owner@example.com" })
    );
    await t.run((ctx) => ensureDefaultUserRole(ctx, userId));

    await t.mutation(setByEmail, {
      email: " Owner@Example.COM ",
      role: "admin",
    });
    await t.mutation(setByEmail, {
      email: "owner@example.com",
      role: "user",
    });

    const roles = await t.run((ctx) => ctx.db.query("userRoles").collect());
    expect(roles).toHaveLength(1);
    expect(roles[0]).toMatchObject({ role: "user", userId });
  });

  test("rejects promotion for an unknown user", async () => {
    const t = convexTest(schema, modules);
    expect(
      t.mutation(setByEmail, {
        email: "missing@example.com",
        role: "admin",
      })
    ).rejects.toThrow("No user found for missing@example.com");
  });
});
