import { v } from "convex/values";

import { query } from "./_generated/server";
import { corpusKeyValidator } from "./validators";

export const listEntries = query({
  args: { corpusKey: corpusKeyValidator },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("mapEntryCorpora")
      .withIndex("by_corpus_status", (index) =>
        index.eq("corpusKey", args.corpusKey).eq("status", "published")
      )
      .collect();
    return (
      await Promise.all(links.map((link) => ctx.db.get(link.mapEntryId)))
    ).filter((entry) => entry !== null);
  },
});

export const getEntryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("mapEntries")
      .withIndex("by_slug", (index) => index.eq("slug", args.slug))
      .unique();
    if (!entry || entry.status !== "published") {
      return null;
    }
    const links = await ctx.db
      .query("mapEntryCorpora")
      .withIndex("by_entry_corpus", (index) =>
        index.eq("mapEntryId", entry._id)
      )
      .collect();
    return { ...entry, corpusKeys: links.map((link) => link.corpusKey) };
  },
});

export const listAllPublished = query({
  args: {},
  handler: async (ctx) =>
    ctx.db
      .query("mapEntries")
      .filter((queryBuilder) =>
        queryBuilder.eq(queryBuilder.field("status"), "published")
      )
      .collect(),
});
