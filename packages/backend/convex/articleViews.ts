import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

export async function getAdjacentArticle(
  ctx: QueryCtx,
  placement: Doc<"articlePlacements">,
  direction: "previous" | "next"
) {
  const ranked = placement.collectionKey === "contradictions";
  const ascending = ranked ? direction === "next" : direction === "previous";
  const field = ranked ? "position" : "articleCreatedAt";
  const candidates = ctx.db
    .query("articlePlacements")
    .withIndex(
      ranked
        ? "by_corpus_collection_status_position"
        : "by_corpus_collection_status_created",
      (index) => {
        const scope = index
          .eq("corpusKey", placement.corpusKey)
          .eq("collectionKey", placement.collectionKey)
          .eq("status", "published");
        return ascending
          ? scope.gte(field, placement[field])
          : scope.lte(field, placement[field]);
      }
    )
    .filter((filter) =>
      filter.or(
        ascending
          ? filter.gt(filter.field(field), placement[field])
          : filter.lt(filter.field(field), placement[field]),
        filter.and(
          filter.eq(filter.field(field), placement[field]),
          ascending
            ? filter.gt(filter.field("_creationTime"), placement._creationTime)
            : filter.lt(filter.field("_creationTime"), placement._creationTime)
        )
      )
    )
    .order(ascending ? "asc" : "desc");

  for await (const candidate of candidates) {
    const article = await ctx.db.get(candidate.articleId);
    if (article?.status === "published") {
      return { slug: article.slug, title: article.title };
    }
  }
  return null;
}

type ArticleListProjection = Pick<
  Doc<"articlePlacements">,
  "collectionKey" | "comparisonReferences" | "position" | "tags"
>;

export function toPublishedArticleListItem(
  article: Doc<"articles"> | null,
  projection: ArticleListProjection
) {
  if (!article || article.status !== "published") {
    return null;
  }
  return {
    collectionKey: projection.collectionKey,
    comparisonReferences: projection.comparisonReferences,
    finding: article.finding,
    id: article._id,
    position: projection.position,
    publishedAt: article.publishedAt ?? 0,
    readingMinutes: article.readingMinutes,
    slug: article.slug,
    summary: article.summary,
    tags: projection.tags,
    title: article.title,
  };
}

export async function getArticleTagLabels(
  ctx: QueryCtx,
  articleId: Id<"articles">
) {
  const links = await ctx.db
    .query("articleTags")
    .withIndex("by_article", (index) => index.eq("articleId", articleId))
    .collect();
  return links.map((link) => link.tagLabel);
}
