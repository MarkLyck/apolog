import { describe, expect, test } from "bun:test";

import { vercelDeploymentCommands } from "./vercel-build";

describe("Vercel deployment wiring", () => {
  test("runs the repository deployment orchestrator", async () => {
    const config = await Bun.file(
      new URL("../apps/web/vercel.json", import.meta.url)
    ).json();

    expect(config.buildCommand).toBe("cd ../.. && bun scripts/vercel-build.ts");
  });

  test("deploys, builds, then seeds the current preview", () => {
    expect(
      vercelDeploymentCommands("preview", "feature/article-model")
    ).toEqual([
      [
        "bunx",
        "convex",
        "deploy",
        "--cmd-url-env-var-name",
        "NEXT_PUBLIC_CONVEX_URL",
        "--cmd",
        "bun turbo run build --filter=@apolog/web",
      ],
      [
        "bunx",
        "convex",
        "run",
        "seed:seed",
        "--preview-name",
        "feature/article-model",
      ],
    ]);
  });

  test("never seeds production", () => {
    expect(vercelDeploymentCommands("production", "main")).toHaveLength(1);
  });

  test("fails closed when a preview branch cannot be identified", () => {
    expect(() => vercelDeploymentCommands("preview")).toThrow(
      "VERCEL_GIT_COMMIT_REF is required for preview seeding"
    );
  });
});
