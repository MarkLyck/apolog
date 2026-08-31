"use client";

import type { ArticleListItem, CollectionKey, CorpusKey } from "@apolog/shared";
import { useState } from "react";

import {
  browseListStatus,
  parsePaginatedArticleListResponse,
  type ArticleListBrowseSort,
} from "@/lib/article-list";

import { ArticleCard } from "./article-card";
import { ContradictionCard } from "./contradiction-card";

const loadMoreClassName =
  "min-h-12 rounded-full bg-[var(--ink)] px-6 text-sm font-bold text-[var(--paper)] transition hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60";

function ArticleListGrid({
  articles,
  corpusKey,
  variant,
}: {
  articles: ArticleListItem[];
  corpusKey: CorpusKey;
  variant: "article" | "contradiction";
}) {
  switch (variant) {
    case "article": {
      return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard
              article={article}
              corpusKey={corpusKey}
              key={article.slug}
            />
          ))}
        </div>
      );
    }
    case "contradiction": {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {articles.map((article) => (
            <ContradictionCard
              article={article}
              corpusKey={corpusKey}
              key={article.slug}
            />
          ))}
        </div>
      );
    }
    default: {
      const exhaustive: never = variant;
      return exhaustive;
    }
  }
}

function EmptyList({ variant }: { variant: "article" | "contradiction" }) {
  switch (variant) {
    case "article": {
      return (
        <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] p-12 text-center">
          <h2 className="text-3xl">No published matches</h2>
          <p className="mx-auto mt-3 max-w-lg text-[var(--muted)]">
            Try a broader query or clear the search. Results never borrow
            records from the other corpus.
          </p>
        </div>
      );
    }
    case "contradiction": {
      return (
        <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] p-12 text-center">
          <h2 className="text-3xl">No published comparisons</h2>
          <p className="mx-auto mt-3 max-w-lg text-[var(--muted)]">
            This corpus does not have published contradictions yet.
          </p>
        </div>
      );
    }
    default: {
      const exhaustive: never = variant;
      return exhaustive;
    }
  }
}

export function PaginatedArticleList({
  aside,
  collectionKey,
  continueCursor,
  corpusKey,
  isDone,
  noun,
  page,
  sort,
  variant,
}: {
  aside?: string;
  collectionKey: CollectionKey;
  continueCursor: string;
  corpusKey: CorpusKey;
  isDone: boolean;
  noun: { plural: string; singular: string };
  page: ArticleListItem[];
  sort: ArticleListBrowseSort;
  variant: "article" | "contradiction";
}) {
  const [articles, setArticles] = useState(page);
  const [cursor, setCursor] = useState(continueCursor);
  const [complete, setComplete] = useState(isDone);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleLoadMore() {
    setError(null);
    setIsPending(true);
    try {
      const params = new URLSearchParams({
        collection: collectionKey,
        cursor,
        sort,
        text: corpusKey,
      });
      const response = await fetch(`/api/articles/list?${params}`);
      if (!response.ok) {
        throw new Error(`List request failed with ${response.status}`);
      }
      const next = parsePaginatedArticleListResponse(await response.json());
      if (next === null) {
        throw new Error("List returned an invalid response");
      }
      setArticles((current) => {
        const seen = new Set(current.map((article) => article.id));
        return [
          ...current,
          ...next.articles.filter((article) => !seen.has(article.id)),
        ];
      });
      setCursor(next.continueCursor);
      setComplete(next.isDone);
    } catch {
      setError("Could not load more articles. Try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <div className="mb-8 mt-5 flex items-center justify-between text-sm text-[var(--muted)]">
        <p aria-live="polite">
          {browseListStatus({
            isDone: complete,
            noun,
            shown: articles.length,
          })}
        </p>
        {aside ? <p className="hidden md:block">{aside}</p> : null}
      </div>
      {articles.length === 0 ? (
        <EmptyList variant={variant} />
      ) : (
        <ArticleListGrid
          articles={articles}
          corpusKey={corpusKey}
          variant={variant}
        />
      )}
      {complete ? null : (
        <div className="mt-10 flex flex-col items-center gap-3 pb-4">
          <button
            className={loadMoreClassName}
            disabled={isPending}
            onClick={handleLoadMore}
            type="button"
          >
            {isPending ? "Loading more…" : "Load more"}
          </button>
          {error ? (
            <p className="text-sm text-[var(--muted)]" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      )}
    </>
  );
}
