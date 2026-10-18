import { defaultTrustedTypePolicy } from "./trusted-types";

const reportsPath = "/api/reports";

const reportGroup = "csp-endpoint";

const trustedTypePolicies = [defaultTrustedTypePolicy, "ProseMirrorClipboard"];

type Directive = readonly [name: string, ...sources: string[]];

export type DocumentPolicyInput = {
  convexUrl: string | undefined;
  development: boolean;
  https: boolean;
  nonce: string;
};

export type DocumentSecurityHeaders = {
  "Content-Security-Policy": string;
  "Content-Security-Policy-Report-Only": string;
  "Reporting-Endpoints": string;
};

const serialize = (directives: Directive[]) =>
  directives.map((directive) => directive.join(" ")).join("; ");

function convexOrigins(convexUrl: string | undefined): string[] {
  if (!convexUrl) {
    return [];
  }
  const { host } = new URL(convexUrl);
  return [`https://${host}`, `wss://${host}`];
}

export function documentSecurityHeaders({
  convexUrl,
  development,
  https,
  nonce,
}: DocumentPolicyInput): DocumentSecurityHeaders {
  const enforced: Directive[] = [
    ["default-src", "'self'"],
    [
      "script-src",
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      // React rebuilds server error stacks with eval in development only.
      ...(development ? ["'unsafe-eval'"] : []),
    ],
    ["style-src", "'self'", "'unsafe-inline'"],
    ["img-src", "'self'", "data:"],
    ["font-src", "'self'"],
    ["connect-src", "'self'", ...convexOrigins(convexUrl)],
    ["object-src", "'none'"],
    ["base-uri", "'none'"],
    ["form-action", "'self'"],
    ["frame-ancestors", "'none'"],
    ...(https ? [["upgrade-insecure-requests"] as const] : []),
    ["report-to", reportGroup],
  ];
  const reportOnly: Directive[] = [
    ["require-trusted-types-for", "'script'"],
    ["trusted-types", ...trustedTypePolicies],
    ["report-to", reportGroup],
  ];
  return {
    "Content-Security-Policy": serialize(enforced),
    "Content-Security-Policy-Report-Only": serialize(reportOnly),
    "Reporting-Endpoints": `${reportGroup}="${reportsPath}", default="${reportsPath}"`,
  };
}
