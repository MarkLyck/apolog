import { expect, test } from "bun:test";

import { frontmatter, notFoundMarkdown } from "./markdown";

test("frontmatter values with colons and quotes parse back unchanged", () => {
  const fields = {
    canonical: "https://apolog.example/articles/jesus-lord",
    description: "Is he 'Lord': yes # or no?",
    last_updated: "2026-10-16T00:00:00.000Z",
    title: 'Jesus: "Lord"?',
  };
  expect(Bun.YAML.parse(frontmatter(fields))).toEqual([fields, null]);
});

test("frontmatter omits fields without a value", () => {
  const fields = {
    canonical: "https://apolog.example/",
    description: "Home",
    last_updated: undefined,
    title: "Apolog",
  };
  expect(frontmatter(fields)).not.toContain("last_updated");
});

test("a .md request for an HTML-only page points at the page instead of denying it", () => {
  expect(notFoundMarkdown("/about")).toContain("no Markdown version");
  expect(notFoundMarkdown("/no-such-page")).toContain("has no page at");
  expect(notFoundMarkdown("/articles/no-such-article")).toContain(
    "has no page at"
  );
});
