import type { ArticleContent, DemoContent } from "@apolog/shared";

import { projectArticle } from "./article-projection";

export function buildPreparedArticles(
  fixtures: readonly ArticleContent[],
  importKeyPrefix: string
) {
  return fixtures.map((fixture) => {
    const { placements, tags, ...article } = fixture;
    const document = {
      ...article,
      importKey: `${importKeyPrefix}:${article.slug}`,
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
}

export function buildSeedDocuments(fixtures: DemoContent) {
  return {
    articles: buildPreparedArticles(fixtures.articles, "demo:article"),
    corpora: fixtures.corpora.map((corpus) => ({
      ...corpus,
      enabled: true,
    })),
  };
}
