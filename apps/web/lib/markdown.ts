import { corpusLabel, withCorpus } from "@apolog/shared";
import type {
  ArticleListItem,
  ArticleSource,
  ContentBlock,
  CorpusKey,
  InlineContent,
} from "@apolog/shared";
import { blockParts } from "@apolog/shared/article-text";

import { collections, homePage, questions, steps } from "./home-content";
import { matchRoute } from "./markdown-routes";
import { siteConfig } from "./site";

export function markdownResponse(body: string, status = 200) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
    },
    status,
  });
}

// JSON strings are valid YAML double-quoted scalars, so a colon or quote in a
// title cannot break the block.
export function frontmatter(fields: {
  canonical: string;
  description: string;
  last_updated?: string;
  title: string;
}) {
  return [
    "---",
    ...Object.entries(fields)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`),
    "---",
  ].join("\n");
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
  canonicalPath: string,
  featured: {
    articles: readonly ArticleListItem[];
    contradictions: readonly ArticleListItem[];
  }
) {
  return [
    frontmatter({
      ...homePage,
      canonical: `${siteConfig.url}${canonicalPath}`,
    }),
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

const markDelimiters = {
  bold: "**",
  italic: "_",
  strikethrough: "~~",
} as const;

function codeSpan(text: string) {
  const fence = "`".repeat(
    Math.max(0, ...(text.match(/`+/gu) ?? []).map((run) => run.length)) + 1
  );
  return fence.length > 1
    ? `${fence} ${text} ${fence}`
    : `${fence}${text}${fence}`;
}

const escapeMarkdown = (text: string) =>
  text.replaceAll(/[\\`*_~[\]<]/gu, "\\$&");

function markedText(text: string, marks: readonly string[] = []) {
  const core = text.trim();
  if (!core) {
    return text;
  }
  const leading = text.slice(0, text.length - text.trimStart().length);
  const trailing = text.slice(text.trimEnd().length);
  const present = new Set(marks);
  let opening = "";
  let closing = "";
  for (const mark of ["strikethrough", "bold", "italic"] as const) {
    if (present.has(mark)) {
      opening += markDelimiters[mark];
      closing = markDelimiters[mark] + closing;
    }
  }
  const inner = present.has("code") ? codeSpan(core) : escapeMarkdown(core);
  return `${leading}${opening}${inner}${closing}${trailing}`;
}

function inlineMarkdown(content: InlineContent) {
  return content
    .map((node) => {
      if (node.type === "text") {
        return markedText(node.text, node.marks);
      }
      const href = (
        node.href.startsWith("/") ? `${siteConfig.url}${node.href}` : node.href
      )
        .replaceAll(" ", "%20")
        .replaceAll("(", "%28")
        .replaceAll(")", "%29");
      return `[${escapeMarkdown(node.text)}](${href})`;
    })
    .join("");
}

function blockMarkdown(block: ContentBlock) {
  const lines = blockParts(block, inlineMarkdown).filter((line) => line.trim());
  switch (block.type) {
    case "heading": {
      return `${"#".repeat(block.level)} ${lines.join(" ")}`;
    }
    case "list": {
      return lines.map((line) => `- ${line}`).join("\n");
    }
    case "quote": {
      return lines.map((line) => `> ${line}`).join("\n>\n");
    }
    default: {
      return lines.join("\n\n");
    }
  }
}

export function articleMarkdown(article: {
  document: { blocks: readonly ContentBlock[] };
  slug: string;
  sources: readonly ArticleSource[];
  summary: string;
  title: string;
  updatedAt: number;
}) {
  const canonical = `${siteConfig.url}/articles/${article.slug}`;
  return [
    frontmatter({
      canonical,
      description: article.summary,
      last_updated: new Date(article.updatedAt).toISOString(),
      title: article.title,
    }),
    `# ${article.title}`,
    article.summary,
    ...article.document.blocks.map(blockMarkdown),
    ...(article.sources.length > 0
      ? [
          "## Sources",
          article.sources
            .map(
              ({ publisher, title, url }) =>
                `- [${title}](${url}), ${publisher}`
            )
            .join("\n"),
        ]
      : []),
    `Read this article on ${siteConfig.name}: ${canonical}`,
  ].join("\n\n");
}

export function notFoundMarkdown(pathname: string) {
  return [
    "# Page not found",
    ["app", "public"].includes(matchRoute(pathname)?.route.kind ?? "")
      ? `\`${pathname}\` has no Markdown version. Read it at ${siteConfig.url}${pathname}.`
      : `${siteConfig.name} has no page at \`${pathname}\`. The link may be wrong, or the article may not be published yet.`,
    [
      `- [${siteConfig.name} homepage](${siteConfig.url}/)`,
      `- [Sitemap](${siteConfig.url}/sitemap.xml)`,
      `- [llms.txt](${siteConfig.url}/llms.txt)`,
    ].join("\n"),
  ].join("\n\n");
}
