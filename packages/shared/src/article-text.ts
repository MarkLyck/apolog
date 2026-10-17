import type { ContentBlock, InlineContent } from "./content";

function inlineText(content: InlineContent) {
  return content.map((node) => node.text).join("");
}

export function blockParts(
  block: ContentBlock,
  inline: (content: InlineContent) => string
): string[] {
  switch (block.type) {
    case "list": {
      return block.items.map((item) => inline(item.content));
    }
    case "claimComparison": {
      return block.claims.flatMap((claim) => [
        claim.label,
        claim.reference,
        inline(claim.content),
      ]);
    }
    case "callout": {
      return [block.title, inline(block.content)];
    }
    case "quote": {
      return [block.reference, block.edition, inline(block.content)];
    }
    case "heading":
    case "paragraph": {
      return [inline(block.content)];
    }
    default: {
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}

export function blockText(block: ContentBlock) {
  return blockParts(block, inlineText);
}

export function articleWordCount(blocks: readonly ContentBlock[]) {
  return (
    blocks
      .flatMap((block) => blockText(block))
      .join(" ")
      .match(/\S+/gu)?.length ?? 0
  );
}

const wordsPerMinute = 200;

export function estimateReadingMinutes(wordCount: number) {
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}
