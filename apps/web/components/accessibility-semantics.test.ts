import { describe, expect, test } from "bun:test";

const routeContentFiles = [
  new URL("../app/page.tsx", import.meta.url),
  new URL("../app/articles/[slug]/page.tsx", import.meta.url),
  new URL("article-detail-page.tsx", import.meta.url),
  new URL("content-blocks.tsx", import.meta.url),
  new URL("content-block-renderers.tsx", import.meta.url),
];

describe("route landmark semantics", () => {
  test("does not nest complementary landmarks inside the global main landmark", async () => {
    const sources = await Promise.all(
      routeContentFiles.map((file) => Bun.file(file).text())
    );
    expect(sources.join("\n")).not.toMatch(/<\/?aside(?:\s|>)/u);
  });

  test("keeps editorial callouts exposed as notes", async () => {
    const source = await Bun.file(
      new URL("content-block-renderers.tsx", import.meta.url)
    ).text();
    expect(source).toContain('role="note"');
  });
});
