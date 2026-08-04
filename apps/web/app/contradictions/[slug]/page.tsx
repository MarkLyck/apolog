import { Badge } from "@apolog/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiExternalLink } from "react-icons/fi";

import { getPageCorpus } from "@/lib/corpus";
import type { PageSearchParams } from "@/lib/corpus";
import { getContradiction } from "@/lib/data";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: PageSearchParams;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getContradiction((await params).slug);
  return item
    ? { description: item.summary, title: item.title }
    : { title: "Not found" };
}

export default async function Page({ params, searchParams }: Props) {
  const [{ slug }, corpusKey] = await Promise.all([
    params,
    getPageCorpus(searchParams),
  ]);
  const item = await getContradiction(slug);
  if (!item) {
    notFound();
  }
  return (
    <article>
      <header className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
        <Link
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--muted)]"
          href={`/contradictions?text=${corpusKey}`}
        >
          <FiArrowLeft aria-hidden="true" /> All contradictions
        </Link>
        <div className="mt-10 flex gap-2">
          <Badge className="border-[var(--accent)] text-[var(--accent-strong)]">
            Rank {item.rank}
          </Badge>
          <Badge>{item.claims.length} claims compared</Badge>
        </div>
        <h1 className="mt-7 max-w-5xl text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
          {item.title}
        </h1>
        <p className="mt-7 max-w-3xl text-xl leading-8 text-[var(--muted)]">
          {item.summary}
        </p>
      </header>
      <section className="border-y border-[var(--line)] bg-[var(--surface-strong)]/55 py-12">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 md:grid-cols-2 lg:px-8">
          {item.claims.map((claim) => (
            <div
              className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-7"
              key={claim.reference}
            >
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                {claim.label}
              </div>
              <h2 className="mt-5 text-3xl">{claim.reference}</h2>
              <p className="mt-4 leading-7 text-[var(--muted)]">{claim.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-14 lg:grid-cols-[1fr_18rem] lg:px-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
            Common reconciliation and response
          </div>
          <h2 className="mt-4 text-4xl">Can the accounts be read together?</h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--muted)]">
            {item.response}
          </p>
          <div className="mt-9 rounded-[1.3rem] border border-[var(--line)] bg-[var(--surface)] p-6 text-sm leading-7 text-[var(--muted)]">
            This demo records the surface tension and a representative
            reconciliation. Publication requires licensed quotation text and
            claim-level scholarly citations.
          </div>
        </div>
        <div>
          <h2 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
            Sources
          </h2>
          <div className="mt-3 grid gap-3">
            {item.sources.map((source) => (
              <a
                className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 text-sm font-bold hover:border-[var(--accent)]"
                href={source.url}
                key={source.url}
                rel="noreferrer"
                target="_blank"
              >
                {source.title}{" "}
                <FiExternalLink aria-hidden="true" className="ml-1 inline" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
