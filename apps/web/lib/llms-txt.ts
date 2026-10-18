import { collectionRegistry } from "@apolog/shared";
import type { CollectionKey } from "@apolog/shared";

import { agentSkillPath, discoveryLinks } from "./discovery";

interface IndexedArticle {
  slug: string;
  summary: string;
  title: string;
}

interface LlmsTxtInput {
  collections: readonly {
    articles: readonly IndexedArticle[];
    collectionKey: CollectionKey;
  }[];
  description: string;
  name: string;
  siteUrl: string;
}

function linkText(text: string) {
  return text.replaceAll(/[[\]\\]/gu, (character) => `\\${character}`);
}

function oneLine(text: string) {
  return text.replaceAll(/\s+/gu, " ").trim();
}

function entry(title: string, url: string, note: string) {
  return `- [${linkText(title)}](${url}): ${oneLine(note)}`;
}

export function llmsTxt({
  collections,
  description,
  name,
  siteUrl,
}: LlmsTxtInput) {
  const absolute = (path: string) => `${siteUrl}${path}`;
  const lines = [
    `# ${name}`,
    "",
    `> ${description}`,
    "",
    `Every article has a Markdown source: append \`.md\` to its URL (${absolute("/articles/<slug>.md")}). The article links below point at the Markdown source. Collection pages accept \`?text=bible\` or \`?text=quran\` to choose the scripture. Search with \`GET ${absolute("/api/search/articles?q=<query>&text=bible")}\`, which returns JSON.`,
    "",
    "## Collections",
    "",
    ...collections.map(({ collectionKey }) =>
      entry(
        collectionRegistry[collectionKey].label,
        absolute(collectionRegistry[collectionKey].href),
        collectionRegistry[collectionKey].description
      )
    ),
    ...collections.flatMap(({ articles, collectionKey }) =>
      articles.length
        ? [
            "",
            `## ${collectionRegistry[collectionKey].label}`,
            "",
            ...articles.map((article) =>
              entry(
                article.title,
                absolute(`/articles/${article.slug}.md`),
                article.summary
              )
            ),
          ]
        : []
    ),
    "",
    "## Optional",
    "",
    entry(
      "Sitemap",
      absolute(discoveryLinks.sitemap.href),
      "Every public page and article URL."
    ),
    entry(
      "RSS feed",
      absolute(discoveryLinks.feed.href),
      "The most recently published articles."
    ),
    entry(
      "Agent skill",
      absolute(agentSkillPath),
      "Instructions for agents that search and read Apolog."
    ),
  ];
  return `${lines.join("\n")}\n`;
}
