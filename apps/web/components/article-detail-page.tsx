import { corpusLabel } from "@apolog/shared";
import type { ArticleType, CorpusKey } from "@apolog/shared";
import { Badge } from "@apolog/ui";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FiArrowLeft, FiClock, FiExternalLink } from "react-icons/fi";

import { getArticleCorpusRedirect } from "@/lib/article-visibility";
import { getArticle } from "@/lib/data";

import { ContentBlocks } from "./content-blocks";

export async function ArticleDetailPage({
  type,
  slug,
  corpusKey,
}: {
  type: ArticleType;
  slug: string;
  corpusKey: CorpusKey;
}) {
  const article = await getArticle(type, slug);
  if (!article) {
    notFound();
  }
  const corpusRedirect = getArticleCorpusRedirect(article, corpusKey, type);
  if (corpusRedirect) {
    redirect(corpusRedirect);
  }

  return (
    <article>
      <header className="border-b border-[var(--line)]">
        <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8 lg:py-24">
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--muted)]"
            href={`/${type}?text=${corpusKey}`}
          >
            <FiArrowLeft aria-hidden="true" /> Back to {type}
          </Link>
          <div className="mt-10 flex flex-wrap gap-2">
            <Badge className="border-[var(--accent)] text-[var(--accent-strong)]">
              {type}
            </Badge>
            <Badge>{corpusLabel(corpusKey)} context</Badge>
            <Badge className="gap-1.5">
              <FiClock aria-hidden="true" /> {article.readingMinutes} min read
            </Badge>
          </div>
          <h1 className="mt-7 max-w-4xl text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
            {article.title}
          </h1>
          <p className="mt-7 max-w-3xl text-xl leading-8 text-[var(--muted)]">
            {article.summary}
          </p>
          {article.contentWarning ? (
            <div className="mt-8 rounded-xl border border-[var(--accent)]/50 bg-[color:var(--accent)]/8 px-5 py-4 text-sm font-semibold">
              Content notice: {article.contentWarning}
            </div>
          ) : null}
        </div>
      </header>
      <div className="mx-auto grid max-w-5xl gap-12 px-5 py-14 lg:grid-cols-[minmax(0,1fr)_15rem] lg:px-8">
        <ContentBlocks blocks={article.blocks} />
        <div className="space-y-8 lg:sticky lg:top-28 lg:self-start">
          <div>
            <h2 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
              Topics
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
              Sources
            </h2>
            <ol className="mt-3 grid gap-3">
              {article.sources.map((source) => (
                <li key={source.url}>
                  <a
                    className="group block rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-sm font-semibold hover:border-[var(--accent)]"
                    href={source.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {source.title}
                    <span className="mt-1 flex items-center gap-1 text-xs font-normal text-[var(--muted)]">
                      {source.publisher} <FiExternalLink aria-hidden="true" />
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </article>
  );
}
