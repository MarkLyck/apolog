import { describe, expect, test } from "bun:test";

import { contentFixtures } from "@apolog/shared/demo-content";

import { buildSeedDocuments } from "./seed-data";

describe("Convex seed preparation", () => {
  test("creates one corpus projection per explicit article link", () => {
    const result = buildSeedDocuments(contentFixtures);
    const expected = contentFixtures.articles.reduce(
      (sum, article) => sum + article.corpusKeys.length,
      0
    );
    expect(
      result.articles.flatMap((article) => article.projections)
    ).toHaveLength(expected);
  });

  test("creates corpus-scoped search records without draft content", () => {
    const result = buildSeedDocuments(contentFixtures);
    const searchDocuments = result.articles.flatMap((article) =>
      article.projections.map((projection) => projection.search)
    );
    expect(
      searchDocuments.every(
        (document) =>
          document.status === "published" &&
          document.searchText.includes(document.title.toLowerCase())
      )
    ).toBe(true);
  });

  test("uses stable import keys so reruns can update instead of duplicate", () => {
    const first = buildSeedDocuments(contentFixtures);
    const second = buildSeedDocuments(contentFixtures);
    expect(first.articles.map((article) => article.document.importKey)).toEqual(
      second.articles.map((article) => article.document.importKey)
    );
    expect(
      new Set(first.articles.map((article) => article.document.importKey)).size
    ).toBe(first.articles.length);
  });

  test("prepares stable roots for fixture-backed contradictions", () => {
    const result = buildSeedDocuments(contentFixtures);
    expect(
      result.contradictions.every((item) => item.importKey.startsWith("demo:"))
    ).toBe(true);
  });
});
