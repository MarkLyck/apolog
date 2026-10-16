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
