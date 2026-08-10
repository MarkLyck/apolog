"use client";

import { api } from "@apolog/backend/api";
import { collectionRegistry } from "@apolog/shared";
import { Badge } from "@apolog/ui";
import { usePaginatedQuery } from "convex/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FiArrowRight,
  FiEdit3,
  FiFileText,
  FiPlus,
  FiSearch,
} from "react-icons/fi";

const actionClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-5 text-sm font-bold text-[var(--paper)] transition hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]";
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export function AdminArticleList() {
  const {
    loadMore,
    results: articles,
    status: paginationStatus,
  } = usePaginatedQuery(api.articles.listForAdmin, {}, { initialNumItems: 20 });
  const [filter, setFilter] = useState<
    "all" | "draft" | "published" | "archived"
  >("all");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return articles.filter(
      (article) =>
        (filter === "all" || article.status === filter) &&
        (!needle ||
          article.title.toLowerCase().includes(needle) ||
          article.summary.toLowerCase().includes(needle) ||
          article.slug.includes(needle))
    );
  }, [articles, filter, query]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
      <header className="flex flex-col gap-6 border-b border-[var(--line)] pb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
            Publishing desk
          </p>
          <h1 className="mt-3 text-5xl">Articles</h1>
          <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
            Draft, edit, publish, and organize every article from one place.
          </p>
        </div>
        <Link className={actionClassName} href="/admin/articles/new">
          <FiPlus aria-hidden="true" /> New article
        </Link>
      </header>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Filter articles</legend>
          {(["all", "draft", "published", "archived"] as const).map(
            (status) => (
              <button
                aria-pressed={filter === status}
                className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-bold capitalize text-[var(--muted)] transition hover:border-[var(--accent)] aria-pressed:border-[var(--ink)] aria-pressed:bg-[var(--ink)] aria-pressed:text-[var(--paper)]"
                key={status}
                onClick={() => setFilter(status)}
                type="button"
              >
                {status}
              </button>
            )
          )}
        </fieldset>
        <label className="relative block sm:w-72">
          <span className="sr-only">Search articles</span>
          <FiSearch
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            className="min-h-11 w-full rounded-full border border-[var(--line)] bg-[var(--surface)] pl-11 pr-4 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title or slug…"
            type="search"
            value={query}
          />
        </label>
      </div>

      {paginationStatus === "LoadingFirstPage" ? (
        <p className="py-20 text-center text-[var(--muted)]">
          Loading articles…
        </p>
      ) : filtered.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-20 text-center">
          <FiFileText
            aria-hidden="true"
            className="mx-auto text-4xl text-[var(--muted)]"
          />
          <h2 className="mt-5 text-2xl">No articles found</h2>
          <p className="mt-2 text-[var(--muted)]">
            {articles.length
              ? "Try a different filter or search."
              : "Create the first article to get started."}
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)]">
          {filtered.map((article) => (
            <Link
              className="group grid gap-4 border-b border-[var(--line)] p-5 transition last:border-b-0 hover:bg-[var(--surface-strong)]/55 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6"
              href={`/admin/articles/${article._id}`}
              key={article._id}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{article.status}</Badge>
                  {[
                    ...new Set(
                      article.placements.map((item) => item.collectionKey)
                    ),
                  ].map((collection) => (
                    <span
                      className="text-xs font-semibold text-[var(--muted)]"
                      key={collection}
                    >
                      {collectionRegistry[collection].label}
                    </span>
                  ))}
                </div>
                <h2 className="mt-3 truncate text-2xl">{article.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                  {article.summary}
                </p>
                <p className="mt-3 text-xs text-[var(--muted)]">
                  /articles/{article.slug} · Updated{" "}
                  {dateFormatter.format(article.updatedAt)}
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--accent-strong)]">
                <FiEdit3 aria-hidden="true" /> Edit
                <FiArrowRight
                  aria-hidden="true"
                  className="transition group-hover:translate-x-1"
                />
              </span>
            </Link>
          ))}
          {paginationStatus === "CanLoadMore" ? (
            <div className="p-5 text-center">
              <button
                className={actionClassName}
                onClick={() => loadMore(20)}
                type="button"
              >
                Load more articles
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
