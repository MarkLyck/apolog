import { query } from "./_generated/server";
import { toPublishedArticleListItem } from "./articleViews";
import { corpusKeyValidator } from "./validators";

export const getFeatured = query({
  args: { corpusKey: corpusKeyValidator },
  handler: async (ctx, args) => {
    const [contradictionPlacements, evidencePlacements] = await Promise.all([
      ctx.db
        .query("articlePlacements")
        .withIndex("by_corpus_collection_status_position", (index) =>
          index
            .eq("corpusKey", args.corpusKey)
            .eq("collectionKey", "contradictions")
            .eq("status", "published")
        )
        .order("asc")
        .take(2),
      ctx.db
        .query("articlePlacements")
        .withIndex("by_corpus_collection_status_created", (index) =>
          index
            .eq("corpusKey", args.corpusKey)
            .eq("collectionKey", "evidence")
            .eq("status", "published")
        )
        .order("desc")
        .take(2),
    ]);
    const hydrate = async (placement: (typeof evidencePlacements)[number]) =>
      toPublishedArticleListItem(
        await ctx.db.get(placement.articleId),
        placement
      );
    const [articles, contradictions] = await Promise.all([
      Promise.all(evidencePlacements.map(hydrate)),
      Promise.all(contradictionPlacements.map(hydrate)),
    ]);
    return {
      articles: articles.filter((article) => article !== null),
      contradictions: contradictions.filter((article) => article !== null),
    };
  },
});
