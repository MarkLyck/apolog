import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import { SearchTrigger } from "./search-trigger";

describe("SearchTrigger", () => {
  test("remains available to touch users at mobile widths", () => {
    const html = renderToStaticMarkup(<SearchTrigger onOpen={() => {}} />);
    const buttonTag = html.slice(0, html.indexOf(">"));
    expect(html).toContain('aria-label="Open search"');
    expect(html).toContain("data-search-trigger");
    expect(buttonTag).not.toContain('class="hidden');
  });
});
