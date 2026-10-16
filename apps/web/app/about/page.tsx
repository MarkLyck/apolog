import { collectionKeys, collectionRegistry } from "@apolog/shared";
import type { Metadata } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/page-intro";
import { publicRoutes, siteInfoRoutes } from "@/lib/public-routes";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: siteInfoRoutes.about },
  description:
    "What Apolog is, how its Bible and Quran research library is organized, and how to read its articles and debate assistant with care.",
  title: "About",
};

export default function Page() {
  return (
    <>
      <PageIntro
        description="Apolog brings passages, analysis, and sources together so you can evaluate an argument for yourself."
        eyebrow="About"
        title="A research library for harder questions."
      />
      <div className="page-container">
        <div className="prose-apolog max-w-3xl">
          <h2>What Apolog is</h2>
          <p>
            Apolog is a research library for examining factual and moral claims
            in the Bible and the Quran. A belief worth holding is worth
            examining. Each article starts from the original passages, sets out
            the claim, and cites the sources behind its reasoning. The goal is
            to help you weigh the strongest arguments and make up your own mind.
          </p>
          <p>
            Use the Bible and Quran switch in the header to choose a library.
            Your choice carries through the collections, search, and the debate
            assistant.
          </p>

          <h2>What the library contains</h2>
          <ul>
            {collectionKeys.map((key) => (
              <li key={key}>
                <Link href={collectionRegistry[key].href}>
                  {collectionRegistry[key].label}
                </Link>
                . {collectionRegistry[key].description}
              </li>
            ))}
          </ul>

          <h2>How to read it</h2>
          <p>
            Start with the passage itself and check what comes before and after
            it. Set related accounts side by side and look for agreement and
            tension. Follow the citations, and consider the evidence and the
            strongest counterarguments before you settle on a view.
          </p>
          <p>
            When you want to test a response, bring a question or claim to the{" "}
            <Link href={publicRoutes.debate}>debate assistant</Link>. It
            searches the published library for related articles and uses them to
            help you explore the arguments. It argues from an evidence-first,
            skeptical position and criticizes claims rather than people. It is
            an AI model and can make mistakes, so check its citations and
            reasoning.
          </p>

          <h2>Where the library stands</h2>
          <p>
            Apolog is a developing library. Some demonstration content still
            needs editorial verification. Do not treat any article as a final
            answer. Read the cited sources and check each quotation in its
            context.
          </p>
          <p>
            The code for Apolog is public on{" "}
            <a href={siteConfig.repositoryUrl}>GitHub</a>. If you find a
            misquoted passage, a broken citation, or a factual error, the{" "}
            <Link href={siteInfoRoutes.contact}>contact page</Link> explains how
            to report it. The{" "}
            <Link href={siteInfoRoutes.privacy}>privacy page</Link> describes
            what the site stores.
          </p>
        </div>
      </div>
    </>
  );
}
