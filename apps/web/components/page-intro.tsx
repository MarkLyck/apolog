import { corpusLabel } from "@apolog/shared";
import type { CorpusKey } from "@apolog/shared";

export function PageIntro({
  eyebrow,
  title,
  description,
  corpusKey,
}: {
  eyebrow: string;
  title: string;
  description: string;
  corpusKey: CorpusKey;
}) {
  return (
    <header className="mx-auto max-w-[92rem] px-5 pb-12 pt-16 lg:px-8 lg:pt-24">
      <div className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
        <span className="h-px w-10 bg-[var(--accent)]" /> {eyebrow} ·{" "}
        {corpusLabel(corpusKey)}
      </div>
      <h1 className="max-w-5xl text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
        {title}
      </h1>
      <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)]">
        {description}
      </p>
    </header>
  );
}
