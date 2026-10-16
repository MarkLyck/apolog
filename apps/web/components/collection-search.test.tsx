import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import { CollectionEmptyState } from "./collection-search";

describe("CollectionEmptyState", () => {
  test("names the empty section and links to it in the other library", () => {
    const html = renderToStaticMarkup(
      <CollectionEmptyState
        collectionKey="immoral"
        corpusKey="quran"
        query=""
      />
    );
    expect(html).toContain("No Quran articles in Immoral yet.");
    expect(html).toContain('href="/immoral?text=bible"');
    expect(html).toContain("See Bible Immoral");
    expect(html).toContain('href="/?text=quran#explore"');
  });

  test("offers to clear a search that matched nothing", () => {
    const html = renderToStaticMarkup(
      <CollectionEmptyState
        collectionKey="contradictions"
        corpusKey="bible"
        query="flood"
      />
    );
    expect(html).toContain("No matches this time.");
    expect(html).toContain('href="/contradictions?text=bible"');
    expect(html).not.toContain("text=quran");
  });
});
