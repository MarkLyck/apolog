import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { query } from "./_generated/server";
import {
  getArticleTagLabels,
  toPublishedArticleListItem,
} from "./articleViews";
import { collectionKeyValidator, corpusKeyValidator } from "./validators";

export const list = query({
  args: {
    collectionKey: collectionKeyValidator,
    corpusKey: corpusKeyValidator,
    paginationOpts: paginationOptsValidator,
    sort: v.union(
      v.literal("newest"),
      v.literal("oldest"),
      v.literal("ranked")
    ),
  },
  handler: async (ctx, args) => {
    const base =
      args.sort === "ranked"
        ? ctx.db
            .query("articlePlacements")
            .withIndex("by_corpus_collection_status_position", (index) =>
              index
                .eq("corpusKey", args.corpusKey)
                .eq("collectionKey", args.collectionKey)
                .eq("status", "published")
            )
        : ctx.db
            .query("articlePlacements")
            .withIndex("by_corpus_collection_status_created", (index) =>
              index
                .eq("corpusKey", args.corpusKey)
                .eq("collectionKey", args.collectionKey)
                .eq("status", "published")
            );
    const projections = await base
      .order(
        args.sort === "oldest" ? "asc" : args.sort === "newest" ? "desc" : "asc"
      )
      .paginate(args.paginationOpts);
    const page = await Promise.all(
      projections.page.map(async (placement) =>
        toPublishedArticleListItem(
          await ctx.db.get(placement.articleId),
          placement
        )
      )
    );
    return {
      ...projections,
      page: page.filter((article) => article !== null),
    };
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const article = await ctx.db
      .query("articles")
      .withIndex("by_slug", (index) => index.eq("slug", args.slug))
      .unique();
    if (!article || article.status !== "published") {
      return null;
    }
    const placements = (
      await ctx.db
        .query("articlePlacements")
        .withIndex("by_article", (index) => index.eq("articleId", article._id))
        .collect()
    )
      .filter((placement) => placement.status === "published")
      .sort(
        (left, right) =>
          left.corpusKey.localeCompare(right.corpusKey) ||
          Number(right.isPrimary) - Number(left.isPrimary) ||
          left.collectionKey.localeCompare(right.collectionKey)
      );
    if (placements.length === 0) {
      return null;
    }
    return {
      ...article,
      corpusKeys: [...new Set(placements.map((item) => item.corpusKey))],
      placements: placements.map(
        ({ collectionKey, corpusKey, isPrimary, position }) => ({
          collectionKey,
          corpusKey,
          isPrimary,
          position,
        })
      ),
      tags: await getArticleTagLabels(ctx, article._id),
    };
  },
});
