"use client";

import { parseArticleListResponse, parseCorpus } from "@apolog/shared";
import type { ArticleListItem, CorpusKey } from "@apolog/shared";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { FiArrowRight, FiSearch, FiX } from "react-icons/fi";

import { searchPaletteLinks } from "@/lib/public-routes";

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; results: ArticleListItem[] };

export function SearchPalette({
  initialCorpus,
  isOpen,
  onClose,
  onToggle,
}: {
  initialCorpus: CorpusKey;
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const corpusKey = parseCorpus(searchParams.get("text")) ?? initialCorpus;
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<SearchState>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const closeFromKeyboard = useEffectEvent(onClose);
  const toggleFromKeyboard = useEffectEvent(onToggle);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggleFromKeyboard();
      }
      if (event.key === "Escape") {
        closeFromKeyboard();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || query.trim().length < 2) {
      setSearch({ status: "idle" });
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearch({ status: "loading" });
      try {
        const response = await fetch(
          `/api/search/articles?text=${corpusKey}&q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error(`Search request failed with ${response.status}`);
        }
        const resultsPayload = parseArticleListResponse(await response.json());
        if (!resultsPayload) {
          throw new Error("Search returned an invalid response");
        }
        setSearch({ results: resultsPayload, status: "success" });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setSearch({
            message: "Search is temporarily unavailable. Please retry.",
            status: "error",
          });
        }
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [corpusKey, isOpen, query]);

  useEffect(() => onClose(), [pathname, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <dialog
      aria-label="Search Apolog"
      className="fixed inset-0 z-50 m-0 flex h-full w-full max-w-none items-start justify-center border-0 bg-black/45 px-4 pt-[12vh] backdrop-blur-sm"
      open
    >
      <button
        aria-label="Close search"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[1.5rem] border border-white/15 bg-[var(--paper)] shadow-2xl">
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-5">
          <FiSearch aria-hidden="true" className="text-[var(--muted)]" />
          <input
            aria-label="Search published analysis"
            className="min-h-16 flex-1 bg-transparent text-base outline-none placeholder:text-[var(--muted)]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${corpusKey === "bible" ? "Bible" : "Quran"} analysis…`}
            ref={inputRef}
            value={query}
          />
          <button
            aria-label="Close search"
            className="grid size-10 place-items-center rounded-full hover:bg-[var(--surface)]"
            onClick={onClose}
            type="button"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-3" id="search-results">
          {query.trim().length < 2 ? (
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                Go directly
              </p>
              {searchPaletteLinks.map(({ href, label }) => (
                <Link
                  className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold hover:bg-[var(--surface)]"
                  href={`${href}?text=${corpusKey}`}
                  key={href}
                >
                  {label} <FiArrowRight aria-hidden="true" />
                </Link>
              ))}
            </div>
          ) : null}
          {search.status === "loading" ? (
            <p className="p-6 text-sm text-[var(--muted)]">
              Searching published analysis…
            </p>
          ) : null}
          {search.status === "error" ? (
            <p className="p-6 text-sm font-semibold text-red-700" role="alert">
              {search.message}
            </p>
          ) : null}
          {search.status === "success" && search.results.length === 0 ? (
            <p className="p-6 text-sm text-[var(--muted)]">
              No matches yet. Try a broader term such as “flood,” “dating,” or
              “war.”
            </p>
          ) : null}
          {search.status === "success"
            ? search.results.map((result) => (
                <Link
                  className="block rounded-xl p-4 hover:bg-[var(--surface)] focus:bg-[var(--surface)] focus:outline-none"
                  href={`/articles/${result.slug}?from=${result.collectionKey}&text=${corpusKey}`}
                  key={result.slug}
                >
                  <div className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                    {result.collectionKey}
                  </div>
                  <div className="font-display text-lg">{result.title}</div>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                    {result.summary}
                  </p>
                </Link>
              ))
            : null}
        </div>
        <div className="border-t border-[var(--line)] px-5 py-3 text-xs text-[var(--muted)]">
          Search is restricted to published{" "}
          {corpusKey === "bible" ? "Bible" : "Quran"} content.
        </div>
      </div>
    </dialog>
  );
}
