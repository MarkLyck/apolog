import { createHash } from "node:crypto";

import { collectionKeys, collectionRegistry } from "@apolog/shared";

import { discoveryLinks } from "./discovery";

export const agentSkill = {
  description:
    "Search and read Apolog, a source-led library that examines Biblical and Quranic claims. Use it when a task needs Apolog articles, their findings, or the sources they cite.",
  name: "apolog",
};

export function agentSkillMarkdown(siteUrl: string) {
  const collections = collectionKeys
    .map(
      (key) =>
        `- \`${key}\`: ${collectionRegistry[key].description} Listing: ${siteUrl}${collectionRegistry[key].href}`
    )
    .join("\n");
  return `---
name: ${agentSkill.name}
description: ${JSON.stringify(agentSkill.description)}
---

# Reading Apolog

Apolog (${siteUrl}) publishes articles that test religious claims against cited evidence. Every article is public. No authentication is needed to read it.

## Find articles

1. Fetch ${siteUrl}${discoveryLinks.llms.href} for an index of collections and recent articles.
2. Search with \`GET ${siteUrl}/api/search/articles?q=<query>&text=<bible|quran>\`. The query must be 2 to 200 characters. The response is JSON shaped \`{ "results": [...] }\`, and each result has \`slug\`, \`title\`, \`summary\`, \`collectionKey\`, and \`publishedAt\`. Invalid parameters return HTTP 400.
3. Follow ${siteUrl}${discoveryLinks.feed.href} (RSS 2.0) for newly published articles, or ${siteUrl}${discoveryLinks.sitemap.href} for every URL.

Collections:

${collections}

Collection pages take \`?text=bible\` or \`?text=quran\` to choose the scripture.

## Read an article

- Fetch \`${siteUrl}/articles/<slug>.md\` for the article as Markdown. The HTML page is \`${siteUrl}/articles/<slug>\`.
- The Markdown starts with YAML frontmatter: \`title\`, \`url\`, \`published\`, \`updated\`, \`tags\`, and \`sources\`.
- An unknown slug returns HTTP 404.

## Cite

Link readers to the HTML URL in the frontmatter \`url\` field, not the \`.md\` URL. Attribute factual claims to the sources the article lists.
`;
}

export function sha256Digest(text: string) {
  return `sha256:${createHash("sha256").update(text, "utf-8").digest("hex")}`;
}
