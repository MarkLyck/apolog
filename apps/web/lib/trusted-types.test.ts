import { describe, expect, test } from "bun:test";

import { isStaticChunkUrl } from "./trusted-types";

const page = new URL("https://apolog.app/articles/flood");

describe("default Trusted Types script URL policy", () => {
  test("admits same-origin build chunks, relative or absolute", () => {
    expect(isStaticChunkUrl("/_next/static/chunks/a1.js", page)).toBe(true);
    expect(
      isStaticChunkUrl("https://apolog.app/_next/static/chunks/a1.js", page)
    ).toBe(true);
  });

  test("refuses other origins, other paths and script-bearing schemes", () => {
    for (const input of [
      "https://evil.example/_next/static/chunks/a1.js",
      "//evil.example/_next/static/chunks/a1.js",
      "/api/chat",
      "/_next/image?url=x",
      "/_next/static/../../api/reports",
      "data:text/javascript,alert(1)",
    ]) {
      expect(isStaticChunkUrl(input, page)).toBe(false);
    }
  });
});
