import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import { PrimaryNavigation } from "./site-header";

describe("PrimaryNavigation", () => {
  test("shows every route without a clipped mobile scroller", () => {
    const html = renderToStaticMarkup(
      <PrimaryNavigation
        corpusKey="quran"
        pathname="/silly/solomon-understands-the-ant"
        variant="mobile"
      />
    );

    expect(html).toContain("flex-wrap");
    expect(html).not.toContain("overflow-x-auto");
    expect(html).toContain("Contradictions");
    expect(html).toContain("Debunked");
    expect(html).toContain("Immoral");
    expect(html).toContain("Evidence");
    expect(html).toContain("Silly");
    expect(html).not.toContain("Map");
    expect(html).toContain("Debate");
    expect(html).toContain("/silly?text=quran");
    expect(html).toContain('aria-current="page"');
  });
});
