import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import { CorpusSwitch } from "./corpus-switch";

describe("CorpusSwitch", () => {
  test("announces its purpose and marks the active selection", () => {
    const html = renderToStaticMarkup(
      <CorpusSwitch
        corpusKey="bible"
        pathname="/evidence"
        search="q=evolution"
      />
    );
    expect(html).toContain('aria-label="Choose text corpus"');
    expect(html).toContain('aria-current="true"');
    expect(html).toContain("/evidence?q=evolution&amp;text=quran");
  });

  test("switches back to the Bible by dropping the corpus from the URL", () => {
    const html = renderToStaticMarkup(
      <CorpusSwitch
        corpusKey="quran"
        pathname="/evidence"
        search="q=evolution&text=quran"
      />
    );
    expect(html).toContain('href="/evidence?q=evolution"');
    expect(html).not.toContain("text=bible");
  });
});
