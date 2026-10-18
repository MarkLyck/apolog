import { describe, expect, mock, test } from "bun:test";

import type { FunctionReference } from "convex/server";
import * as Effect from "effect/Effect";

const pageSize = 2;
const totalPerList = 5;

mock.module("convex/nextjs", () => ({
  fetchQuery: (
    _query: FunctionReference<"query">,
    args: {
      collectionKey: string;
      corpusKey: string;
      paginationOpts: { cursor: string | null };
    }
  ) => {
    const start = Number(args.paginationOpts.cursor ?? 0);
    const end = Math.min(start + pageSize, totalPerList);
    return Promise.resolve({
      continueCursor: String(end),
      isDone: end === totalPerList,
      page: Array.from({ length: end - start }, (_, index) => ({
        slug: `${args.collectionKey}-${args.corpusKey}-${start + index}`,
      })),
    });
  },
}));

const { listArticlesByCollection } = await import("./data");

describe("listArticlesByCollection", () => {
  test("reads every page of every collection and corpus", async () => {
    const collections = await Effect.runPromise(
      listArticlesByCollection(() => "newest")
    );
    for (const { articles } of collections) {
      expect(articles).toHaveLength(totalPerList * 2);
    }
  });
});
