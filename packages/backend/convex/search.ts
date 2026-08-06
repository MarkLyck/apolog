import { normalizeSearchQuery } from "@apolog/shared/search";
import { v } from "convex/values";

import { query } from "./_generated/server";
import { toPublishedArticleListItem } from "./articleViews";
import { collectionKeyValidator, corpusKeyValidator } from "./validators";

export const keywordArticles = query({
  args: {
    collectionKey: v.optional(collectionKeyValidator),
    corpusKey: corpusKeyValidator,
    limit: v.number(),
    query: v.string(),
    sort: v.optional(
      v.union(v.literal("newest"), v.literal("oldest"), v.literal("relevance"))
    ),
  },
  handler: async (ctx, args) => {
    const normalized = normalizeSearchQuery(args.query);
    if (!normalized) {
      return [];
    }
    const boundedLimit = Math.max(1, Math.min(Math.floor(args.limit), 24));
    const search = ctx.db
      .query("searchDocuments")
      .withSearchIndex("search_articles", (index) => {
        const scoped = index
          .search("searchText", normalized)
          .eq("corpusKey", args.corpusKey);
        return args.collectionKey
          ? scoped
              .eq("collectionKey", args.collectionKey)
              .eq("status", "published")
          : scoped.eq("status", "published");
      });
    const hits = await search.take(Math.min(boundedLimit * 6, 120));
    const seen = new Set<string>();
    const uniqueHits = hits.filter((hit) => {
      if (seen.has(hit.articleId)) {
        return false;
      }
      seen.add(hit.articleId);
      return true;
    });
    const fetched = await Promise.all(
      uniqueHits.map(async (hit, relevanceRank) => ({
        article: await ctx.db.get(hit.articleId),
        hit,
        relevanceRank,
      }))
    );
    const normalizedLower = normalized.toLowerCase();
    const results = fetched.flatMap(({ article, hit, relevanceRank }) =>
      article?.status === "published" ? [{ article, hit, relevanceRank }] : []
    );
    results.sort((left, right) => {
      if (args.sort === "oldest") {
        return (
          (left.article.publishedAt ?? 0) - (right.article.publishedAt ?? 0)
        );
      }
      if (args.sort === "newest") {
        return (
          (right.article.publishedAt ?? 0) - (left.article.publishedAt ?? 0)
        );
      }
      return (
        Number(right.article.title.toLowerCase() === normalizedLower) -
          Number(left.article.title.toLowerCase() === normalizedLower) ||
        left.relevanceRank - right.relevanceRank
      );
    });
    return results
      .slice(0, boundedLimit)
      .map(({ article, hit }) => toPublishedArticleListItem(article, hit))
      .filter((article) => article !== null);
  },
});
