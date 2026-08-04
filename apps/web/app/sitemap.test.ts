import { describe, expect, test } from "bun:test";

import { buildSitemap } from "./sitemap";

describe("sitemap", () => {
  test("publishes the silly list and detail routes", () => {
    const urls = buildSitemap({
      articles: [{ slug: "talking-donkey", type: "silly", updatedAt: 1 }],
      contradictions: [],
    }).map((entry) => entry.url);
    expect(urls.some((url) => url.includes("/silly?text=bible"))).toBe(true);
    expect(
      urls.some((url) => url.includes("/silly/") && !url.includes("?"))
    ).toBe(true);
  });
});
