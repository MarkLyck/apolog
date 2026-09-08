"use client";

import type { ArticleListItem, CorpusKey } from "@apolog/shared";
import type { PaginationResult } from "convex/server";
import { useCallback, useEffect, useRef, useState } from "react";

import { loadContradictions } from "@/app/contradictions/actions";
import { ContradictionCard } from "@/components/contradiction-card";
import { mergeArticlePage } from "@/lib/article-pagination";

export function ContradictionList({
  corpusKey,
  initialPage,
  query = "",
  totalCount,
}: {
  corpusKey: CorpusKey;
  query?: string;
  totalCount: number;
  initialPage: PaginationResult<ArticleListItem>;
}) {
  const [result, setResult] = useState(initialPage);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const pending = useRef(false);
  const sentinel = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (pending.current || result.isDone) {
      return;
    }
    pending.current = true;
    setStatus("loading");
    try {
      const next = await loadContradictions({
        corpusKey,
        query,
        cursor: result.continueCursor,
      });
      setResult((previous) => mergeArticlePage(previous, next));
      setStatus("idle");
    } catch {
      setStatus("error");
    } finally {
      pending.current = false;
    }
  }, [corpusKey, query, result.continueCursor, result.isDone]);

  useEffect(() => {
    if (result.isDone || status !== "idle" || !sentinel.current) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      { rootMargin: "600px" }
    );
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [loadMore, result.isDone, status]);

  return (
    <>
      <div className="collection-results" aria-live="polite">
        {totalCount} ranked {totalCount === 1 ? "comparison" : "comparisons"}
        {query && result.isDone && (
          <>
            {" "}
            · {result.page.length} matching{" "}
            {result.page.length === 1 ? "comparison" : "comparisons"}
          </>
        )}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {result.page.map((article) => (
          <ContradictionCard
            article={article}
            corpusKey={corpusKey}
            key={article.id}
          />
        ))}
      </div>
      {!result.isDone && (
        <div className="mt-8 text-center" ref={sentinel}>
          {status === "error" && (
            <p className="mb-3 text-sm text-[var(--muted)]" role="alert">
              Could not load more comparisons. Please try again.
            </p>
          )}
          <button
            className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-6 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] disabled:opacity-60"
            disabled={status === "loading"}
            onClick={loadMore}
            type="button"
          >
            {status === "loading"
              ? "Loading comparisons…"
              : "Load more comparisons"}
          </button>
        </div>
      )}
    </>
  );
}
