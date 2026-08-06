import { corpusLabel } from "@apolog/shared";
import { Badge, Card } from "@apolog/ui";
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
    number: "01",
  },
  {
    description:
      "Apply explicit ethical standards while preserving textual and historical context.",
    href: "/immoral",
    label: "Immoral",
    number: "02",
  },
  {
    description:
      "Understand the methods behind geology, evolution, archaeology, and chronology.",
    href: "/evidence",
    label: "Evidence",
    number: "03",
  },
  {
    description:
      "Examine talking animals, strange miracles, and stories whose narrative logic is simply hard to take seriously.",
    href: "/silly",
    label: "Silly",
    number: "04",
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
      <section className="editorial-grid relative overflow-hidden border-b border-[var(--line)]">
        <div className="mx-auto grid min-h-[72vh] max-w-[92rem] items-end gap-12 px-5 py-16 lg:grid-cols-[1.35fr_0.65fr] lg:px-8 lg:py-24">
          <div>
            <Badge className="mb-8 border-[var(--accent)] text-[var(--accent-strong)]">
              {label} library active
            </Badge>
            <h1 className="max-w-5xl text-[clamp(4rem,9vw,9rem)] leading-[0.82]">
              Examine
              <br />
              <span className="italic text-[var(--accent-strong)]">
                the claim.
              </span>
            </h1>
            <p className="mt-9 max-w-2xl text-lg leading-8 text-[var(--muted)] md:text-xl">
              Read the passage. Follow the evidence. See the strongest response.
              Apolog makes critical inquiry legible without flattening
              uncertainty.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--ink)] px-6 text-sm font-bold text-[var(--paper)]"
                href={`/contradictions?text=${corpusKey}`}
              >
                Start with contradictions <FiArrowRight aria-hidden="true" />
              </Link>
              <Link
                className="inline-flex min-h-12 items-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-6 text-sm font-bold"
                href={`/evidence?text=${corpusKey}`}
              >
                Explore evidence
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[color:var(--surface)]/88 p-7 backdrop-blur-sm lg:mb-3">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
              Our method
            </div>
            <ol className="mt-6 grid gap-5">
              {[
                "Quote precisely",
                "Separate claim types",
                "Show uncertainty",
                "Cite at claim level",
              ].map((item, index) => (
                <li className="flex items-center gap-4" key={item}>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--surface-strong)] text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="font-semibold">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[92rem] px-5 py-20 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
              Four ways in
            </div>
            <h2 className="mt-3 text-4xl sm:text-5xl">
              Choose the question, not the conclusion.
            </h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {categoryCards.map((card) => (
            <Link href={`${card.href}?text=${corpusKey}`} key={card.href}>
              <Card className="h-full">
                <div className="mb-12 flex items-start justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                    {card.number}
                  </span>
                  <FiArrowRight
                    aria-hidden="true"
                    className="transition group-hover:translate-x-1"
                  />
                </div>
                <h3 className="text-3xl">{card.label}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {card.description}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--surface-strong)]/55 py-20">
        <div className="mx-auto max-w-[92rem] px-5 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                Ranked for review
              </div>
              <h2 className="mt-3 text-4xl sm:text-5xl">
                Featured contradictions
              </h2>
            </div>
            <Link
              className="hidden text-sm font-bold md:block"
              href={`/contradictions?text=${corpusKey}`}
            >
              View all →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
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

      <section className="mx-auto max-w-[92rem] px-5 py-20 lg:px-8">
        <div className="mb-10">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
            Build the foundation
          </div>
          <h2 className="mt-3 text-4xl sm:text-5xl">
            Evidence before argument
          </h2>
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

      <section className="mx-auto max-w-[92rem] px-5 py-20 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {principles.map(({ icon: Icon, title, copy }) => (
            <div className="border-l border-[var(--line)] p-6" key={title}>
              <Icon
                aria-hidden="true"
                className="text-xl text-[var(--accent-strong)]"
              />
              <h3 className="mt-5 text-xl">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {copy(label)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
