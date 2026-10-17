import { describe, expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import path from "node:path";

import {
  markdownTarget,
  matchRoute,
  parseRoutePattern,
  prefersMarkdown,
  routeTable,
} from "./markdown-routes";

const webRoot = path.join(import.meta.dir, "..");

const metadataRoutes = new Map([
  ["manifest.ts", "manifest.webmanifest"],
  ["opengraph-image.tsx", "opengraph-image"],
  ["robots.ts", "robots.txt"],
  ["sitemap.ts", "sitemap.xml"],
]);
const metadataFile =
  /^(?:favicon|icon\d*|apple-icon\d*|opengraph-image\d*|twitter-image\d*|sitemap|robots|manifest)\.(?:[jt]sx?|xml|txt|json|webmanifest|ico|png|jpe?g|gif|svg)$/u;

function routeFiles(directory: string) {
  return readdirSync(path.join(webRoot, directory), {
    recursive: true,
    withFileTypes: true,
  })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      path
        .relative(
          path.join(webRoot, directory),
          path.join(entry.parentPath, entry.name)
        )
        .split(path.sep)
    );
}

function appRoutePatterns() {
  return routeFiles("app").flatMap((parts) => {
    const file = parts.at(-1) ?? "";
    const folders = parts
      .slice(0, -1)
      .filter((folder) => !/^\(.*\)$/u.test(folder));
    if (/^(?:page|route)\.(?:[jt]sx?|mdx?)$/u.test(file)) {
      return [`/${folders.join("/")}`];
    }
    const metadataRoute = metadataRoutes.get(file);
    if (metadataRoute) {
      return [`/${[...folders, metadataRoute].join("/")}`];
    }
    return metadataFile.test(file)
      ? [`unmapped metadata file ${parts.join("/")}`]
      : [];
  });
}

describe("Markdown route table", () => {
  test("knows every page, route handler, and metadata route under app/", () => {
    const appEntries = routeTable
      .filter(({ kind }) => kind !== "public")
      .map(({ pattern }) => pattern);
    expect(appRoutePatterns().sort()).toEqual(appEntries.sort());
  });

  test("knows every file in public/", () => {
    const unmatched = routeFiles("public")
      .map((parts) => `/${parts.join("/")}`)
      .filter((file) => matchRoute(file)?.route.kind !== "public");
    expect(unmatched).toEqual([]);
  });

  test("matches static segments before dynamic ones", () => {
    expect(matchRoute("/admin/articles/new")?.route.pattern).toBe(
      "/admin/articles/new"
    );
    expect(matchRoute("/articles/genesis-flood")).toEqual({
      params: { slug: "genesis-flood" },
      route: { kind: "markdown", pattern: "/articles/[slug]" },
    });
    expect(matchRoute("/articles/genesis-flood/extra")).toBeNull();
  });
});

describe("matchRoute", () => {
  test("binds hyphenated dynamic segments", () => {
    expect(
      parseRoutePattern("/notes/[note-id]").map((segment) => segment.kind)
    ).toEqual(["static", "param"]);
  });
});

describe("markdownTarget", () => {
  test.each([
    ["/", "/"],
    ["/articles/genesis-flood", "/articles/genesis-flood"],
    ["/some-path-that-does-not-exist", "/some-path-that-does-not-exist"],
    ["/contradictions/extra", "/contradictions/extra"],
  ])("renders Markdown for %p", (pathname, target) => {
    expect(markdownTarget(pathname, "text/markdown")).toBe(target);
  });

  test.each([
    "/contradictions",
    "/login",
    "/api/chat",
    "/sitemap.xml",
    "/robots.txt",
    "/manifest.webmanifest",
    "/opengraph-image",
    "/favicon.ico",
    "/images/exalt-hero-sky.webp",
    "/admin/articles/abc",
  ])("leaves %p to its own handler", (pathname) => {
    expect(markdownTarget(pathname, "text/markdown")).toBeNull();
  });

  test("serves .md paths regardless of Accept", () => {
    expect(markdownTarget("/index.md", "text/html")).toBe("/");
    expect(markdownTarget("/articles/genesis-flood.md", null)).toBe(
      "/articles/genesis-flood"
    );
  });

  test("leaves browser requests alone", () => {
    expect(markdownTarget("/missing", "text/html")).toBeNull();
    expect(markdownTarget("/", "text/html")).toBeNull();
  });
});

describe("prefersMarkdown", () => {
  test.each([
    "text/markdown",
    "text/markdown, text/html;q=0.9",
    "text/html;q=0.5, text/markdown",
    "text/markdown, */*;q=0.8",
    "text/x-markdown",
  ])("serves Markdown for %p", (accept) => {
    expect(prefersMarkdown(accept)).toBe(true);
  });

  test.each([
    null,
    "",
    "text/html",
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "*/*",
    "text/markdown;q=0.5, text/html",
    "text/markdown;q=0",
    "text/markdown;Q=0",
  ])("serves HTML for %p", (accept) => {
    expect(prefersMarkdown(accept)).toBe(false);
  });
});
