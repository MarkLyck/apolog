import { corpusLabel } from "@apolog/shared";
import type { ArticleType } from "@apolog/shared";
import { FiFilter, FiSearch } from "react-icons/fi";

import { getPageCorpus } from "@/lib/corpus";
import type { PageSearchParams } from "@/lib/corpus";
import { listArticles } from "@/lib/data";

import { ArticleCard } from "./article-card";
import { PageIntro } from "./page-intro";

const copy = {
  debunked: {
    description:
      "Historical and factual claims examined with explicit findings: contradicted, unsupported, anachronistic, or physically implausible.",
    eyebrow: "Claims under review",
    title: "What would the evidence look like?",
  },
  evidence: {
    description:
      "Accessible guides to evidence, uncertainty, cross-checks, and limitations across science, history, and archaeology.",
    eyebrow: "Methods and findings",
    title: "Understand how we know.",
  },
  immoral: {
    description:
      "Moral analysis that distinguishes narration, command, approval, punishment, and attributed speech before applying a transparent ethical framework.",
    eyebrow: "Ethics in context",
    title: "Name the standard. Read the whole passage.",
  },
  silly: {
    description:
      "Talking animals, impossible logistics, strange miracles, and narrative turns that can be examined critically without mocking the people who believe them.",
    eyebrow: "The strange and silly",
    title: "Some stories are hard to read with a straight face.",
  },
} as const;

export async function ArticleListPage({
  type,
  searchParams,
}: {
  type: ArticleType;
  searchParams: PageSearchParams;
}) {
  const [corpusKey, parameters] = await Promise.all([
    getPageCorpus(searchParams),
    searchParams,
  ]);
  const query = typeof parameters.q === "string" ? parameters.q : "";
  const requestedSort =
    typeof parameters.sort === "string" ? parameters.sort : "";
  const sort =
    requestedSort === "oldest" ||
    requestedSort === "relevance" ||
    requestedSort === "newest"
      ? requestedSort
      : query
        ? "relevance"
        : "newest";
  const articles = await listArticles(type, corpusKey, query, sort);
  const pageCopy = copy[type];

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
              placeholder={`Search ${corpusLabel(corpusKey)} ${type}…`}
            />
          </label>
          <label className="flex min-h-12 items-center gap-2 rounded-xl border border-[var(--line)] px-4 text-sm font-semibold">
            <FiFilter aria-hidden="true" />
            <span className="sr-only">Sort results</span>
            <select
              className="bg-transparent outline-none"
              defaultValue={sort}
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
        <div className="mb-8 mt-5 flex items-center justify-between text-sm text-[var(--muted)]">
          <p aria-live="polite">
            {articles.length} published{" "}
            {articles.length === 1 ? "result" : "results"}
            {query ? ` for “${query}”` : ""}
          </p>
          <p className="hidden md:block">Scoped to {corpusLabel(corpusKey)}</p>
        </div>
        {articles.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
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
      </section>
    </>
  );
}
