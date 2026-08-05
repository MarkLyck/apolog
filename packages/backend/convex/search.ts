import { normalizeSearchQuery } from "@apolog/shared/search";
import { v } from "convex/values";

import { query } from "./_generated/server";
import { articleTypeValidator, corpusKeyValidator } from "./validators";

export const keywordArticles = query({
  args: {
    corpusKey: corpusKeyValidator,
    limit: v.number(),
    query: v.string(),
    sort: v.optional(
      v.union(v.literal("newest"), v.literal("oldest"), v.literal("relevance"))
    ),
    type: v.optional(articleTypeValidator),
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
        return args.type
          ? scoped.eq("contentType", args.type).eq("status", "published")
          : scoped.eq("status", "published");
      });
    const hits = await search.take(Math.min(boundedLimit * 4, 96));
    const fetched = await Promise.all(
      hits.map((hit) => ctx.db.get(hit.articleId))
    );
    const normalizedLower = normalized.toLowerCase();
    const results = fetched.flatMap((article, relevanceRank) => {
      if (!article || article.status !== "published") {
        return [];
      }
      return [
        {
          article,
          exactTitle: article.title.toLowerCase() === normalizedLower,
          relevanceRank,
        },
      ];
    });
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
        Number(right.exactTitle) - Number(left.exactTitle) ||
        left.relevanceRank - right.relevanceRank
      );
    });
    return results.slice(0, boundedLimit).map(({ article }) => ({
      finding: article.finding,
      id: article._id,
      publishedAt: article.publishedAt ?? 0,
      readingMinutes: article.readingMinutes,
      slug: article.slug,
      summary: article.summary,
      tags: article.tags,
      title: article.title,
      type: article.type,
    }));
  },
});
