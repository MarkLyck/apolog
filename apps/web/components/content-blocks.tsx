import type { ContentBlock } from "@apolog/shared";

import {
  CalloutBlock,
  ClaimComparisonBlock,
  HeadingBlock,
  ListBlock,
  ParagraphBlock,
  QuoteBlock,
} from "./content-block-renderers";

function ContentBlockView({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "paragraph": {
      return <ParagraphBlock block={block} />;
    }
    case "heading": {
      return <HeadingBlock block={block} />;
    }
    case "list": {
      return <ListBlock block={block} />;
    }
    case "callout": {
      return <CalloutBlock block={block} />;
    }
    case "quote": {
      return <QuoteBlock block={block} />;
    }
    case "claimComparison": {
      return <ClaimComparisonBlock block={block} />;
    }
    default: {
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}

export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="prose-apolog">
      {blocks.map((block) => (
        <ContentBlockView block={block} key={block.id} />
      ))}
    </div>
  );
}
