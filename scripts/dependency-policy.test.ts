import { describe, expect, test } from "bun:test";

import { checkDependencyPolicy } from "./dependency-policy";

describe("dependency policy", () => {
  test("all manifests use exact external versions and the root pins Bun", async () => {
    const result = await checkDependencyPolicy(process.cwd());
    expect(result.errors).toEqual([]);
  });
});
