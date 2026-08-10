import { describe, expect, test } from "bun:test";

import { convexTest } from "convex-test";
import { makeFunctionReference } from "convex/server";

import schema from "./schema";

const modules = {
  "./_generated/server.js": () => import("./_generated/server.js"),
  "./articles.ts": () => import("./articles"),
};
const save = makeFunctionReference<"mutation">("articles:save");
const remove = makeFunctionReference<"mutation">("articles:remove");

const validInput = {
  document: {
    blocks: [
      {
        content: [{ id: "intro-text", text: "A valid article.", type: "text" }],
        id: "intro",
        type: "paragraph",
      },
    ],
    schemaVersion: 1,
  },
  placements: [
    {
      collectionKey: "evidence",
      corpusKey: "bible",
      isPrimary: true,
      position: 0,
    },
  ],
  readingMinutes: 1,
  slug: "valid-article",
  sources: [],
  status: "draft",
  summary: "A useful summary.",
  tags: ["evidence"],
  title: "Valid article",
} as const;

async function setupUser(role: "admin" | "user") {
  const t = convexTest(schema, modules);
  const userId = await t.run((ctx) =>
    ctx.db.insert("users", { email: `${role}@example.com` })
  );
  await t.run((ctx) => ctx.db.insert("userRoles", { role, userId }));
  return { authenticated: t.withIdentity({ subject: `${userId}|session` }), t };
}

describe("article management", () => {
  test("requires an authenticated administrator", async () => {
    const anonymous = convexTest(schema, modules);
    expect(anonymous.mutation(save, validInput)).rejects.toThrow(
      "Sign in to manage articles"
    );

    const { authenticated } = await setupUser("user");
    expect(authenticated.mutation(save, validInput)).rejects.toThrow(
      "Administrator access is required"
    );
  });

  test("rejects documents that fail the canonical shared schema", async () => {
    const { authenticated } = await setupUser("admin");
    expect(
      authenticated.mutation(save, {
        ...validInput,
        document: { blocks: [], schemaVersion: 1 },
      })
    ).rejects.toThrow("Article content is invalid");
  });

  test("rebuilds projections, rejects stale saves, and cascades deletion", async () => {
    const { authenticated, t } = await setupUser("admin");
    const created = await authenticated.mutation(save, validInput);
    expect(created.version).toBe(1);

    const relations = await t.run(async (ctx) => ({
      placements: await ctx.db.query("articlePlacements").collect(),
      searches: await ctx.db.query("searchDocuments").collect(),
      tags: await ctx.db.query("articleTags").collect(),
    }));
    expect(relations.placements).toHaveLength(1);
    expect(relations.searches[0]?.searchText).toContain("valid article");
    expect(relations.tags).toHaveLength(1);

    expect(
      authenticated.mutation(save, {
        ...validInput,
        expectedVersion: 0,
        id: created.id,
      })
    ).rejects.toThrow("changed after you opened it");

    const updated = await authenticated.mutation(save, {
      ...validInput,
      expectedVersion: 1,
      id: created.id,
      title: "Updated article",
    });
    expect(updated.version).toBe(2);

    expect(await authenticated.mutation(remove, { id: created.id })).toEqual({
      deleted: true,
    });
    const remaining = await t.run(async (ctx) => ({
      article: await ctx.db.get(created.id),
      placements: await ctx.db.query("articlePlacements").collect(),
      searches: await ctx.db.query("searchDocuments").collect(),
      tags: await ctx.db.query("articleTags").collect(),
    }));
    expect(remaining).toEqual({
      article: null,
      placements: [],
      searches: [],
      tags: [],
    });
  });
});
