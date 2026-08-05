import { describe, expect, test } from "bun:test";

import { articleSections, publicRoutes, sitemapRoutes } from "./public-routes";

describe("public routes", () => {
  test("includes the requested silly route and reader-facing copy", () => {
    expect(articleSections).toContainEqual({
      href: "/silly",
      label: "Silly",
      type: "silly",
    });
  });

  test("publishes every public route to the sitemap", () => {
    expect(sitemapRoutes).toEqual(Object.values(publicRoutes));
  });
});
