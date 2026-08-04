import { describe, expect, test } from "bun:test";

import { convexTest } from "convex-test";
import { makeFunctionReference } from "convex/server";

import schema from "./schema";

const modules = {
  "./_generated/server.js": () => import("./_generated/server.js"),
  "./seed.ts": () => import("./seed"),
};
const seed = makeFunctionReference<"mutation">("seed:seed");

describe("demo seed mutation", () => {
  test("is repeatable without replacing stable article identities", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(seed, {});
    const before = await t.run(async (ctx) =>
      ctx.db.query("articles").collect()
    );

    await t.mutation(seed, {});
    const after = await t.run(async (ctx) =>
      ctx.db.query("articles").collect()
    );

    expect(after.map((article) => article._id).sort()).toEqual(
      before.map((article) => article._id).sort()
    );
  });

  test("does not delete records outside the fixture projection", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(seed, {});
    const article = await t.run(async (ctx) =>
      ctx.db.query("articles").first()
    );
    if (!article) {
      throw new Error("Expected a seeded article");
    }
    const { _creationTime: _createdAt, _id, ...articleValue } = article;
    const manualArticleId = await t.run(async (ctx) =>
      ctx.db.insert("articles", {
        ...articleValue,
        importKey: "manual:article:preserve-me",
        slug: "preserve-me",
        title: "Preserve manually managed content",
      })
    );

    await t.mutation(seed, {});

    expect(await t.run((ctx) => ctx.db.get(manualArticleId))).not.toBeNull();
    expect(await t.run((ctx) => ctx.db.get(article._id))).not.toBeNull();
  });
});
