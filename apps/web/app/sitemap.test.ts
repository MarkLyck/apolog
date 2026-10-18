import { describe, expect, test } from "bun:test";

import { absoluteUrl } from "@/lib/metadata";

import { buildSitemap } from "./sitemap";

describe("sitemap", () => {
  test("publishes the silly list and detail routes", () => {
    const urls = buildSitemap({
      articles: [{ slug: "talking-donkey", updatedAt: 1 }],
    }).map((entry) => entry.url);
    expect(urls.some((url) => url.includes("/silly?text=bible"))).toBe(true);
    expect(
      urls.some((url) => url.includes("/articles/") && !url.includes("?"))
    ).toBe(true);
    expect(urls.some((url) => url.includes("/map"))).toBe(false);
  });

  test("dates only article entries, from their last update", () => {
    const entries = buildSitemap({
      articles: [{ slug: "talking-donkey", updatedAt: 1_700_000_000_000 }],
    });
    const article = entries.find((entry) =>
      entry.url.endsWith("/talking-donkey")
    );
    expect(article?.lastModified).toEqual(new Date(1_700_000_000_000));
    expect(
      entries.filter((entry) => !entry.url.includes("/articles/"))
    ).not.toContainEqual(
      expect.objectContaining({ lastModified: expect.anything() })
    );
  });

  test("lists each page by its canonical URL", () => {
    const urls = buildSitemap({ articles: [] }).map((entry) => entry.url);
    expect(urls).toContain(absoluteUrl("/"));
    expect(urls).toContain(absoluteUrl("/?text=quran"));
    expect(urls).not.toContain(absoluteUrl("/?text=bible"));
    expect(urls.filter((url) => url.includes("/privacy"))).toEqual([
      absoluteUrl("/privacy"),
    ]);
  });
});
