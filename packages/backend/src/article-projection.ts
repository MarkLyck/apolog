import type { ArticleDocument } from "@apolog/shared";

function inlineText(content: { text: string }[]) {
  return content.map((node) => node.text).join("");
}

function blockText(block: ArticleDocument["blocks"][number]): string[] {
  switch (block.type) {
    case "list": {
      return block.items.map((item) => inlineText(item.content));
    }
    case "claimComparison": {
      return block.claims.flatMap((claim) => [
        claim.label,
        claim.reference,
        inlineText(claim.content),
      ]);
    }
    case "callout": {
      return [block.title, inlineText(block.content)];
    }
    case "quote": {
      return [block.reference, block.edition, inlineText(block.content)];
    }
    case "heading":
    case "paragraph": {
      return [inlineText(block.content)];
    }
    default: {
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}

export function articleTagKey(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, "-")
    .replaceAll(/^-|-$/gu, "");
}

export function projectArticle({
  document,
  summary,
  tags,
  title,
}: {
  document: ArticleDocument;
  summary: string;
  tags: string[];
  title: string;
}) {
  return {
    comparisonReferences: document.blocks.flatMap((block) =>
      block.type === "claimComparison"
        ? block.claims.map((claim) => claim.reference)
        : []
    ),
    searchText: [
      title,
      summary,
      tags.join(" "),
      document.blocks.flatMap(blockText).join(" "),
    ]
      .join(" ")
      .toLowerCase(),
    tagKeys: tags.map((label) => ({ key: articleTagKey(label), label })),
  };
}
