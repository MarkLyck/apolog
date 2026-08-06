import { api } from "@apolog/backend/api";
import type { ArticleListItem, CollectionKey, CorpusKey } from "@apolog/shared";
import { fetchQuery } from "convex/nextjs";

type SearchSort = "newest" | "oldest" | "relevance";
type ArticleListRequest =
  | { mode: "browse"; sort: "newest" | "oldest" | "ranked" }
  | { mode: "search"; query: string; sort: SearchSort };

export async function searchArticles(
  corpusKey: CorpusKey,
  query: string,
  limit = 12,
  collectionKey?: CollectionKey,
  sort: SearchSort = "relevance"
): Promise<ArticleListItem[]> {
  if (!query.trim()) {
    return [];
  }
  return fetchQuery(api.search.keywordArticles, {
    corpusKey,
    limit,
    query,
    sort,
    collectionKey,
  });
}

export async function listArticles(
  collectionKey: CollectionKey,
  corpusKey: CorpusKey,
  request: ArticleListRequest
): Promise<ArticleListItem[]> {
  if (request.mode === "search") {
    return searchArticles(
      corpusKey,
      request.query,
      24,
      collectionKey,
      request.sort
    );
  }
  const result = await fetchQuery(api.articles.list, {
    collectionKey,
    corpusKey,
    paginationOpts: { cursor: null, numItems: 24 },
    sort: request.sort,
  });
  return result.page;
}

export function getArticle(slug: string) {
  return fetchQuery(api.articles.getBySlug, { slug });
}

export function getFeatured(corpusKey: CorpusKey) {
  return fetchQuery(api.home.getFeatured, { corpusKey });
}
