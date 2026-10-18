import { afterEach, describe, expect, spyOn, test } from "bun:test";

import { POST } from "./route";

const logged = spyOn(console, "info").mockImplementation(() => {});

afterEach(() => logged.mockClear());

const post = (contentType: string, body: string) =>
  POST(
    new Request("http://localhost/api/reports", {
      body,
      headers: { "content-type": contentType },
      method: "POST",
    })
  );

describe("browser report collector", () => {
  test("logs a Reporting API batch without query strings and answers 204", async () => {
    const response = await post(
      "application/reports+json",
      JSON.stringify([
        {
          age: 10,
          body: {
            blockedURL: "https://evil.example/x.js?token=secret",
            disposition: "enforce",
            effectiveDirective: "script-src-elem",
          },
          type: "csp-violation",
          url: "https://apolog.app/articles/flood?text=quran",
          user_agent: "Mozilla/5.0",
        },
        {
          body: { id: "UnloadHandler" },
          type: "deprecation",
          url: "https://apolog.app/",
        },
      ])
    );
    expect(response.status).toBe(204);
    expect(logged.mock.calls.map(([line]) => line)).toEqual([
      "[browser-report] csp-violation /articles/flood script-src-elem https://evil.example/x.js enforce",
      "[browser-report] deprecation / UnloadHandler",
    ]);
  });

  test("accepts the legacy application/csp-report shape", async () => {
    const response = await post(
      "application/csp-report",
      JSON.stringify({
        "csp-report": {
          "blocked-uri": "inline",
          disposition: "report",
          "document-uri": "https://apolog.app/debate?q=1",
          "violated-directive": "script-src",
        },
      })
    );
    expect(response.status).toBe(204);
    expect(logged.mock.calls[0]?.[0]).toBe(
      "[browser-report] csp-violation /debate script-src inline report"
    );
  });

  test("rejects other content types, oversized bodies and malformed reports without logging", async () => {
    expect((await post("application/json", "[]")).status).toBe(415);
    expect(
      (
        await post(
          "application/reports+json",
          JSON.stringify("x".repeat(70_000))
        )
      ).status
    ).toBe(413);
    expect((await post("application/reports+json", "{not json")).status).toBe(
      400
    );
    expect(
      (await post("application/reports+json", '[{"type":1}]')).status
    ).toBe(400);
    expect(logged).not.toHaveBeenCalled();
  });
});
