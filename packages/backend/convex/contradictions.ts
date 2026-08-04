import { v } from "convex/values";

import { query } from "./_generated/server";
import { corpusKeyValidator } from "./validators";

export const list = query({
  args: {
    corpusKey: corpusKeyValidator,
    limit: v.optional(v.number()),
    query: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const normalizedQuery = args.query?.trim();
    if (normalizedQuery) {
      const matches = await ctx.db
        .query("contradictions")
        .withSearchIndex("search_contradictions", (search) =>
          search
            .search("searchText", normalizedQuery)
            .eq("corpusKey", args.corpusKey)
            .eq("status", "published")
        )
        .take(Math.min(args.limit ?? 200, 200));
      return matches.sort((left, right) => left.rank - right.rank);
    }
    return ctx.db
      .query("contradictions")
      .withIndex("by_corpus_status_rank", (index) =>
        index.eq("corpusKey", args.corpusKey).eq("status", "published")
      )
      .order("asc")
      .take(args.limit ?? 24);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("contradictions")
      .withIndex("by_slug", (index) => index.eq("slug", args.slug))
      .unique();
    return item?.status === "published" ? item : null;
  },
});
