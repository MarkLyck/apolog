import { describe, expect, test } from "bun:test";

import { buildCustomRoute } from "next/dist/lib/build-custom-route";

import nextConfig from "../next.config";
import { speculationRules } from "./document-caching";

const origin = "https://apolog.test";

async function headerFor(key: string, pathname: string) {
  const rules = (await nextConfig.headers?.()) ?? [];
  const values = rules
    .filter((rule) =>
      new RegExp(buildCustomRoute("header", rule).regex, "u").test(pathname)
    )
    .flatMap((rule) => rule.headers)
    .filter((header) => header.key === key);
  return values.at(-1)?.value;
}

describe("document caching", () => {
  test("HTML pages revalidate instead of opting out of the back/forward cache", async () => {
    for (const pathname of ["/", "/debunked", "/articles/global-flood"]) {
      expect(await headerFor("Cache-Control", pathname)).toBe(
        "private, no-cache"
      );
    }
  });

  test("private, framework, and file routes keep Next's own Cache-Control", async () => {
    for (const pathname of [
      "/api",
      "/api/search/articles",
      "/admin/articles/abc",
      "/login",
      "/signup",
      "/_next/static/chunks/app.js",
      "/opengraph-image",
      "/sitemap.xml",
      "/favicon.ico",
    ]) {
      expect(await headerFor("Cache-Control", pathname)).toBeUndefined();
    }
  });

  test("No-Vary-Search ignores tracking params but not params that change content", async () => {
    const value = (await headerFor("No-Vary-Search", "/debunked")) ?? "";
    const ignored = [...value.matchAll(/"(?<param>[^"]+)"/gu)].map(
      (match) => match.groups?.param
    );
    expect(ignored).toEqual(
      expect.arrayContaining(["utm_source", "utm_campaign", "gclid", "fbclid"])
    );
    for (const param of ["text", "q", "sort", "from"]) {
      expect(ignored).not.toContain(param);
    }
    expect(value).toEndWith(", key-order");
  });

  test("speculation prefetches same-origin pages and skips private routes", () => {
    const [rule] = speculationRules.prefetch;
    const [scope, exclusion] = rule?.where.and ?? [];
    const matches = (patterns: string | readonly string[], url: string) =>
      [patterns]
        .flat()
        .some((pattern) =>
          new URLPattern(pattern, origin).test(new URL(url, origin))
        );
    const prefetched = (url: string) =>
      matches(scope?.href_matches ?? [], url) &&
      !matches(exclusion?.not?.href_matches ?? [], url);

    expect(rule?.eagerness).toBe("moderate");
    expect(prefetched("/debunked?text=quran")).toBe(true);
    expect(prefetched("/articles/global-flood?from=evidence")).toBe(true);
    for (const url of [
      "https://example.com/debunked",
      "/api/search/articles?q=flood",
      "/admin/articles/abc",
      "/login?next=/debunked",
      "/signup",
    ]) {
      expect(prefetched(url)).toBe(false);
    }
  });
});
