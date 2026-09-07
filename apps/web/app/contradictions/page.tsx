import type { Metadata } from "next";

import {
  CollectionSearch,
  CollectionEmptyState,
} from "@/components/collection-search";
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
      <section className="page-container" aria-label="Collection results">
        <CollectionSearch
          collectionKey="contradictions"
          corpusKey={corpusKey}
          query={query}
          sort="ranked"
        />
        <ContradictionList
          corpusKey={corpusKey}
          initialPage={initialPage}
          key={`${corpusKey}:${query}`}
        />
        {initialPage.isDone && initialPage.page.length === 0 ? (
          <CollectionEmptyState
            collectionKey="contradictions"
            corpusKey={corpusKey}
            query={query}
          />
        ) : null}
      </section>
    </>
  );
}
