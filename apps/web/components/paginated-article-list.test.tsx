import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import { PaginatedArticleList } from "./paginated-article-list";

const article = {
  collectionKey: "contradictions" as const,
  comparisonReferences: ["Genesis 1:1"],
  finding: "contradicted",
  id: "article-1",
  position: 1,
  publishedAt: 1,
  readingMinutes: 2,
  slug: "sab-heaven",
  summary: "Conflicting answers about when heaven was created.",
  tags: ["contradiction"],
  title: "When was heaven created?",
};

describe("PaginatedArticleList", () => {
  test("renders the first page and a load-more control when more remain", () => {
    const html = renderToStaticMarkup(
      <PaginatedArticleList
        collectionKey="contradictions"
        continueCursor="cursor-2"
        corpusKey="bible"
        isDone={false}
        noun={{
          plural: "ranked comparisons",
          singular: "ranked comparison",
        }}
        page={[article]}
        sort="ranked"
        variant="contradiction"
      />
    );
    expect(html).toContain("When was heaven created?");
    expect(html).toContain("Showing 1 ranked comparison");
    expect(html).toContain("Load more");
  });

  test("hides load more once the last page is already loaded", () => {
    const html = renderToStaticMarkup(
      <PaginatedArticleList
        collectionKey="contradictions"
        continueCursor="cursor-end"
        corpusKey="bible"
        isDone
        noun={{
          plural: "ranked comparisons",
          singular: "ranked comparison",
        }}
        page={[article]}
        sort="ranked"
        variant="contradiction"
      />
    );
    expect(html).toContain("1 ranked comparison");
    expect(html).not.toContain("Showing");
    expect(html).not.toContain("Load more");
  });
});
