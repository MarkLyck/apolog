import type { Id } from "@apolog/backend/data-model";
import type { CollectionKey, CorpusKey } from "@apolog/shared";
import { withCorpus } from "@apolog/shared";
import * as Effect from "effect/Effect";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

import { getAdjacentArticles } from "@/lib/data";

import { IntentPrefetchLink } from "./intent-prefetch-link";

export async function ArticleNavigation({
  articleId,
  collectionKey,
  corpusKey,
}: {
  articleId: Id<"articles">;
  collectionKey: CollectionKey;
  corpusKey: CorpusKey;
}) {
  const adjacent = await Effect.runPromise(
    getAdjacentArticles(articleId, collectionKey, corpusKey)
  );
  if (!adjacent.previous && !adjacent.next) {
    return null;
  }
  return (
    <nav aria-label="Article navigation" className="grid grid-cols-2 gap-3">
      {(["previous", "next"] as const).map((direction) => {
        const article = adjacent[direction];
        const label = direction === "previous" ? "Previous" : "Next";
        const Icon = direction === "previous" ? FiArrowLeft : FiArrowRight;
        const className = `flex min-w-0 flex-col gap-2 rounded-xl border border-[var(--line)] p-4 text-sm ${direction === "next" ? "items-end text-right" : "items-start"}`;
        return article ? (
          <IntentPrefetchLink
            className={`${className} bg-[var(--surface)] transition-colors hover:border-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]`}
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
          </IntentPrefetchLink>
        ) : (
          <span
            aria-disabled="true"
            className={`${className} text-[var(--muted)] opacity-50`}
            key={direction}
          >
            <span
              className={`inline-flex items-center gap-2 font-semibold ${direction === "next" ? "flex-row-reverse" : ""}`}
            >
              <Icon aria-hidden="true" /> {label}
            </span>
          </span>
        );
      })}
    </nav>
  );
}
