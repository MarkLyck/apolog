import { describe, expect, test } from "bun:test";

import { convexTest } from "convex-test";
import { makeFunctionReference } from "convex/server";

import schema from "./schema";

const modules = {
  "./_generated/server.js": () => import("./_generated/server.js"),
  "./rateLimits.ts": () => import("./rateLimits"),
};
const consume = makeFunctionReference<"mutation">("rateLimits:consume");

describe("durable rate limiter", () => {
  test("atomically rejects requests after the shared limit", async () => {
    const t = convexTest(schema, modules);
    const decisions = [];
    for (let attempt = 0; attempt < 13; attempt += 1) {
      decisions.push(await t.mutation(consume, { key: "a".repeat(64) }));
    }
    expect(decisions.slice(0, 12).every((decision) => decision.allowed)).toBe(
      true
    );
    expect(decisions[12]?.allowed).toBe(false);
    expect(
      await t.run(
        async (ctx) => (await ctx.db.query("rateLimits").collect()).length
      )
    ).toBe(1);
  });
});
