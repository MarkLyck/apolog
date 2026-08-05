import { query } from "./_generated/server";
import { corpusKeyValidator } from "./validators";

export const getFeatured = query({
  args: { corpusKey: corpusKeyValidator },
  handler: async (ctx, args) => {
    const contradictions = await ctx.db
      .query("contradictions")
      .withIndex("by_corpus_status_rank", (index) =>
        index.eq("corpusKey", args.corpusKey).eq("status", "published")
      )
      .order("asc")
      .take(2);
    const articleLinks = await ctx.db
      .query("articleCorpora")
      .withIndex("by_corpus_type_status_created", (index) =>
        index
          .eq("corpusKey", args.corpusKey)
          .eq("articleType", "evidence")
          .eq("status", "published")
      )
      .order("desc")
      .take(2);
    const articles = (
      await Promise.all(articleLinks.map((link) => ctx.db.get(link.articleId)))
    ).filter((article) => article !== null);
    return { articles, contradictions };
  },
});
