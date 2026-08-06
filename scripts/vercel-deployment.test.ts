import { describe, expect, test } from "bun:test";

describe("Vercel deployment wiring", () => {
  test("deploys Convex before building the web app", async () => {
    const config = await Bun.file(
      new URL("../apps/web/vercel.json", import.meta.url)
    ).json();

    expect(config.buildCommand).toContain("convex deploy");
    expect(config.buildCommand).toContain("--preview-run seed:seed");
    expect(config.buildCommand).toContain(
      "--cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL"
    );
    expect(config.buildCommand).toContain(
      "--cmd 'bun turbo run build --filter=@apolog/web'"
    );
  });
});
