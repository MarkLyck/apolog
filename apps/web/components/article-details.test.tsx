import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import { ArticleDetails, hasArticleDetails } from "./article-details";

const source = {
  publisher: "United States Geological Survey",
  title: "Sedimentary rock record",
  url: "https://www.usgs.gov/example",
};

describe("ArticleDetails", () => {
  test("omits the Sources heading when an article has no sources", () => {
    const html = renderToStaticMarkup(
      <ArticleDetails sources={[]} tags={["afterlife"]} />
    );
    expect(html).toContain("afterlife");
    expect(html).not.toContain("Sources");
  });

  test("lists sources under a Sources heading when present", () => {
    const html = renderToStaticMarkup(
      <ArticleDetails sources={[source]} tags={[]} />
    );
    expect(html).toContain("Sources");
    expect(html).toContain("Sedimentary rock record");
    expect(html).toContain('href="https://www.usgs.gov/example"');
    expect(html).not.toContain("Topics");
  });

  test("the sidebar is skipped only when there are neither tags nor sources", () => {
    expect(hasArticleDetails({ sources: [], tags: [] })).toBe(false);
    expect(hasArticleDetails({ sources: [source], tags: [] })).toBe(true);
    expect(hasArticleDetails({ sources: [], tags: ["afterlife"] })).toBe(true);
  });
});
