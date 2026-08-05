import type { Metadata } from "next";

import { DebateClient } from "@/components/debate-client";
import { PageIntro } from "@/components/page-intro";
import { getPageCorpus } from "@/lib/corpus";
import type { PageSearchParams } from "@/lib/corpus";

export const metadata: Metadata = {
  description:
    "Turn source-led research into a concise response while preserving caveats.",
  title: "Debate assistant",
};

export default async function Page({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const corpusKey = await getPageCorpus(searchParams);
  return (
    <>
      <PageIntro
        corpusKey={corpusKey}
        description="Ask about a claim or paste an argument. Apolog retrieves only published material linked to the active corpus and keeps the answer evidence-first."
        eyebrow="Text-only debate"
        title="Make the response clear. Keep the caveats."
      />
      <section className="mx-auto max-w-5xl px-5 lg:px-8">
        <DebateClient corpusKey={corpusKey} />
      </section>
    </>
  );
}
