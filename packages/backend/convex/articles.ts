import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { articleTypeValidator, corpusKeyValidator } from "./validators";

export const list = query({
  args: {
    corpusKey: corpusKeyValidator,
    paginationOpts: paginationOptsValidator,
    sort: v.union(v.literal("newest"), v.literal("oldest")),
    type: articleTypeValidator,
  },
  handler: async (ctx, args) => {
    const projections = await ctx.db
      .query("articleCorpora")
      .withIndex("by_corpus_type_status_created", (index) =>
        index
          .eq("corpusKey", args.corpusKey)
          .eq("articleType", args.type)
          .eq("status", "published")
      )
      .order(args.sort === "oldest" ? "asc" : "desc")
      .paginate(args.paginationOpts);
    const page = (
      await Promise.all(
        projections.page.map((projection) => ctx.db.get(projection.articleId))
      )
    ).filter(
      (article): article is Doc<"articles"> =>
        article !== null && article.status === "published"
    );
    return { ...projections, page };
  },
});

export const getBySlug = query({
  args: { slug: v.string(), type: articleTypeValidator },
  handler: async (ctx, args) => {
    const article = await ctx.db
      .query("articles")
      .withIndex("by_type_slug", (index) =>
        index.eq("type", args.type).eq("slug", args.slug)
      )
      .unique();
    if (!article || article.status !== "published") {
      return null;
    }
    const links = await ctx.db
      .query("articleCorpora")
      .withIndex("by_article_corpus", (index) =>
        index.eq("articleId", article._id)
      )
      .collect();
    return { ...article, corpusKeys: links.map((link) => link.corpusKey) };
  },
});
