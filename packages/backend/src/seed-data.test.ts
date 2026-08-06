import { describe, expect, test } from "bun:test";

import { contentFixtures } from "@apolog/shared/demo-content";

import { buildSeedDocuments } from "./seed-data";

describe("Convex seed preparation", () => {
  test("creates one indexed projection per article placement", () => {
    const result = buildSeedDocuments(contentFixtures);
    const expected = contentFixtures.articles.reduce(
      (sum, article) => sum + article.placements.length,
      0
    );
    expect(
      result.articles.flatMap((article) => article.placements)
    ).toHaveLength(expected);
  });

  test("creates corpus-and-collection-scoped search records", () => {
    const result = buildSeedDocuments(contentFixtures);
    const searchDocuments = result.articles.flatMap(
      (article) => article.searches
    );
    expect(
      searchDocuments.every(
        (document) =>
          document.status === "published" &&
          document.searchText.includes(document.title.toLowerCase())
      )
    ).toBe(true);
  });

  test("uses globally stable article import keys", () => {
    const first = buildSeedDocuments(contentFixtures);
    const second = buildSeedDocuments(contentFixtures);
    expect(first.articles.map((article) => article.document.importKey)).toEqual(
      second.articles.map((article) => article.document.importKey)
    );
    expect(
      new Set(first.articles.map((article) => article.document.importKey)).size
    ).toBe(first.articles.length);
  });

  test("normalizes managed tag keys", () => {
    const result = buildSeedDocuments(contentFixtures);
    expect(
      result.articles.flatMap((article) => article.tagKeys)
    ).toContainEqual({
      key: "talking-animals",
      label: "talking animals",
    });
  });

  test("projects comparison references and display tags onto every list path", () => {
    const result = buildSeedDocuments(contentFixtures);
    const contradiction = result.articles.find((article) =>
      article.placements.some(
        (placement) => placement.collectionKey === "contradictions"
      )
    );
    expect(contradiction?.placements[0]?.comparisonReferences).toEqual([
      "2 Samuel 24:1",
      "1 Chronicles 21:1",
    ]);
    expect(contradiction?.searches[0]?.tags).toContain("contradiction");
  });
});
