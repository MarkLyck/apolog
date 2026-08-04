import type { CorpusKey } from "@apolog/shared";
import { Card } from "@apolog/ui";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

interface Contradiction {
  slug: string;
  rank: number;
  title: string;
  summary: string;
  claims: { reference: string }[];
}

export function ContradictionCard({
  item,
  corpusKey,
}: {
  item: Contradiction;
  corpusKey: CorpusKey;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-2 -top-5 font-display text-[7rem] leading-none text-[color:var(--line)]/55">
        {item.rank}
      </div>
      <div className="relative">
        <div className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
          Ranked contradiction {item.rank}
        </div>
        <h2 className="max-w-md text-2xl leading-tight">{item.title}</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          {item.summary}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {item.claims.map((claim) => (
            <span
              className="rounded-full bg-[var(--surface-strong)] px-3 py-1.5 text-xs font-semibold"
              key={claim.reference}
            >
              {claim.reference}
            </span>
          ))}
        </div>
        <Link
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--accent-strong)]"
          href={`/contradictions/${item.slug}?text=${corpusKey}`}
        >
          Compare the accounts <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}
