import { api } from "@apolog/backend/api";
import type { ArticleListItem, CollectionKey, CorpusKey } from "@apolog/shared";
import { fetchQuery } from "convex/nextjs";

import {
  ARTICLE_LIST_PAGE_SIZE,
  type ArticleListBrowseSort,
} from "./article-list";

type SearchSort = "newest" | "oldest" | "relevance";
type ArticleListRequest =
  | { mode: "browse"; sort: ArticleListBrowseSort }
  | { mode: "search"; query: string; sort: SearchSort };

export type ArticleListPage = {
  articles: ArticleListItem[];
  continueCursor: string;
  isDone: boolean;
};

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

export async function listArticlePage(
  collectionKey: CollectionKey,
  corpusKey: CorpusKey,
  sort: ArticleListBrowseSort,
  cursor: string | null = null
): Promise<ArticleListPage> {
  const result = await fetchQuery(api.articles.list, {
    collectionKey,
    corpusKey,
    paginationOpts: { cursor, numItems: ARTICLE_LIST_PAGE_SIZE },
    sort,
  });
  return {
    articles: result.page,
    continueCursor: result.continueCursor,
    isDone: result.isDone,
  };
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
      ARTICLE_LIST_PAGE_SIZE,
      collectionKey,
      request.sort
    );
  }
  const result = await listArticlePage(collectionKey, corpusKey, request.sort);
  return result.articles;
}

export function getArticle(slug: string) {
  return fetchQuery(api.articles.getBySlug, { slug });
}

export function getFeatured(corpusKey: CorpusKey) {
  return fetchQuery(api.home.getFeatured, { corpusKey });
}
