import type { CollectionKey, CorpusKey } from "@apolog/shared";
import { withCorpus } from "@apolog/shared";
import type * as Effect from "effect/Effect";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

import type { getAdjacentArticles } from "@/lib/data";

export function ArticleNavigation({
  adjacent,
  collectionKey,
  corpusKey,
}: {
  adjacent: Effect.Success<ReturnType<typeof getAdjacentArticles>>;
  collectionKey: CollectionKey;
  corpusKey: CorpusKey;
}) {
  if (!adjacent.previous && !adjacent.next) {
    return null;
  }
  return (
    <nav aria-label="Article navigation" className="grid grid-cols-2 gap-3">
      {(["previous", "next"] as const).map((direction) => {
        const article = adjacent[direction];
        const label = direction === "previous" ? "Previous" : "Next";
        const Icon = direction === "previous" ? FiArrowLeft : FiArrowRight;
        if (!article) {
          return null;
        }
        return (
          <Link
            className={`flex min-w-0 flex-col gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 text-sm transition-colors hover:border-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] ${direction === "next" ? "col-start-2 items-end text-right" : "items-start"}`}
            href={withCorpus(
              `/articles/${article.slug}?from=${collectionKey}`,
              corpusKey
            )}
            key={direction}
            rel={direction === "previous" ? "prev" : "next"}
          >
            <span
              className={`inline-flex items-center gap-2 font-semibold text-[var(--accent-strong)] ${direction === "next" ? "flex-row-reverse" : ""}`}
            >
              <Icon aria-hidden="true" /> {label}
            </span>
            <span className="line-clamp-2 leading-snug">{article.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
