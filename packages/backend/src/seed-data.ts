import type {
  ArticleContent,
  ContentBlock,
  DemoContent,
  InlineContent,
} from "@apolog/shared";

function inlineText(content: InlineContent): string {
  return content.map((node) => node.text).join("");
}

function contentBlockText(block: ContentBlock): string[] {
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

function articleSearchText(article: ArticleContent): string {
  return [
    article.title,
    article.summary,
    article.tags.join(" "),
    article.document.blocks.flatMap(contentBlockText).join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

function comparisonReferences(article: ArticleContent): string[] {
  return article.document.blocks.flatMap((block) =>
    block.type === "claimComparison"
      ? block.claims.map((claim) => claim.reference)
      : []
  );
}

function tagKey(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, "-")
    .replaceAll(/^-|-$/gu, "");
}

export function buildSeedDocuments(fixtures: DemoContent) {
  const articles = fixtures.articles.map((fixture) => {
    const { placements, tags, ...article } = fixture;
    const document = {
      ...article,
      importKey: `demo:article:${article.slug}`,
      status: "published" as const,
      version: 1,
    };
    const references = comparisonReferences(fixture);
    const searchText = articleSearchText(fixture);
    return {
      document,
      placements: placements.map((placement) => ({
        ...placement,
        comparisonReferences: references,
        publishedAt: document.publishedAt,
        status: document.status,
        tags,
        updatedAt: document.updatedAt,
      })),
      searches: placements.map(({ collectionKey, corpusKey, position }) => ({
        collectionKey,
        comparisonReferences: references,
        corpusKey,
        position,
        searchText,
        status: document.status,
        summary: document.summary,
        tags,
        title: document.title,
        updatedAt: document.updatedAt,
      })),
      tagKeys: tags.map((label) => ({ key: tagKey(label), label })),
    };
  });

  return {
    articles,
    corpora: fixtures.corpora.map((corpus) => ({
      ...corpus,
      enabled: true,
    })),
  };
}
