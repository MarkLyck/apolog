import type { ContentBlock, InlineContent } from "./content";

function inlineText(content: InlineContent) {
  return content.map((node) => node.text).join("");
}

export function blockText(block: ContentBlock): string[] {
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

export function articleWordCount(blocks: readonly ContentBlock[]) {
  return blocks.flatMap(blockText).join(" ").match(/\S+/gu)?.length ?? 0;
}

const wordsPerMinute = 200;

export function estimateReadingMinutes(wordCount: number) {
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}
