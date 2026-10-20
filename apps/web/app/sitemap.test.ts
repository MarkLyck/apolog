import { describe, expect, test } from "bun:test";

import { buildSitemap } from "./sitemap";

describe("sitemap", () => {
  test("publishes the silly list and detail routes", () => {
    const urls = buildSitemap({
      articles: [{ slug: "talking-donkey", updatedAt: 1 }],
    }).map((entry) => entry.url);
    expect(urls.some((url) => url.endsWith("/silly"))).toBe(true);
    expect(urls.some((url) => url.endsWith("/silly?text=quran"))).toBe(true);
    expect(urls.some((url) => url.includes("text=bible"))).toBe(false);
    expect(
      urls.some((url) => url.includes("/articles/") && !url.includes("?"))
    ).toBe(true);
    expect(urls.some((url) => url.includes("/map"))).toBe(false);
  });
});
