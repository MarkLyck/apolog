import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

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
