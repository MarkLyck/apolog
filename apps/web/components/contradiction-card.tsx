import type { ArticleListItem, CorpusKey } from "@apolog/shared";
import { withCorpus } from "@apolog/shared";
import { Card } from "@apolog/ui";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

export function ContradictionCard({
  article,
  corpusKey,
}: {
  article: ArticleListItem;
  corpusKey: CorpusKey;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-2 -top-5 font-display text-[7rem] leading-none text-[color:var(--line)]/55">
        {article.position}
      </div>
      <div className="relative">
        <div className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
          Ranked contradiction {article.position}
        </div>
        <h2 className="max-w-md text-2xl leading-tight">{article.title}</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          {article.summary}
        </p>
        {article.comparisonReferences.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {article.comparisonReferences.map((reference) => (
              <span
                className="rounded-full bg-[var(--surface-strong)] px-3 py-1.5 text-xs font-semibold"
                key={reference}
              >
                {reference}
              </span>
            ))}
          </div>
        ) : null}
        <Link
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--accent-strong)]"
          href={withCorpus(
            `/articles/${article.slug}?from=contradictions`,
            corpusKey
          )}
        >
          Compare the accounts <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}
