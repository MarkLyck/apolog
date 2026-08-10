import { corpusLabel } from "@apolog/shared";
import type { Metadata } from "next";
import Link from "next/link";
import type { IconType } from "react-icons";
import {
  FiArrowRight,
  FiBookOpen,
  FiCompass,
  FiMessageCircle,
} from "react-icons/fi";

import { ArticleCard } from "@/components/article-card";
import { ContradictionCard } from "@/components/contradiction-card";
import { getPageCorpus } from "@/lib/corpus";
import type { PageSearchParams } from "@/lib/corpus";
import { getFeatured } from "@/lib/data";

export const metadata: Metadata = {
  description:
    "Trace passages, evidence, and moral arguments to their sources.",
  title: "Examine the claim",
};

const categoryCards = [
  {
    description:
      "Test historical and factual claims against evidence that could confirm or challenge them.",
    href: "/debunked",
    label: "Debunked",
  },
  {
    description:
      "Apply explicit ethical standards while preserving textual and historical context.",
    href: "/immoral",
    label: "Immoral",
  },
  {
    description:
      "Understand the methods behind geology, evolution, archaeology, and chronology.",
    href: "/evidence",
    label: "Evidence",
  },
  {
    description:
      "Examine talking animals, strange miracles, and stories whose narrative logic is simply hard to take seriously.",
    href: "/silly",
    label: "Silly",
  },
] as const;

const principles: {
  icon: IconType;
  title: string;
  copy: (label: string) => string;
}[] = [
  {
    copy: () =>
      "Every material claim should resolve to a passage or external source.",
    icon: FiBookOpen,
    title: "Source-led",
  },
  {
    copy: (label) =>
      `Every result is explicitly scoped to the active ${label} corpus.`,
    icon: FiCompass,
    title: "Scope-aware",
  },
  {
    copy: () =>
      "Turn the research into a concise, copy-ready response with caveats intact.",
    icon: FiMessageCircle,
    title: "Debate-ready",
  },
];

export default async function Home({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const corpusKey = await getPageCorpus(searchParams);
  const featured = await getFeatured(corpusKey);
  const label = corpusLabel(corpusKey);

  return (
    <>
      <section className="editorial-grid hero-rule border-b border-[var(--line)]">
        <div className="mx-auto grid min-h-[42rem] max-w-[92rem] gap-16 px-5 py-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:items-end lg:px-8 lg:py-24">
          <div>
            <div className="mb-10 flex items-center gap-3 text-sm font-semibold text-[var(--muted)]">
              <span className="size-2 bg-[var(--accent)]" aria-hidden="true" />
              {label} library selected
            </div>
            <h1 className="max-w-4xl text-[clamp(4rem,8vw,6rem)] leading-[0.88]">
              Examine
              <br />
              the claim.
            </h1>
            <p className="mt-9 max-w-[65ch] text-lg leading-8 text-[var(--muted)] md:text-xl">
              Read the passage. Follow the evidence. See the strongest response.
              Apolog makes critical inquiry legible without flattening
              uncertainty.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-12 items-center gap-3 border border-[var(--ink)] bg-[var(--ink)] px-6 text-sm font-bold text-[var(--paper)] transition hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)]"
                href={`/contradictions?text=${corpusKey}`}
              >
                Start with contradictions <FiArrowRight aria-hidden="true" />
              </Link>
              <Link
                className="inline-flex min-h-12 items-center border border-[var(--ink)] px-6 text-sm font-bold transition hover:bg-[var(--surface)]"
                href={`/evidence?text=${corpusKey}`}
              >
                Explore evidence
              </Link>
            </div>
          </div>

          <div className="border-t-2 border-[var(--ink)] lg:border-l lg:border-t-0 lg:pl-8">
            <h2 className="py-5 font-sans text-sm font-bold uppercase tracking-[0.14em] lg:pt-0">
              A working method
            </h2>
            <ol className="border-b border-[var(--line)]">
              {[
                "Quote precisely",
                "Separate claim types",
                "Show uncertainty",
                "Cite at claim level",
              ].map((item, index) => (
                <li
                  className="grid grid-cols-[2rem_1fr] gap-3 border-t border-[var(--line)] py-4"
                  key={item}
                >
                  <span className="text-xs font-bold text-[var(--accent-strong)]">
                    {index + 1}
                  </span>
                  <span className="font-semibold">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[92rem] px-5 py-20 lg:px-8 lg:py-28">
        <h2 className="max-w-4xl text-4xl leading-[0.98] sm:text-5xl lg:text-6xl">
          Choose the question,
          <br className="hidden sm:block" /> not the conclusion.
        </h2>
        <div className="mt-12 grid border-b border-[var(--line)] md:grid-cols-2">
          {categoryCards.map((card) => (
            <Link
              className="group grid min-h-48 gap-6 border-t border-[var(--line)] py-7 transition hover:bg-[var(--surface)] md:grid-cols-[minmax(8rem,0.45fr)_1fr] md:px-6 md:even:border-l"
              href={`${card.href}?text=${corpusKey}`}
              key={card.href}
            >
              <h3 className="flex items-start justify-between text-3xl">
                {card.label}
                <FiArrowRight
                  aria-hidden="true"
                  className="mt-2 text-base text-[var(--accent-strong)] transition group-hover:translate-x-1"
                />
              </h3>
              <p className="max-w-sm text-sm leading-6 text-[var(--muted)]">
                {card.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--surface-strong)] py-20 lg:py-24">
        <div className="mx-auto grid max-w-[92rem] gap-10 px-5 lg:grid-cols-[minmax(15rem,0.5fr)_minmax(0,1fr)] lg:px-8">
          <div>
            <h2 className="text-4xl leading-none sm:text-5xl">
              Featured
              <br />
              contradictions
            </h2>
            <p className="mt-5 max-w-xs text-sm leading-6 text-[var(--muted)]">
              Parallel accounts placed side by side, ranked for focused review.
            </p>
            <Link
              className="mt-8 inline-flex items-center gap-2 border-b border-[var(--ink)] pb-1 text-sm font-bold"
              href={`/contradictions?text=${corpusKey}`}
            >
              View all <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className="grid max-w-3xl gap-4">
            {featured.contradictions.map((article) => (
              <ContradictionCard
                article={article}
                corpusKey={corpusKey}
                key={article.slug}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[92rem] px-5 py-20 lg:px-8 lg:py-28">
        <div className="mb-12 grid gap-5 border-b-2 border-[var(--ink)] pb-7 md:grid-cols-[1fr_0.7fr] md:items-end">
          <h2 className="text-4xl leading-none sm:text-5xl">
            Evidence before argument
          </h2>
          <p className="text-sm leading-6 text-[var(--muted)] md:justify-self-end">
            Methods, predictions, and cross-checks that make a claim testable.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {featured.articles.map((article) => (
            <ArticleCard
              article={article}
              corpusKey={corpusKey}
              key={article.slug}
            />
          ))}
        </div>
      </section>

      <section className="bg-[var(--ink)] text-[var(--paper)]">
        <div className="mx-auto grid max-w-[92rem] md:grid-cols-3">
          {principles.map(({ icon: Icon, title, copy }) => (
            <div
              className="border-b border-[color:var(--paper)]/20 px-5 py-10 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 lg:px-8 lg:py-14"
              key={title}
            >
              <Icon
                aria-hidden="true"
                className="text-xl text-[var(--accent)]"
              />
              <h3 className="mt-8 text-2xl">{title}</h3>
              <p className="mt-3 max-w-sm text-sm leading-6 opacity-70">
                {copy(label)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
