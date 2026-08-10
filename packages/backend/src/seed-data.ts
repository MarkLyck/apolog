import type { DemoContent } from "@apolog/shared";

import { projectArticle } from "./article-projection";

export function buildSeedDocuments(fixtures: DemoContent) {
  const articles = fixtures.articles.map((fixture) => {
    const { placements, tags, ...article } = fixture;
    const document = {
      ...article,
      importKey: `demo:article:${article.slug}`,
      status: "published" as const,
      version: 1,
    };
    const projection = projectArticle(fixture);
    return {
      document,
      placements: placements.map((placement) => ({
        ...placement,
        comparisonReferences: projection.comparisonReferences,
        publishedAt: document.publishedAt,
        status: document.status,
        tags,
        updatedAt: document.updatedAt,
      })),
      searches: placements.map(({ collectionKey, corpusKey, position }) => ({
        collectionKey,
        comparisonReferences: projection.comparisonReferences,
        corpusKey,
        position,
        searchText: projection.searchText,
        status: document.status,
        summary: document.summary,
        tags,
        title: document.title,
        updatedAt: document.updatedAt,
      })),
      tagKeys: projection.tagKeys,
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
