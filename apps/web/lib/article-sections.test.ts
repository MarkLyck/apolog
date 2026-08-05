import { describe, expect, test } from "bun:test";

import { articleSections } from "./article-sections";

describe("article section navigation", () => {
  test("includes the requested silly route and reader-facing copy", () => {
    expect(articleSections).toContainEqual({
      href: "/silly",
      label: "Silly",
      type: "silly",
    });
  });
});
