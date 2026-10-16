import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import { ArticleNavigation } from "./article-navigation";

describe("ArticleNavigation", () => {
  test("renders only the Next link at the start of a section", () => {
    const html = renderToStaticMarkup(
      <ArticleNavigation
        adjacent={{
          next: { slug: "global-flood-evidence", title: "Global flood" },
          previous: null,
        }}
        collectionKey="contradictions"
        corpusKey="bible"
      />
    );
    expect(html).toContain("Next");
    expect(html).toContain(
      'href="/articles/global-flood-evidence?from=contradictions&amp;text=bible"'
    );
    expect(html).not.toContain("Previous");
    expect(html).not.toContain("aria-disabled");
    expect(html).toContain("col-start-2");
  });

  test("renders only the Previous link at the end of a section", () => {
    const html = renderToStaticMarkup(
      <ArticleNavigation
        adjacent={{
          next: null,
          previous: { slug: "bible-heaven", title: "Heaven" },
        }}
        collectionKey="contradictions"
        corpusKey="bible"
      />
    );
    expect(html).toContain("Previous");
    expect(html).not.toContain("Next");
    expect(html).not.toContain("aria-disabled");
  });
});
