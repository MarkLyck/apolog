import type { Metadata } from "next";

import {
  CollectionSearch,
  CollectionEmptyState,
} from "@/components/collection-search";
import { ContradictionCard } from "@/components/contradiction-card";
import { PageIntro } from "@/components/page-intro";
import { firstSearchParam, getPageCorpus } from "@/lib/corpus";
import type { PageSearchParams } from "@/lib/corpus";
import { listArticles } from "@/lib/data";

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
  const articles = await listArticles(
    "contradictions",
    corpusKey,
    query
      ? { mode: "search", query, sort: "relevance" }
      : { mode: "browse", sort: "ranked" }
  );
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
        <div className="collection-results" aria-live="polite">
          {articles.length} ranked{" "}
          {articles.length === 1 ? "comparison" : "comparisons"}
        </div>
        {articles.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {articles.map((article) => (
              <ContradictionCard
                article={article}
                corpusKey={corpusKey}
                key={article.slug}
              />
            ))}
          </div>
        ) : (
          <CollectionEmptyState
            collectionKey="contradictions"
            corpusKey={corpusKey}
            query={query}
          />
        )}
      </section>
    </>
  );
}
