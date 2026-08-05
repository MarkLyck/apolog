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
});
