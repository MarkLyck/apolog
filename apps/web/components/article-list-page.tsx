import { collectionRegistry, corpusLabel } from "@apolog/shared";
import type { CollectionKey } from "@apolog/shared";
import { FiFilter, FiSearch } from "react-icons/fi";

import { searchListStatus, searchReachedCap } from "@/lib/article-list";
import { firstSearchParam, getPageCorpus } from "@/lib/corpus";
import type { PageSearchParams } from "@/lib/corpus";
import { listArticlePage, listArticles } from "@/lib/data";

import { ArticleCard } from "./article-card";
import { PageIntro } from "./page-intro";
import { PaginatedArticleList } from "./paginated-article-list";

const noun = {
  plural: "published results",
  singular: "published result",
};

export async function ArticleListPage({
  collectionKey,
  searchParams,
}: {
  collectionKey: Exclude<CollectionKey, "contradictions">;
  searchParams: PageSearchParams;
}) {
  const [corpusKey, parameters] = await Promise.all([
    getPageCorpus(searchParams),
    searchParams,
  ]);
  const query = firstSearchParam(parameters.q);
  const requestedSort = firstSearchParam(parameters.sort);
  const searchSort =
    requestedSort === "oldest" ||
    requestedSort === "relevance" ||
    requestedSort === "newest"
      ? requestedSort
      : "relevance";
  const browseSort = requestedSort === "oldest" ? "oldest" : "newest";
  const searchResults = query
    ? await listArticles(collectionKey, corpusKey, {
        mode: "search",
        query,
        sort: searchSort,
      })
    : null;
  const browsePage = query
    ? null
    : await listArticlePage(collectionKey, corpusKey, browseSort);
  const pageCopy = collectionRegistry[collectionKey].page;

  return (
    <>
      <PageIntro {...pageCopy} corpusKey={corpusKey} />
      <section className="mx-auto max-w-[92rem] px-5 lg:px-8">
        <form
          className="grid gap-3 rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface)] p-3 shadow-sm md:grid-cols-[1fr_auto_auto]"
          method="get"
        >
          <input name="text" type="hidden" value={corpusKey} />
          <label className="flex min-h-12 items-center gap-3 rounded-xl bg-[var(--surface-strong)] px-4">
            <FiSearch aria-hidden="true" className="text-[var(--muted)]" />
            <span className="sr-only">Search {pageCopy.eyebrow}</span>
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
              defaultValue={query}
              name="q"
              placeholder={`Search ${corpusLabel(corpusKey)} ${collectionKey}…`}
            />
          </label>
          <label className="flex min-h-12 items-center gap-2 rounded-xl border border-[var(--line)] px-4 text-sm font-semibold">
            <FiFilter aria-hidden="true" />
            <span className="sr-only">Sort results</span>
            <select
              className="bg-transparent outline-none"
              defaultValue={query ? searchSort : browseSort}
              name="sort"
            >
              {query ? <option value="relevance">Most relevant</option> : null}
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
          <button
            className="min-h-12 rounded-xl bg-[var(--ink)] px-6 text-sm font-bold text-[var(--paper)]"
            type="submit"
          >
            Apply
          </button>
        </form>
        {searchResults ? (
          <>
            <div className="mb-8 mt-5 flex items-center justify-between text-sm text-[var(--muted)]">
              <p aria-live="polite">
                {searchListStatus({
                  noun,
                  query,
                  shown: searchResults.length,
                })}
              </p>
              <p className="hidden md:block">
                Scoped to {corpusLabel(corpusKey)}
              </p>
            </div>
            {searchReachedCap(searchResults.length) ? (
              <p className="mb-6 text-sm text-[var(--muted)]">
                Search is limited to 24 matches. Narrow the query to see a
                different set.
              </p>
            ) : null}
            {searchResults.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {searchResults.map((article) => (
                  <ArticleCard
                    article={article}
                    corpusKey={corpusKey}
                    key={article.slug}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] p-12 text-center">
                <h2 className="text-3xl">No published matches</h2>
                <p className="mx-auto mt-3 max-w-lg text-[var(--muted)]">
                  Try a broader query or clear the search. Results never borrow
                  records from the other corpus.
                </p>
              </div>
            )}
          </>
        ) : browsePage ? (
          <PaginatedArticleList
            aside={`Scoped to ${corpusLabel(corpusKey)}`}
            collectionKey={collectionKey}
            continueCursor={browsePage.continueCursor}
            corpusKey={corpusKey}
            isDone={browsePage.isDone}
            key={`${corpusKey}:${browseSort}`}
            noun={noun}
            page={browsePage.articles}
            sort={browseSort}
            variant="article"
          />
        ) : null}
      </section>
    </>
  );
}
