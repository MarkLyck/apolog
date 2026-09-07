import type { ArticleListItem } from "@apolog/shared";
import type { PaginationResult } from "convex/server";

export function mergeArticlePage(
  previous: PaginationResult<ArticleListItem>,
  next: PaginationResult<ArticleListItem>
): PaginationResult<ArticleListItem> {
  const seen = new Set(previous.page.map((article) => article.id));
  return {
    ...next,
    page: [
      ...previous.page,
      ...next.page.filter((article) => !seen.has(article.id)),
    ],
  };
}
