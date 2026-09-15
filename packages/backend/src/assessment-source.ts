import type {
  ArticleContent,
  ContentBlock,
  InlineContent,
} from "@apolog/shared";

export type AssessmentSource = Pick<
  ArticleContent,
  "title" | "summary" | "document"
>;

function inlineSource(content: InlineContent) {
  return {
    text: content.map((node) => node.text).join(""),
    links: content.flatMap((node) => (node.type === "link" ? [node.href] : [])),
  };
}

function blockSource(block: ContentBlock) {
  switch (block.type) {
    case "paragraph":
    case "heading": {
      return [block.type, inlineSource(block.content)];
    }
    case "quote": {
      return [
        block.type,
        block.reference,
        block.edition,
        inlineSource(block.content),
      ];
    }
    case "callout": {
      return [block.type, block.title, inlineSource(block.content)];
    }
    case "list": {
      return [
        block.type,
        block.items.map((item) => inlineSource(item.content)),
      ];
    }
    case "claimComparison": {
      return [
        block.type,
        block.claims.map((claim) => [
          claim.label,
          claim.reference,
          inlineSource(claim.content),
        ]),
      ];
    }
    default: {
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}

export async function assessmentSourceDigest(article: AssessmentSource) {
  const source = JSON.stringify([
    article.title,
    article.summary,
    article.document.blocks.map(blockSource),
  ]);
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(source)
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}
