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
const search = makeFunctionReference<"query">("search:keywordArticles");

describe("published content queries", () => {
  test("uses Convex cursors for stable article pagination", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(seed, {});
    const first = await t.query(list, {
      corpusKey: "bible",
      paginationOpts: { cursor: null, numItems: 1 },
      sort: "newest",
      type: "evidence",
    });
    expect(first.page).toHaveLength(1);
    expect(first.isDone).toBe(false);
    const second = await t.query(list, {
      corpusKey: "bible",
      paginationOpts: { cursor: first.continueCursor, numItems: 1 },
      sort: "newest",
      type: "evidence",
    });
    expect(second.page).toHaveLength(1);
    expect(second.page[0]?._id).not.toBe(first.page[0]?._id);
  });

  test("returns one lean, canonical search result shape", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(seed, {});
    const results = await t.query(search, {
      corpusKey: "bible",
      limit: 12,
      query: "flood",
      sort: "relevance",
      type: "debunked",
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        readingMinutes: expect.any(Number),
        slug: expect.any(String),
        tags: expect.any(Array),
        type: "debunked",
      })
    );
    expect(results[0]).not.toHaveProperty("article");
    expect(results[0]).not.toHaveProperty("score");
  });
});
