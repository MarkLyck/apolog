import type { ArticleContent, ContentBlock, DemoContent } from "@apolog/shared";

function contentBlockText(block: ContentBlock): string[] {
  if (block.type === "list") {
    return block.items;
  }
  if (block.type === "callout") {
    return [block.title, block.text];
  }
  if (block.type === "quote") {
    return [block.reference, block.text];
  }
  return [block.text];
}

function articleSearchText(article: ArticleContent): string {
  return [
    article.title,
    article.summary,
    article.tags.join(" "),
    article.blocks.flatMap(contentBlockText).join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

export function buildSeedDocuments(fixtures: DemoContent) {
  const articles = fixtures.articles.map((fixture) => {
    const { corpusKeys, ...article } = fixture;
    const document = {
      ...article,
      importKey: `demo:article:${article.type}:${article.slug}`,
      status: "published" as const,
      version: 1,
    };
    return {
      document,
      projections: corpusKeys.map((corpusKey) => ({
        corpusKey,
        link: {
          articleType: document.type,
          corpusKey,
          publishedAt: document.publishedAt,
          status: document.status,
          updatedAt: document.updatedAt,
        },
        search: {
          contentType: document.type,
          corpusKey,
          searchText: articleSearchText(fixture),
          status: document.status,
          summary: document.summary,
          title: document.title,
          updatedAt: document.updatedAt,
        },
      })),
    };
  });

  return {
    articles,
    contradictions: fixtures.contradictions.map((item) => ({
      ...item,
      importKey: `demo:contradiction:${item.corpusKey}:${item.slug}`,
      searchText: `${item.title} ${item.summary} ${item.claims
        .map((claim) => `${claim.reference} ${claim.text}`)
        .join(" ")}`.toLowerCase(),
      status: "published" as const,
    })),
    corpora: fixtures.corpora.map((corpus) => ({
      ...corpus,
      enabled: true,
    })),
    mapEntries: fixtures.mapEntries.map((fixture) => {
      const { corpusKeys, ...entry } = fixture;
      return {
        corpusKeys,
        document: {
          ...entry,
          importKey: `demo:map:${entry.slug}`,
          status: "published" as const,
          version: 1,
        },
      };
    }),
  };
}
