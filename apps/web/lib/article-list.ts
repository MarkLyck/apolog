export const ARTICLE_LIST_PAGE_SIZE = 24;

export type ArticleListBrowseSort = "newest" | "oldest" | "ranked";

export function parseArticleListBrowseSort(
  value: string
): ArticleListBrowseSort | null {
  if (value === "newest" || value === "oldest" || value === "ranked") {
    return value;
  }
  return null;
}

export function browseListStatus({
  isDone,
  noun,
  shown,
}: {
  isDone: boolean;
  noun: { plural: string; singular: string };
  shown: number;
}) {
  const label = shown === 1 ? noun.singular : noun.plural;
  return isDone ? `${shown} ${label}` : `Showing ${shown} ${label}`;
}

export function searchListStatus({
  noun,
  query,
  shown,
}: {
  noun: { plural: string; singular: string };
  query: string;
  shown: number;
}) {
  const label = shown === 1 ? noun.singular : noun.plural;
  return `${shown} ${label} for “${query}”`;
}

export function searchReachedCap(shown: number) {
  return shown >= ARTICLE_LIST_PAGE_SIZE;
}
