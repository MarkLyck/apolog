import { Badge, Card } from "@apolog/ui";
import type { Metadata } from "next";

import { MapExplorer } from "@/components/map-explorer";
import { PageIntro } from "@/components/page-intro";
import { getPageCorpus } from "@/lib/corpus";
import type { PageSearchParams } from "@/lib/corpus";
import { listMapEntries } from "@/lib/data";

export const metadata: Metadata = {
  description:
    "Explore proposed routes, sites, regions, and scale comparisons with uncertainty visible.",
  title: "Geography explorer",
};

export default async function Page({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const corpusKey = await getPageCorpus(searchParams);
  const entries = await listMapEntries(corpusKey);
  return (
    <>
      <PageIntro
        corpusKey={corpusKey}
        description="Explore traditional sites, competing hypotheses, journeys, and modern scale comparisons. Coordinates show claims and proposals—not automatic proof."
        eyebrow="Geography explorer"
        title="Put the narrative on the map."
      />
      <section className="mx-auto max-w-[92rem] px-5 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          <Badge>{entries.length} published entries</Badge>
          <Badge>Points and journeys</Badge>
          <Badge>Uncertainty visible</Badge>
        </div>
        <MapExplorer entries={entries} />
      </section>
      <section className="mx-auto max-w-[92rem] px-5 py-16 lg:px-8">
        <div className="mb-8">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
            Accessible list view
          </div>
          <h2 className="mt-3 text-4xl">Every published map entry</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {entries.map((entry) => (
            <Card
              eyebrow={`${entry.type} · ${entry.certainty}`}
              key={entry.slug}
            >
              <h3 className="text-2xl">{entry.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                {entry.summary}
              </p>
              <dl className="mt-5 text-sm">
                <dt className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                  Period
                </dt>
                <dd className="mt-1 font-semibold">{entry.period}</dd>
              </dl>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
