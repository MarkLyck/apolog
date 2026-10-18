import { describe, expect, test } from "bun:test";

import { articleSlugFromPathname } from "./article-route";

describe("article slug from pathname", () => {
  test("reads the decoded slug of an article page", () => {
    expect(articleSlugFromPathname("/articles/global-flood-evidence")).toBe(
      "global-flood-evidence"
    );
    expect(articleSlugFromPathname("/articles/caf%C3%A9")).toBe("café");
  });

  test("ignores paths that are not a single article segment", () => {
    expect(articleSlugFromPathname("/articles")).toBeNull();
    expect(articleSlugFromPathname("/articles/")).toBeNull();
    expect(articleSlugFromPathname("/articles/a/b")).toBeNull();
    expect(articleSlugFromPathname("/login")).toBeNull();
    expect(
      articleSlugFromPathname("/articles/global-flood-evidence.md")
    ).toBeNull();
  });

  test("leaves malformed encodings to the router", () => {
    expect(articleSlugFromPathname("/articles/a%ZZ")).toBeNull();
  });
});
