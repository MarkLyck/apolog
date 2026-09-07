import type { Metadata } from "next";
import { FiSearch } from "react-icons/fi";

import { ContradictionList } from "@/components/contradiction-list";
import { PageIntro } from "@/components/page-intro";
import { firstSearchParam, getPageCorpus } from "@/lib/corpus";
import type { PageSearchParams } from "@/lib/corpus";
import { listArticles } from "@/lib/data";

import { loadContradictions } from "./actions";

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
  const initialPage = query
    ? {
        page: await listArticles("contradictions", corpusKey, {
          mode: "search",
          query,
          sort: "relevance",
        }),
        isDone: true,
        continueCursor: "",
      }
    : await loadContradictions({ corpusKey, cursor: null });
  return (
    <>
      <PageIntro
        corpusKey={corpusKey}
        description="Compare the precise claims, their passage references, the point of conflict, and the strongest common reconciliation."
        eyebrow="Claim against claim"
        title="Where the accounts pull apart."
      />
      <section className="mx-auto max-w-[92rem] px-5 pb-16 lg:px-8 lg:pb-24">
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
        <ContradictionList
          corpusKey={corpusKey}
          initialPage={initialPage}
          key={`${corpusKey}:${query}`}
        />
      </section>
    </>
  );
}
