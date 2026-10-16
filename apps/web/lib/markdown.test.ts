import { expect, test } from "bun:test";

import { frontmatter } from "./markdown";

test("frontmatter values with colons and quotes parse back unchanged", () => {
  const fields = {
    canonical: "https://apolog.example/articles/jesus-lord",
    description: "Is he 'Lord': yes # or no?",
    last_updated: "2026-10-16T00:00:00.000Z",
    title: 'Jesus: "Lord"?',
  };
  expect(Bun.YAML.parse(frontmatter(fields))).toEqual([fields, null]);
});
