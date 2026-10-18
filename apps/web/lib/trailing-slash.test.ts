import { describe, expect, test } from "bun:test";

import { NextRequest } from "next/server";

import { redirectWithoutTrailingSlash } from "./trailing-slash";

const redirectFor = (url: string) =>
  redirectWithoutTrailingSlash(new NextRequest(url));

describe("trailing slash redirect", () => {
  test("sends a signed permanent redirect to the path without the slash", () => {
    const response = redirectFor("https://apolog.app/debunked/?text=quran");
    expect(response?.status).toBe(308);
    expect(response?.headers.get("location")).toBe(
      "https://apolog.app/debunked?text=quran"
    );
    expect(response?.headers.get("redirect-by")).toBe("Apolog");
  });

  test("collapses repeated slashes", () => {
    expect(
      redirectFor("https://apolog.app/articles/flood//")?.headers.get(
        "location"
      )
    ).toBe("https://apolog.app/articles/flood");
  });

  test("leaves the root and slashless paths alone", () => {
    expect(redirectFor("https://apolog.app/")).toBeNull();
    expect(redirectFor("https://apolog.app/debunked")).toBeNull();
  });
});
