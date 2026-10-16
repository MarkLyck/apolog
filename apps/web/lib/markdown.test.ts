import { expect, test } from "bun:test";

import { articleMarkdown, frontmatter, notFoundMarkdown } from "./markdown";
import { siteConfig } from "./site";

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

test("article Markdown keeps inline link destinations", () => {
  const markdown = articleMarkdown({
    document: {
      blocks: [
        {
          content: [
            { id: "a", text: "See ", type: "text" },
            {
              href: "https://example.org/a_(b)",
              id: "b",
              text: "the [source]",
              type: "link",
            },
            { id: "c", text: " and ", type: "text" },
            { href: "/articles/flood", id: "d", text: "flood", type: "link" },
          ],
          id: "p",
          type: "paragraph",
        },
      ],
    },
    slug: "links",
    sources: [],
    summary: "Summary",
    title: "Links",
    updatedAt: 0,
  });
  expect(markdown).toContain(
    "See [the \\[source\\]](https://example.org/a_%28b%29) and "
  );
  expect(markdown).toContain(`[flood](${siteConfig.url}/articles/flood)`);
});

test("article Markdown keeps inline marks", () => {
  const markdown = articleMarkdown({
    document: {
      blocks: [
        {
          content: [
            {
              id: "a",
              marks: ["strikethrough"],
              text: "Old claim",
              type: "text",
            },
            { id: "b", text: " then ", type: "text" },
            {
              id: "c",
              marks: ["bold", "italic"],
              text: "new claim ",
              type: "text",
            },
            { id: "d", marks: ["code"], text: "a`b", type: "text" },
          ],
          id: "p",
          type: "paragraph",
        },
      ],
    },
    slug: "marks",
    sources: [],
    summary: "Summary",
    title: "Marks",
    updatedAt: 0,
  });
  expect(markdown).toContain("~~Old claim~~ then **_new claim_** `` a`b ``");
});
