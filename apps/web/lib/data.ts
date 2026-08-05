import { api } from "@apolog/backend/api";
import type {
  ArticleSearchResult,
  ArticleType,
  CorpusKey,
} from "@apolog/shared";
import { fetchQuery } from "convex/nextjs";

type Sort = "newest" | "oldest" | "relevance";

export async function searchArticles(
  corpusKey: CorpusKey,
  query: string,
  limit = 12,
  type?: ArticleType,
  sort: Sort = "relevance"
): Promise<ArticleSearchResult[]> {
  if (!query.trim()) {
    return [];
  }
  return fetchQuery(api.search.keywordArticles, {
    corpusKey,
    limit,
    query,
    sort,
    type,
  });
}

export async function listArticles(
  type: ArticleType,
  corpusKey: CorpusKey,
  query = "",
  sort: Sort = query ? "relevance" : "newest"
) {
  if (query.trim()) {
    return searchArticles(corpusKey, query, 24, type, sort);
  }
  const result = await fetchQuery(api.articles.list, {
    corpusKey,
    paginationOpts: { cursor: null, numItems: 24 },
    sort: sort === "oldest" ? "oldest" : "newest",
    type,
  });
  return result.page;
}

export function getArticle(type: ArticleType, slug: string) {
  return fetchQuery(api.articles.getBySlug, { slug, type });
}

export function listContradictions(corpusKey: CorpusKey, query = "") {
  return fetchQuery(api.contradictions.list, {
    corpusKey,
    limit: 24,
    query: query || undefined,
  });
}

export function getContradiction(slug: string) {
  return fetchQuery(api.contradictions.getBySlug, { slug });
}

export function getFeatured(corpusKey: CorpusKey) {
  return fetchQuery(api.home.getFeatured, { corpusKey });
}
