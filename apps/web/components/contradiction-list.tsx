"use client";

import type { ArticleListItem, CorpusKey } from "@apolog/shared";
import type { PaginationResult } from "convex/server";
import { useCallback, useEffect, useRef, useState } from "react";

import { loadContradictions } from "@/app/contradictions/actions";
import { ContradictionCard } from "@/components/contradiction-card";

export function ContradictionList({
  corpusKey,
  initialPage,
}: {
  corpusKey: CorpusKey;
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
        cursor: result.continueCursor,
      });
      setResult((previous) => {
        const seen = new Set(previous.page.map((article) => article.id));
        return {
          ...next,
          page: [
            ...previous.page,
            ...next.page.filter((article) => !seen.has(article.id)),
          ],
        };
      });
      setStatus("idle");
    } catch {
      setStatus("error");
    } finally {
      pending.current = false;
    }
  }, [corpusKey, result.continueCursor, result.isDone]);

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
      <div className="mb-8 mt-5 text-sm text-[var(--muted)]" aria-live="polite">
        {result.page.length} ranked{" "}
        {result.page.length === 1 ? "comparison" : "comparisons"}
        {result.isDone ? "" : " loaded"}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
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
            className="border border-[var(--line)] px-6 py-3 text-sm font-bold disabled:opacity-60"
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
