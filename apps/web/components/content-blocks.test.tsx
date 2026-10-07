import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import { ContentBlocks } from "./content-blocks";

describe("article image rendering", () => {
  test("renders a responsive image with its description and plain-text caption", () => {
    const html = renderToStaticMarkup(
      <ContentBlocks
        blocks={[
          {
            alt: "An Earth blueprint with four corners",
            caption: "God <needs> geometry",
            id: "meme",
            src: "https://example.com/meme.png",
            type: "image",
          },
        ]}
      />
    );
    expect(html).toContain('<figure class="my-8">');
    expect(html).toContain('alt="An Earth blueprint with four corners"');
    expect(html).toContain('src="https://example.com/meme.png"');
    expect(html).toContain('class="h-auto w-full rounded-2xl"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('referrerPolicy="no-referrer"');
    expect(html).toContain("God &lt;needs&gt; geometry");
    expect(html).not.toContain("<needs>");
  });

  test("omits the caption when the image has none", () => {
    const html = renderToStaticMarkup(
      <ContentBlocks
        blocks={[
          {
            alt: "A globe",
            id: "globe",
            src: "https://example.com/globe.png",
            type: "image",
          },
        ]}
      />
    );
    expect(html).toContain("<img");
    expect(html).not.toContain("<figcaption");
  });

  test.each([
    { width: 1254, height: 1254 },
    { width: 1254 },
    { height: 1254 },
    {},
  ])("renders supplied intrinsic dimensions independently %j", (dimensions) => {
    const html = renderToStaticMarkup(
      <ContentBlocks
        blocks={[
          {
            alt: "A globe",
            id: "globe",
            src: "https://example.com/globe.png",
            type: "image",
            ...dimensions,
          },
        ]}
      />
    );
    for (const field of ["width", "height"]) {
      expect(html.includes(`${field}="1254"`)).toBe(field in dimensions);
    }
  });
});
