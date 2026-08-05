import { describe, expect, test } from "bun:test";

describe("development environment wiring", () => {
  test("loads the repository env before starting Next.js", async () => {
    const manifest = await Bun.file(
      new URL("../package.json", import.meta.url)
    ).json();
    expect(manifest.scripts["dev:web"]).toContain("--env-file=../../.env");
  });

  test("loads the repository env before the production build", async () => {
    const manifest = await Bun.file(
      new URL("../package.json", import.meta.url)
    ).json();
    expect(manifest.scripts.build).toStartWith("dotenv -e .env --");
  });
});
