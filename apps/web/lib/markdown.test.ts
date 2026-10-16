import { describe, expect, test } from "bun:test";

import { prefersMarkdown } from "./markdown";

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
  ])("serves HTML for %p", (accept) => {
    expect(prefersMarkdown(accept)).toBe(false);
  });
});
