import { describe, expect, test } from "bun:test";

import { corpusCanonical } from "@/lib/corpus";

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

  test("lists every corpus page at its own canonical URL", async () => {
    const corpusUrls = buildSitemap({ articles: [] }).map(
      (entry) => new URL(entry.url)
    );
    expect(corpusUrls.length).toBeGreaterThan(0);
    for (const url of corpusUrls) {
      // SAFETY: a parsed absolute URL's pathname always starts with "/".
      const canonical = await corpusCanonical(
        url.pathname as `/${string}`,
        Promise.resolve({
          ...Object.fromEntries(url.searchParams),
          q: "flood",
          sort: "oldest",
        })
      );
      expect(new URL(canonical, url.origin).href).toBe(url.href);
    }
  });

  test("publishes each site information page once, without a corpus", () => {
    const urls = buildSitemap({ articles: [] }).map((entry) => entry.url);
    for (const route of ["/about", "/contact", "/privacy"]) {
      expect(urls.filter((url) => url.includes(route))).toEqual([
        expect.stringMatching(new RegExp(`${route}$`, "u")),
      ]);
    }
  });
});
