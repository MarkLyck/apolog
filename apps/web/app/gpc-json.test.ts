import { describe, expect, test } from "bun:test";

import { privacyPolicyUpdated } from "@/lib/privacy";

import { GET } from "./.well-known/gpc.json/route";

describe("GPC support resource", () => {
  test("declares GPC support as JSON dated with the privacy policy", async () => {
    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toStartWith(
      "application/json"
    );
    expect(await response.json()).toEqual({
      gpc: true,
      lastUpdate: privacyPolicyUpdated,
    });
  });
});
