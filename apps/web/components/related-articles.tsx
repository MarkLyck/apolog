import type { ArticleListItem, CorpusKey } from "@apolog/shared";
import { collectionRegistry, withCorpus } from "@apolog/shared";
import Link from "next/link";
import { FiClock } from "react-icons/fi";

export function RelatedArticles({
  articles,
  corpusKey,
}: {
  articles: readonly ArticleListItem[];
  corpusKey: CorpusKey;
}) {
  if (!articles.length) {
    return null;
  }
  return (
    <section aria-labelledby="related-articles" className="pt-10">
      <h2
        className="font-sans text-xs font-semibold tracking-[0.12em] text-[var(--muted)] uppercase"
        id="related-articles"
      >
        Related reading
      </h2>
      <ul className="mt-4 grid gap-3 md:grid-cols-3">
        {articles.map((article) => (
          <li
            className="relative flex h-full flex-col gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 transition-colors focus-within:border-[var(--accent)] hover:border-[var(--accent)]"
            key={article.slug}
          >
            <span className="font-mono text-[0.68rem] font-medium tracking-wide text-[var(--muted)] uppercase">
              {collectionRegistry[article.collectionKey].cardLabel}
            </span>
            <h3 className="text-lg leading-snug text-[var(--ink)]">
              <Link
                className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
                href={withCorpus(
                  `/articles/${article.slug}?from=${article.collectionKey}`,
                  corpusKey
                )}
              >
                {article.title}
              </Link>
            </h3>
            <p className="line-clamp-2 flex-1 text-sm leading-6 text-[var(--muted)]">
              {article.summary}
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)]">
              <FiClock aria-hidden="true" /> {article.readingMinutes} min read
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
