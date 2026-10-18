import { DebateClient } from "@/components/debate-client";
import { PageIntro } from "@/components/page-intro";
import { getPageCorpus } from "@/lib/corpus";
import type { PageSearchParams } from "@/lib/corpus";
import { corpusPageMetadata } from "@/lib/metadata";

export const generateMetadata = corpusPageMetadata({
  description:
    "Turn source-led research into a concise response while preserving caveats.",
  path: "/debate",
  title: "Debate assistant",
});

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
        description="Bring a claim, follow the arguments, and build a response with sources you can return to."
        eyebrow="Think it through"
        title="Good questions start a conversation."
      />
      <section className="page-container debate-page">
        <DebateClient corpusKey={corpusKey} />
      </section>
    </>
  );
}
