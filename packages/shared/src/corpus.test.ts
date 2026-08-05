import { describe, expect, test } from "bun:test";

import { parseCorpus, resolveCorpus, withCorpus } from "./corpus";

describe("corpus selection", () => {
  test("accepts only supported corpus keys", () => {
    expect(parseCorpus("bible")).toBe("bible");
    expect(parseCorpus("quran")).toBe("quran");
    expect(parseCorpus("other")).toBeNull();
    expect(parseCorpus(null)).toBeNull();
  });

  test("uses URL state before cookie and Bible as the final fallback", () => {
    expect(resolveCorpus("quran", "bible")).toBe("quran");
    expect(resolveCorpus(null, "quran")).toBe("quran");
    expect(resolveCorpus(null, null)).toBe("bible");
  });

  test("preserves unrelated query parameters when switching", () => {
    expect(withCorpus("/debunked?q=flood&sort=relevance", "quran")).toBe(
      "/debunked?q=flood&sort=relevance&text=quran"
    );
  });
});
