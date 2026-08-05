import type { ArticleContent, CorpusKey } from "@apolog/shared";
import { withCorpus } from "@apolog/shared";
import { Badge, Card } from "@apolog/ui";
import Link from "next/link";
import { FiArrowUpRight, FiClock } from "react-icons/fi";

type ArticleCardArticle = Pick<
  ArticleContent,
  "slug" | "type" | "title" | "summary" | "tags" | "readingMinutes" | "finding"
>;

const categoryLabels = {
  debunked: "Claim review",
  evidence: "Evidence guide",
  immoral: "Moral analysis",
  silly: "Silly story",
} as const;

export function ArticleCard({
  article,
  corpusKey,
}: {
  article: ArticleCardArticle;
  corpusKey: CorpusKey;
}) {
  return (
    <Card
      eyebrow={categoryLabels[article.type]}
      className="flex h-full flex-col"
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {article.finding ? <Badge>{article.finding}</Badge> : null}
        <Badge className="gap-1.5">
          <FiClock aria-hidden="true" /> {article.readingMinutes} min read
        </Badge>
      </div>
      <h2 className="font-display text-2xl leading-tight text-[var(--ink)]">
        {article.title}
      </h2>
      <p className="mt-3 flex-1 text-sm leading-6 text-[var(--muted)]">
        {article.summary}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {article.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-xs text-[var(--muted)]">
            #{tag.replaceAll(" ", "-")}
          </span>
        ))}
      </div>
      <Link
        className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--accent-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
        href={withCorpus(`/${article.type}/${article.slug}`, corpusKey)}
      >
        Read analysis <FiArrowUpRight aria-hidden="true" />
      </Link>
    </Card>
  );
}
