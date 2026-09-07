import { collectionRegistry, corpusLabel } from "@apolog/shared";
import type { CollectionKey, CorpusKey } from "@apolog/shared";
import { Badge } from "@apolog/ui";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FiArrowLeft, FiClock, FiExternalLink } from "react-icons/fi";

import { resolveArticlePlacement } from "@/lib/article-placement";
import { getArticle } from "@/lib/data";

import { ContentBlocks } from "./content-blocks";

export async function ArticleDetailPage({
  slug,
  corpusKey,
  requestedCollection,
}: {
  slug: string;
  corpusKey: CorpusKey;
  requestedCollection: CollectionKey | null;
}) {
  const article = await getArticle(slug);
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

  return (
    <article className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
      <header className="border-b border-[var(--line)]">
        <div className="pb-8 sm:pb-10">
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            href={`/${activePlacement.collectionKey}?text=${corpusKey}`}
          >
            <FiArrowLeft aria-hidden="true" /> Back to {collection.label}
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-[var(--muted)] sm:mt-10">
            <span className="font-semibold text-[var(--accent-strong)]">
              {collection.label}
            </span>
            {activePlacement.position > 0 ? (
              <span>Rank {activePlacement.position}</span>
            ) : null}
            <span>{corpusLabel(corpusKey)} context</span>
            <span className="inline-flex items-center gap-1.5">
              <FiClock aria-hidden="true" /> {article.readingMinutes} min read
            </span>
          </div>
          <h1 className="mt-4 max-w-4xl text-pretty text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
            {article.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[var(--muted)] sm:mt-5 sm:text-xl">
            {article.summary}
          </p>
          {article.contentWarning ? (
            <div className="mt-8 rounded-xl border border-[var(--accent)]/50 bg-[color:var(--accent)]/8 px-5 py-4 text-sm font-semibold">
              Content notice: {article.contentWarning}
            </div>
          ) : null}
        </div>
      </header>
      <div className="grid items-start gap-8 pt-8 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-10">
        <ContentBlocks blocks={article.document.blocks} />
        <section
          aria-label="Article details"
          className="space-y-6 border-t border-[var(--line)] pt-6 lg:sticky lg:top-28 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
        >
          <div>
            <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Topics
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge
                  className="rounded-md bg-transparent font-medium"
                  key={tag}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Sources
            </h2>
            <ol className="mt-3 grid gap-3">
              {article.sources.map((source) => (
                <li key={source.url}>
                  <a
                    className="group block rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 text-sm font-medium leading-snug transition-colors hover:border-[var(--accent)]"
                    href={source.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {source.title}
                    <span className="mt-2 flex items-start gap-2 text-xs font-normal leading-relaxed text-[var(--muted)]">
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
    </article>
  );
}
