import { collectionRegistry, corpusLabel } from "@apolog/shared";
import type { CollectionKey } from "@apolog/shared";

import { firstSearchParam, getPageCorpus } from "@/lib/corpus";
import type { PageSearchParams } from "@/lib/corpus";
import { listArticles } from "@/lib/data";

import { ArticleCard } from "./article-card";
import { CollectionSearch, CollectionEmptyState } from "./collection-search";
import { PageIntro } from "./page-intro";

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
  const articles = await listArticles(
    collectionKey,
    corpusKey,
    query
      ? { mode: "search", query, sort: searchSort }
      : { mode: "browse", sort: browseSort }
  );
  const pageCopy = collectionRegistry[collectionKey].page;

  return (
    <>
      <PageIntro {...pageCopy} corpusKey={corpusKey} />
      <section className="page-container" aria-label="Collection results">
        <CollectionSearch
          collectionKey={collectionKey}
          corpusKey={corpusKey}
          query={query}
          sort={query ? searchSort : browseSort}
        />
        <div className="collection-results">
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
          <CollectionEmptyState
            collectionKey={collectionKey}
            corpusKey={corpusKey}
            query={query}
          />
        )}
      </section>
    </>
  );
}
