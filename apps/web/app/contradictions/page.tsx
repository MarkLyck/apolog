import type { Metadata } from "next";
import { FiSearch } from "react-icons/fi";

import { ContradictionCard } from "@/components/contradiction-card";
import { PageIntro } from "@/components/page-intro";
import { PaginatedArticleList } from "@/components/paginated-article-list";
import { searchListStatus, searchReachedCap } from "@/lib/article-list";
import { firstSearchParam, getPageCorpus } from "@/lib/corpus";
import type { PageSearchParams } from "@/lib/corpus";
import { listArticlePage, listArticles } from "@/lib/data";

const noun = {
  plural: "ranked comparisons",
  singular: "ranked comparison",
};

export const metadata: Metadata = {
  description:
    "Structured claim-by-claim comparisons, ordered for editorial review.",
  title: "Contradictions",
};

export default async function Page({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const [corpusKey, parameters] = await Promise.all([
    getPageCorpus(searchParams),
    searchParams,
  ]);
  const query = firstSearchParam(parameters.q);
  const searchResults = query
    ? await listArticles("contradictions", corpusKey, {
        mode: "search",
        query,
        sort: "relevance",
      })
    : null;
  const browsePage = query
    ? null
    : await listArticlePage("contradictions", corpusKey, "ranked");
  return (
    <>
      <PageIntro
        corpusKey={corpusKey}
        description="Compare the precise claims, their passage references, the point of conflict, and the strongest common reconciliation."
        eyebrow="Claim against claim"
        title="Where the accounts pull apart."
      />
      <section className="mx-auto max-w-[92rem] px-5 lg:px-8">
        <form className="flex max-w-2xl gap-3" method="get">
          <input name="text" type="hidden" value={corpusKey} />
          <label className="flex min-h-12 flex-1 items-center gap-3 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5">
            <FiSearch aria-hidden="true" />
            <span className="sr-only">Search contradictions</span>
            <input
              className="w-full bg-transparent outline-none"
              defaultValue={query}
              name="q"
              placeholder="Search claims or passage references…"
            />
          </label>
          <button
            className="rounded-full bg-[var(--ink)] px-6 text-sm font-bold text-[var(--paper)]"
            type="submit"
          >
            Search
          </button>
        </form>
        {searchResults ? (
          <>
            <div
              className="mb-8 mt-5 text-sm text-[var(--muted)]"
              aria-live="polite"
            >
              {searchListStatus({
                noun,
                query,
                shown: searchResults.length,
              })}
            </div>
            {searchReachedCap(searchResults.length) ? (
              <p className="mb-6 text-sm text-[var(--muted)]">
                Search is limited to 24 matches. Narrow the query to see a
                different set.
              </p>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              {searchResults.map((article) => (
                <ContradictionCard
                  article={article}
                  corpusKey={corpusKey}
                  key={article.slug}
                />
              ))}
            </div>
          </>
        ) : browsePage ? (
          <PaginatedArticleList
            collectionKey="contradictions"
            continueCursor={browsePage.continueCursor}
            corpusKey={corpusKey}
            isDone={browsePage.isDone}
            key={corpusKey}
            noun={noun}
            page={browsePage.articles}
            sort="ranked"
            variant="contradiction"
          />
        ) : null}
      </section>
    </>
  );
}
