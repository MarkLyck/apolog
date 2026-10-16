import { collectionRegistry, corpusLabel } from "@apolog/shared";
import type { CollectionKey, CorpusKey } from "@apolog/shared";
import * as Effect from "effect/Effect";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { FiArrowLeft, FiClock } from "react-icons/fi";

import { resolveArticlePlacement } from "@/lib/article-placement";
import { getAdjacentArticles, getArticle } from "@/lib/data";

import { ArticleDetails, hasArticleDetails } from "./article-details";
import { ArticleEditButton } from "./article-edit-button";
import { ArticleNavigation } from "./article-navigation";
import { ContentBlocks } from "./content-blocks";
import { ContradictionAssessmentPanel } from "./contradiction-assessment";

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
  const adjacent = await Effect.runPromise(
    getAdjacentArticles(article._id, activePlacement.collectionKey, corpusKey)
  );

  return (
    <article className="article-reader page-container">
      <header className="reader-header">
        <div className="reader-heading">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
              href={`/${activePlacement.collectionKey}?text=${corpusKey}`}
            >
              <FiArrowLeft aria-hidden="true" /> Back to {collection.label}
            </Link>
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
      {hasArticleDetails(article) ? (
        <div className="grid items-start gap-8 pt-8 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10">
          <ContentBlocks blocks={article.document.blocks} />
          <ArticleDetails sources={article.sources} tags={article.tags} />
        </div>
      ) : (
        <div className="max-w-4xl pt-8 sm:pt-10">
          <ContentBlocks blocks={article.document.blocks} />
        </div>
      )}
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
