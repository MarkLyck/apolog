import { describe, expect, test } from "bun:test";

import { convexTest } from "convex-test";
import { makeFunctionReference } from "convex/server";

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
