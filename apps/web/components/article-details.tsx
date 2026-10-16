import type { ArticleSource } from "@apolog/shared";
import { Badge } from "@apolog/ui";
import { FiExternalLink } from "react-icons/fi";

export function hasArticleDetails({
  sources,
  tags,
}: {
  sources: ArticleSource[];
  tags: string[];
}) {
  return sources.length > 0 || tags.length > 0;
}

export function ArticleDetails({
  sources,
  tags,
}: {
  sources: ArticleSource[];
  tags: string[];
}) {
  return (
    <section
      aria-label="Article details"
      className="reader-details space-y-7 lg:sticky lg:top-32"
    >
      {tags.length > 0 ? (
        <div>
          <h2 className="font-sans text-xs font-semibold tracking-[0.12em] text-[var(--muted)] uppercase">
            Topics
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge className="bg-transparent font-medium" key={tag}>
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
      {sources.length > 0 ? (
        <div>
          <h2 className="font-sans text-xs font-semibold tracking-[0.12em] text-[var(--muted)] uppercase">
            Sources
          </h2>
          <ol className="mt-3 grid gap-3">
            {sources.map((source) => (
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
      ) : null}
    </section>
  );
}
