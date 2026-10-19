import { describe, expect, test } from "bun:test";

import { documentSecurityHeaders } from "./content-security-policy";

const directives = (policy: string) =>
  new Map(
    policy.split("; ").map((directive) => {
      const [name = "", ...sources] = directive.split(" ");
      return [name, sources] as const;
    })
  );

const production = {
  convexUrl: "https://brave-otter-123.convex.cloud",
  development: false,
  https: true,
  nonce: "bm9uY2U=",
};

describe("document security headers", () => {
  test("enforces a nonce-based script policy with no unsafe fallbacks in production", () => {
    const policy = directives(
      documentSecurityHeaders(production)["Content-Security-Policy"]
    );
    expect(policy.get("script-src")).toEqual([
      "'self'",
      "'nonce-bm9uY2U='",
      "'strict-dynamic'",
    ]);
    expect(policy.get("object-src")).toEqual(["'none'"]);
    expect(policy.get("base-uri")).toEqual(["'none'"]);
    expect(policy.get("frame-ancestors")).toEqual(["'none'"]);
    expect(policy.get("connect-src")).toEqual([
      "'self'",
      "https://brave-otter-123.convex.cloud",
      "wss://brave-otter-123.convex.cloud",
    ]);
    expect(policy.has("upgrade-insecure-requests")).toBe(true);
  });

  test("allows eval only in development and upgrades requests only over https", () => {
    const policy = directives(
      documentSecurityHeaders({
        ...production,
        development: true,
        https: false,
      })["Content-Security-Policy"]
    );
    expect(policy.get("script-src")).toContain("'unsafe-eval'");
    expect(policy.has("upgrade-insecure-requests")).toBe(false);
  });

  test("every report-to group is a declared reporting endpoint, alongside default", () => {
    const headers = documentSecurityHeaders(production);
    const endpoints = new Map(
      [
        ...headers["Reporting-Endpoints"].matchAll(
          /(?<name>[\w-]+)="(?<url>[^"]+)"/gu
        ),
      ].map((match) => [match.groups?.name, match.groups?.url])
    );
    expect(endpoints.get("default")).toBe("/api/reports");
    for (const policy of [
      headers["Content-Security-Policy"],
      headers["Content-Security-Policy-Report-Only"],
    ]) {
      const [group] = directives(policy).get("report-to") ?? [];
      expect(endpoints.get(group ?? "")).toBe("/api/reports");
    }
  });

  test("trials Trusted Types in report-only mode with a named policy allowlist", () => {
    const policy = directives(
      documentSecurityHeaders(production)["Content-Security-Policy-Report-Only"]
    );
    expect(policy.get("require-trusted-types-for")).toEqual(["'script'"]);
    expect(policy.get("trusted-types")).toEqual([
      "default",
      "ProseMirrorClipboard",
    ]);
  });
});
