import { api } from "@apolog/backend/api";
import type { Id } from "@apolog/backend/data-model";
import type { CollectionKey, CorpusKey } from "@apolog/shared";
import { fetchQuery } from "convex/nextjs";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";

type SearchSort = "newest" | "oldest" | "relevance";
type ArticleListRequest =
  | { mode: "browse"; sort: "newest" | "oldest" | "ranked" }
  | { mode: "search"; query: string; sort: SearchSort };

class ArticleQueryError extends Data.TaggedError("ArticleQueryError")<{
  operation: string;
  cause: unknown;
}> {}

export function searchArticles(
  corpusKey: CorpusKey,
  query: string,
  limit = 12,
  collectionKey?: CollectionKey,
  sort: SearchSort = "relevance"
) {
  if (!query.trim()) {
    return Effect.succeed([]);
  }
  return Effect.tryPromise({
    try: () =>
      fetchQuery(api.search.keywordArticles, {
        corpusKey,
        limit,
        query,
        sort,
        collectionKey,
      }),
    catch: (cause) => new ArticleQueryError({ cause, operation: "search" }),
  });
}

export function listArticles(
  collectionKey: CollectionKey,
  corpusKey: CorpusKey,
  request: ArticleListRequest
) {
  if (request.mode === "search") {
    return searchArticles(
      corpusKey,
      request.query,
      24,
      collectionKey,
      request.sort
    );
  }
  return Effect.tryPromise({
    try: () =>
      fetchQuery(api.articles.list, {
        collectionKey,
        corpusKey,
        paginationOpts: { cursor: null, numItems: 24 },
        sort: request.sort,
      }),
    catch: (cause) => new ArticleQueryError({ cause, operation: "list" }),
  }).pipe(Effect.map((result) => result.page));
}

export function getArticle(slug: string) {
  return Effect.tryPromise({
    try: () => fetchQuery(api.articles.getBySlug, { slug }),
    catch: (cause) => new ArticleQueryError({ cause, operation: "article" }),
  });
}

export function getAdjacentArticles(
  articleId: Id<"articles">,
  collectionKey: CollectionKey,
  corpusKey: CorpusKey
) {
  return Effect.tryPromise({
    try: () =>
      fetchQuery(api.articles.getAdjacent, {
        articleId,
        collectionKey,
        corpusKey,
      }),
    catch: (cause) => new ArticleQueryError({ cause, operation: "adjacent" }),
  });
}

export function getFeatured(corpusKey: CorpusKey) {
  return Effect.tryPromise({
    try: () => fetchQuery(api.home.getFeatured, { corpusKey }),
    catch: (cause) => new ArticleQueryError({ cause, operation: "featured" }),
  });
}
