import { collectionRegistry, corpusKeys } from "@apolog/shared";

import { publicRoutes } from "@/lib/public-routes";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

const url = (path: string) => `${siteConfig.url}${path}`;
const corpusQueries = corpusKeys.map((corpus) => `\`?text=${corpus}\``);

const body = `# ${siteConfig.name}

> ${siteConfig.description}

${siteConfig.name} is a research library for examining factual and moral claims in the Bible and Quran. Each article brings the passages, the analysis, and the cited sources together so a reader can evaluate an argument for themselves.

## When to use ${siteConfig.name}

- Checking whether two Bible or Quran passages conflict. The [Contradictions](${url(publicRoutes.contradictions)}) collection puts the accounts side by side.
- Finding the evidence and sources for or against a historical, scientific, or archaeological claim made in or about a scripture. Start with [Debunked](${url(publicRoutes.debunked)}) and [Evidence](${url(publicRoutes.evidence)}).
- Examining a moral objection to a passage with a named ethical standard. Use [Immoral](${url(publicRoutes.immoral)}).
- Preparing for a debate or discussion about a passage or claim. The [Debate assistant](${url(publicRoutes.debate)}) uses the library to help explore arguments and draft a response.

## How to use it

- Pages accept ${corpusQueries.join(" or ")} to choose the scripture. Without it, a page uses the reader's last choice, then the Bible.
- Article pages live at \`${url("/articles/<slug>")}\`.
- The [sitemap](${url("/sitemap.xml")}) lists every collection page for each text and the URL of every published article.

## What it is not for

- It is not a final authority. This is a developing library, and some content still needs editorial verification.
- Quote it with care. Read the cited sources and check quotations in their full context before relying on a claim.
- The debate assistant is AI and can make mistakes. Check its citations and reasoning.

## Collections

${Object.values(collectionRegistry)
  .map(
    ({ description, href, label }) =>
      `- [${label}](${url(href)}): ${description}`
  )
  .join("\n")}

## Optional

- [Source code and issues](https://github.com/MarkLyck/apolog): The public repository. Open an issue to report an error in an article.
- [Sitemap](${url("/sitemap.xml")}): Machine-readable index of every public page.
`;

export function GET() {
  return new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
