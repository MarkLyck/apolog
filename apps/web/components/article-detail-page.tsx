import { collectionRegistry, corpusLabel } from "@apolog/shared";
import type { CollectionKey, CorpusKey } from "@apolog/shared";
import { Badge } from "@apolog/ui";
import * as Effect from "effect/Effect";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { FiClock, FiExternalLink } from "react-icons/fi";

import { resolveArticlePlacement } from "@/lib/article-placement";
import {
  getAdjacentArticles,
  getArticle,
  getRelatedArticles,
} from "@/lib/data";
import { articleBreadcrumbs, articleGraph } from "@/lib/structured-data";

import { ArticleEditButton } from "./article-edit-button";
import { ArticleNavigation } from "./article-navigation";
import { Breadcrumb } from "./breadcrumb";
import { ContentBlocks } from "./content-blocks";
import { ContradictionAssessmentPanel } from "./contradiction-assessment";
import { JsonLd } from "./json-ld";
import { RelatedArticles } from "./related-articles";

export async function ArticleDetailPage({
  slug,
  corpusKey,
  requestedCollection,
}: {
  slug: string;
  corpusKey: CorpusKey;
  requestedCollection: CollectionKey | null;
}) {
  const article = await Effect.runPromise(getArticle(slug));
  if (!article) {
    notFound();
  }
  const resolved = resolveArticlePlacement(
    article.placements,
    corpusKey,
    requestedCollection
  );
  if (resolved.redirect) {
    redirect(resolved.redirect);
  }
  if (!resolved.placement) {
    notFound();
  }
  const activePlacement = resolved.placement;
  const collection = collectionRegistry[activePlacement.collectionKey];
  const [adjacent, related] = await Effect.runPromise(
    Effect.all(
      [
        getAdjacentArticles(
          article._id,
          activePlacement.collectionKey,
          corpusKey
        ),
        getRelatedArticles(article, activePlacement.collectionKey, corpusKey),
      ],
      { concurrency: "unbounded" }
    )
  );
  const breadcrumbs = articleBreadcrumbs(
    article,
    activePlacement.collectionKey,
    corpusKey
  );

  return (
    <article className="article-reader page-container">
      <JsonLd
        graph={articleGraph(
          article,
          activePlacement.collectionKey,
          breadcrumbs
        )}
      />
      <header className="reader-header">
        <div className="reader-heading">
          <div className="flex items-center justify-between gap-4">
            <Breadcrumb crumbs={breadcrumbs} />
            <Suspense fallback={null}>
              <ArticleEditButton articleId={article._id} />
            </Suspense>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-[var(--muted)] sm:mt-10">
            <span className="font-semibold text-[var(--accent-strong)]">
              {collection.label}
            </span>
            {activePlacement.position > 0 ? (
              <span>Reading order {activePlacement.position}</span>
            ) : null}
            <span>{corpusLabel(corpusKey)} context</span>
            <span className="inline-flex items-center gap-1.5">
              <FiClock aria-hidden="true" /> {article.readingMinutes} min read
            </span>
          </div>
          <h1 className="mt-4 max-w-4xl text-4xl leading-[1.08] text-pretty sm:text-5xl lg:text-6xl">
            {article.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[var(--muted)] sm:mt-5 sm:text-xl">
            {article.summary}
          </p>
          {activePlacement.collectionKey === "contradictions" && (
            <ContradictionAssessmentPanel assessment={article.assessment} />
          )}
          {article.contentWarning ? (
            <div className="mt-8 rounded-xl border border-[var(--accent)]/50 bg-[color:var(--accent)]/8 px-5 py-4 text-sm font-semibold">
              Content notice: {article.contentWarning}
            </div>
          ) : null}
        </div>
      </header>
      <div className="grid items-start gap-8 pt-8 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10">
        <ContentBlocks blocks={article.document.blocks} />
        <section
          aria-label="Article details"
          className="reader-details space-y-7 lg:sticky lg:top-32"
        >
          <div>
            <h2 className="font-sans text-xs font-semibold tracking-[0.12em] text-[var(--muted)] uppercase">
              Topics
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge className="bg-transparent font-medium" key={tag}>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-sans text-xs font-semibold tracking-[0.12em] text-[var(--muted)] uppercase">
              Sources
            </h2>
            <ol className="mt-3 grid gap-3">
              {article.sources.map((source) => (
                <li key={source.url}>
                  <a
                    className="group block rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 text-sm leading-snug font-medium transition-colors hover:border-[var(--accent)]"
                    href={source.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {source.title}
                    <span className="mt-2 flex items-start gap-2 text-xs leading-relaxed font-normal text-[var(--muted)]">
                      {source.publisher}{" "}
                      <FiExternalLink
                        aria-hidden="true"
                        className="mt-0.5 shrink-0"
                      />
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
      <RelatedArticles articles={related} corpusKey={corpusKey} />
      <div className="pt-10">
        <ArticleNavigation
          adjacent={adjacent}
          collectionKey={activePlacement.collectionKey}
          corpusKey={corpusKey}
        />
      </div>
    </article>
  );
}
