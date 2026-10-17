import type { Metadata } from "next";

import { PageIntro } from "@/components/page-intro";
import { siteInfoRoutes } from "@/lib/public-routes";
import { siteConfig } from "@/lib/site";

const issuesUrl = `${siteConfig.repositoryUrl}/issues`;

export const metadata: Metadata = {
  alternates: { canonical: siteInfoRoutes.contact },
  description:
    "Report a misquoted passage, a broken citation, a factual error, or a bug in Apolog through its public GitHub issue tracker.",
  title: "Contact",
};

export default function Page() {
  return (
    <>
      <PageIntro
        description="Corrections, questions, and bug reports go through the public issue tracker for the Apolog repository on GitHub."
        eyebrow="Contact"
        title="Found a problem? Tell us."
      />
      <div className="page-container">
        <div className="prose-apolog max-w-3xl">
          <h2>Open a GitHub issue</h2>
          <p>
            Apolog takes reports and questions through{" "}
            <a href={issuesUrl}>GitHub issues</a> on its public repository at{" "}
            <a href={siteConfig.repositoryUrl}>github.com/MarkLyck/apolog</a>.
            Opening an issue requires a free GitHub account. Issues are public,
            so anyone can read what you write. Do not include personal details
            you want to keep private.
          </p>

          <h2>What to report</h2>
          <ul>
            <li>
              A misquoted passage, such as a verse that is cut short, quoted out
              of its context, or attributed to the wrong book or chapter.
            </li>
            <li>
              A broken citation, such as a source link that no longer loads or a
              source that does not say what the article claims.
            </li>
            <li>
              A factual error in an article, including a claim that newer or
              stronger evidence contradicts.
            </li>
            <li>
              A bug in the site, such as a page that fails to load, a search
              that returns the wrong results, or a debate assistant error.
            </li>
            <li>A question about how the site handles your data.</li>
          </ul>

          <h2>What to include</h2>
          <p>
            A report with enough detail to check is easier to act on. Include
            the following where they apply.
          </p>
          <ul>
            <li>
              The page URL, copied from the address bar. Keep the{" "}
              <code>?text=bible</code> or <code>?text=quran</code> part, because
              it shows which library you were reading.
            </li>
            <li>
              The passage reference, such as a book, chapter, and verse or a
              surah and ayah, and the translation if you know it.
            </li>
            <li>
              The source that supports your correction, with a link or a full
              citation.
            </li>
            <li>
              For a bug, the steps that cause it, what you expected, and what
              happened instead, along with your browser and device.
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
