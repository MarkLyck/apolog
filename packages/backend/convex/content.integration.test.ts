import { describe, expect, test } from "bun:test";

import { convexTest } from "convex-test";
import type { FunctionReturnType } from "convex/server";
import { makeFunctionReference } from "convex/server";

import { api } from "./_generated/api";
import schema from "./schema";

const modules = {
  "./_generated/server.js": () => import("./_generated/server.js"),
  "./articles.ts": () => import("./articles"),
  "./search.ts": () => import("./search"),
  "./seed.ts": () => import("./seed"),
};
const seed = makeFunctionReference<"mutation">("seed:seed");
const list = makeFunctionReference<"query">("articles:list");
const getBySlug = makeFunctionReference<"query">("articles:getBySlug");
const search = makeFunctionReference<"query">("search:keywordArticles");

describe("published content queries", () => {
  test("counts the full collection and paginates hundreds of search matches", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(seed, {});
    await t.run(async (ctx) => {
      const original = await ctx.db
        .query("articles")
        .withIndex("by_slug", (q) => q.eq("slug", "who-incited-davids-census"))
        .unique();
      if (!original) {
        throw new Error("Missing seeded contradiction");
      }
      const placement = await ctx.db
        .query("articlePlacements")
        .withIndex("by_article", (q) => q.eq("articleId", original._id))
        .first();
      const searchDoc = await ctx.db
        .query("searchDocuments")
        .withIndex("by_article", (q) => q.eq("articleId", original._id))
        .first();
      if (!placement || !searchDoc) {
        throw new Error("Missing seeded projections");
      }
      for (let index = 0; index < 250; index += 1) {
        const { _id, _creationTime, ...fields } = original;
        const articleId = await ctx.db.insert("articles", {
          ...fields,
          slug: `count-test-${index}`,
          importKey: `count-test-${index}`,
        });
        const {
          _id: _placementId,
          _creationTime: _placementTime,
          ...placementFields
        } = placement;
        await ctx.db.insert("articlePlacements", {
          ...placementFields,
          articleId,
          position: index + 100,
        });
        const {
          _id: _searchId,
          _creationTime: _searchTime,
          ...searchFields
        } = searchDoc;
        await ctx.db.insert("searchDocuments", {
          ...searchFields,
          articleId,
          searchText: "paginationprobe",
        });
      }
    });
    const total = await t.query(api.articles.count, {
      collectionKey: "contradictions",
      corpusKey: "bible",
    });
    expect(total).toBeGreaterThanOrEqual(251);
    const ids = new Set<string>();
    let cursor: string | null = null;
    for (;;) {
      const result: FunctionReturnType<typeof api.search.collectionPage> =
        await t.query(api.search.collectionPage, {
          collectionKey: "contradictions",
          corpusKey: "bible",
          query: "paginationprobe",
          paginationOpts: { cursor, numItems: 24 },
        });
      for (const item of result.page) {
        expect(ids.has(item.id)).toBe(false);
        ids.add(item.id);
      }
      if (result.isDone) {
        break;
      }
      expect(result.continueCursor).not.toBe(cursor);
      cursor = result.continueCursor;
    }
    expect(ids.size).toBe(250);
  });

  test("uses Convex cursors for collection pagination", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(seed, {});
    const first = await t.query(list, {
      collectionKey: "evidence",
      corpusKey: "bible",
      paginationOpts: { cursor: null, numItems: 1 },
      sort: "newest",
    });
    expect(first.page).toHaveLength(1);
    expect(first.isDone).toBe(false);
    const second = await t.query(list, {
      collectionKey: "evidence",
      corpusKey: "bible",
      paginationOpts: { cursor: first.continueCursor, numItems: 1 },
      sort: "newest",
    });
    expect(second.page).toHaveLength(1);
    expect(second.page[0]?.id).not.toBe(first.page[0]?.id);
  });

  test("gets every content shape through one global article slug", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(seed, {});
    const article = await t.query(getBySlug, {
      slug: "who-incited-davids-census",
    });
    expect(article?.placements[0]).toEqual(
      expect.objectContaining({ collectionKey: "contradictions", position: 1 })
    );
    expect(article?.document.blocks[0]?.type).toBe("claimComparison");
  });

  test("returns one lean, canonical search result shape", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(seed, {});
    const results = await t.query(search, {
      collectionKey: "debunked",
      corpusKey: "bible",
      limit: 12,
      query: "flood",
      sort: "relevance",
    });
    expect(results[0]).toEqual(
      expect.objectContaining({
        collectionKey: "debunked",
        id: expect.any(String),
        readingMinutes: expect.any(Number),
        slug: expect.any(String),
        tags: expect.any(Array),
      })
    );
    expect(results[0]).not.toHaveProperty("article");
    expect(results[0]).not.toHaveProperty("score");
  });

  test("keeps contradiction card metadata in the canonical search projection", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(seed, {});
    const [result] = await t.query(search, {
      collectionKey: "contradictions",
      corpusKey: "bible",
      limit: 12,
      query: "census",
      sort: "relevance",
    });
    expect(result?.comparisonReferences).toEqual([
      "2 Samuel 24:1",
      "1 Chronicles 21:1",
    ]);
    expect(result?.tags).toContain("contradiction");
  });
});
