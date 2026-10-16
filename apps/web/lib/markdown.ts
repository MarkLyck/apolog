import { corpusLabel, withCorpus } from "@apolog/shared";
import type { ArticleListItem, CorpusKey } from "@apolog/shared";

import { collections, questions, steps } from "./home-content";
import { siteConfig } from "./site";

const markdownTypes = new Set(["text/markdown", "text/x-markdown"]);
const htmlTypes = new Set(["text/html", "text/*", "*/*"]);

function quality(parameters: string[]) {
  const q = parameters.find((parameter) => parameter.trim().startsWith("q="));
  const value = q === undefined ? 1 : Number(q.trim().slice(2));
  return Number.isNaN(value) ? 0 : value;
}

export function prefersMarkdown(accept: string | null) {
  let markdown = 0;
  let html = 0;
  for (const range of (accept ?? "").split(",")) {
    const [type = "", ...parameters] = range.split(";");
    const mediaType = type.trim().toLowerCase();
    if (markdownTypes.has(mediaType)) {
      markdown = Math.max(markdown, quality(parameters));
    } else if (htmlTypes.has(mediaType)) {
      html = Math.max(html, quality(parameters));
    }
  }
  return markdown > 0 && markdown >= html;
}

export function markdownResponse(body: string, status = 200) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
    },
    status,
  });
}

const absolute = (path: string, corpusKey: CorpusKey) =>
  `${siteConfig.url}${withCorpus(path, corpusKey)}`;

const articleLinks = (
  articles: readonly ArticleListItem[],
  corpusKey: CorpusKey
) =>
  articles.map(
    (article) =>
      `- [${article.title}](${absolute(`/articles/${article.slug}`, corpusKey)}): ${article.summary}`
  );

export function homeMarkdown(
  corpusKey: CorpusKey,
  featured: {
    articles: readonly ArticleListItem[];
    contradictions: readonly ArticleListItem[];
  }
) {
  return [
    `# ${siteConfig.name}`,
    siteConfig.description,
    `Showing the ${corpusLabel(corpusKey)} library.`,
    "## Collections",
    collections
      .map(
        ({ description, href, label }) =>
          `- [${label}](${absolute(href, corpusKey)}): ${description}`
      )
      .join("\n"),
    ...(featured.contradictions.length > 0
      ? [
          "## Featured contradictions",
          articleLinks(featured.contradictions, corpusKey).join("\n"),
        ]
      : []),
    ...(featured.articles.length > 0
      ? [
          "## Featured evidence",
          articleLinks(featured.articles, corpusKey).join("\n"),
        ]
      : []),
    "## How to examine a claim",
    steps
      .map(
        ({ description, title }, index) =>
          `${index + 1}. **${title}.** ${description}`
      )
      .join("\n"),
    "## Common questions",
    ...questions.map(({ answer, title }) => `### ${title}\n\n${answer}`),
    `Start a conversation with the debate assistant: ${absolute("/debate", corpusKey)}`,
  ].join("\n\n");
}
