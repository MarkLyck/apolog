import { describe, expect, test } from "bun:test";

import { corpusFromSearch, parseCorpus, withCorpus } from "./corpus";

describe("corpus selection", () => {
  test("accepts only supported corpus keys", () => {
    expect(parseCorpus("bible")).toBe("bible");
    expect(parseCorpus("quran")).toBe("quran");
    expect(parseCorpus("other")).toBeNull();
    expect(parseCorpus(null)).toBeNull();
  });

  test("reads the Bible when the URL names no supported corpus", () => {
    expect(corpusFromSearch(null)).toBe("bible");
    expect(corpusFromSearch("other")).toBe("bible");
    expect(corpusFromSearch("bible")).toBe("bible");
    expect(corpusFromSearch("quran")).toBe("quran");
  });

  test("names the Quran in the URL and preserves unrelated parameters", () => {
    expect(withCorpus("/debunked?q=flood&sort=relevance", "quran")).toBe(
      "/debunked?q=flood&sort=relevance&text=quran"
    );
  });

  test("leaves the Bible out of the URL", () => {
    expect(withCorpus("/evidence", "bible")).toBe("/evidence");
    expect(withCorpus("/debunked?q=flood&text=quran", "bible")).toBe(
      "/debunked?q=flood"
    );
    expect(withCorpus("/silly?text=quran", "bible")).toBe("/silly");
  });

  test("keeps the hash fragment after the query", () => {
    expect(withCorpus("/#explore", "quran")).toBe("/?text=quran#explore");
    expect(withCorpus("/?text=quran#explore", "bible")).toBe("/#explore");
  });
});
