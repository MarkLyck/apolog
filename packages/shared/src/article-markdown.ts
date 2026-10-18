import type { ArticleSource, ContentBlock, InlineContent } from "./content";

export interface MarkdownArticle {
  contentWarning?: string | undefined;
  document: { blocks: readonly ContentBlock[] };
  publishedAt?: number | undefined;
  sources: readonly ArticleSource[];
  summary: string;
  tags: readonly string[];
  title: string;
  updatedAt: number;
}

type Mark = NonNullable<
  Extract<InlineContent[number], { type: "text" }>["marks"]
>[number];

const markDelimiters = {
  bold: "**",
  italic: "*",
  strikethrough: "~~",
} as const satisfies Record<Exclude<Mark, "code">, string>;

function escapeText(text: string) {
  return text.replaceAll(/[\\`*_[\]<>~]/gu, (character) => `\\${character}`);
}

function escapeLineStart(line: string) {
  return line.replace(
    /^(?<indent>\s*)(?<marker>#{1,6}(?=\s|$)|[+-](?=\s|$)|\d+[.)](?=\s|$))/u,
    "$<indent>\\$<marker>"
  );
}

function codeSpan(text: string) {
  const longestRun = Math.max(
    0,
    ...(text.match(/`+/gu) ?? []).map((run) => run.length)
  );
  const fence = "`".repeat(longestRun + 1);
  const padding = /^`|`$/u.test(text) ? " " : "";
  return `${fence}${padding}${text}${padding}${fence}`;
}

function markedText(text: string, marks: readonly Mark[]) {
  const {
    core = "",
    leading = "",
    trailing = "",
  } = /^(?<leading>\s*)(?<core>[\s\S]*?)(?<trailing>\s*)$/u.exec(text)
    ?.groups ?? {};
  if (!core) {
    return text;
  }
  let result = marks.includes("code") ? codeSpan(core) : escapeText(core);
  for (const mark of marks) {
    if (mark !== "code") {
      result = `${markDelimiters[mark]}${result}${markDelimiters[mark]}`;
    }
  }
  return `${leading}${result}${trailing}`;
}

function linkTarget(href: string, baseUrl: string) {
  const absolute = new URL(href, baseUrl).toString();
  return /[\s()]/u.test(absolute) ? `<${absolute}>` : absolute;
}

function inlineMarkdown(content: InlineContent, baseUrl: string) {
  return content
    .map((node) =>
      node.type === "link"
        ? `[${escapeText(node.text)}](${linkTarget(node.href, baseUrl)})`
        : markedText(node.text, node.marks ?? [])
    )
    .join("")
    .split("\n")
    .map(escapeLineStart)
    .join("\n");
}

function prefixLines(text: string, first: string, rest: string) {
  return text
    .split("\n")
    .map((line, index) => `${index === 0 ? first : rest}${line}`.trimEnd())
    .join("\n");
}

function blockMarkdown(block: ContentBlock, baseUrl: string): string {
  switch (block.type) {
    case "paragraph": {
      return inlineMarkdown(block.content, baseUrl);
    }
    case "heading": {
      return `${"#".repeat(block.level)} ${inlineMarkdown(block.content, baseUrl).replaceAll("\n", " ")}`;
    }
    case "callout": {
      return prefixLines(
        `**${escapeText(block.title)}**\n\n${inlineMarkdown(block.content, baseUrl)}`,
        "> ",
        "> "
      );
    }
    case "quote": {
      return prefixLines(
        `${inlineMarkdown(block.content, baseUrl)}\n\n${escapeText(block.reference)} (${escapeText(block.edition)})`,
        "> ",
        "> "
      );
    }
    case "list": {
      return block.items
        .map((item) =>
          prefixLines(inlineMarkdown(item.content, baseUrl), "- ", "  ")
        )
        .join("\n");
    }
    case "claimComparison": {
      return block.claims
        .map((claim) =>
          prefixLines(
            `**${escapeText(claim.label)}** (${escapeText(claim.reference)}): ${inlineMarkdown(claim.content, baseUrl)}`,
            "- ",
            "  "
          )
        )
        .join("\n");
    }
    default: {
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}

function yamlString(value: string) {
  return JSON.stringify(value);
}

function isoDate(timestamp: number) {
  return new Date(timestamp).toISOString();
}

function frontmatter(article: MarkdownArticle, url: string) {
  const lines = [
    `title: ${yamlString(article.title)}`,
    `url: ${yamlString(url)}`,
    ...(article.publishedAt
      ? [`published: ${yamlString(isoDate(article.publishedAt))}`]
      : []),
    `updated: ${yamlString(isoDate(article.updatedAt))}`,
    ...(article.tags.length
      ? ["tags:", ...article.tags.map((tag) => `  - ${yamlString(tag)}`)]
      : []),
    ...(article.sources.length
      ? [
          "sources:",
          ...article.sources.flatMap((source) => [
            `  - title: ${yamlString(source.title)}`,
            `    publisher: ${yamlString(source.publisher)}`,
            `    url: ${yamlString(source.url)}`,
          ]),
        ]
      : []),
  ];
  return ["---", ...lines, "---"].join("\n");
}

export function articleMarkdown(article: MarkdownArticle, url: string) {
  const sections = [
    frontmatter(article, url),
    `# ${escapeText(article.title)}`,
    escapeLineStart(escapeText(article.summary)),
    ...(article.contentWarning
      ? [`> **Content notice:** ${escapeText(article.contentWarning)}`]
      : []),
    ...article.document.blocks.map((block) => blockMarkdown(block, url)),
    ...(article.sources.length
      ? [
          "## Sources",
          article.sources
            .map(
              (source, index) =>
                `${index + 1}. [${escapeText(source.title)}](${linkTarget(source.url, url)}), ${escapeText(source.publisher)}`
            )
            .join("\n"),
        ]
      : []),
  ];
  return `${sections.join("\n\n")}\n`;
}
