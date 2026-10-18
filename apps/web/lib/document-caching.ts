import type { HeaderRule } from "./security-headers";

const privatePaths = ["/api", "/admin", "/login", "/signup"] as const;

const trackingParams = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "gbraid",
  "wbraid",
  "dclid",
  "fbclid",
  "msclkid",
  "twclid",
  "mc_cid",
  "mc_eid",
  "_ga",
  "_gl",
];

const nonDocumentSegments = [
  "_next",
  "opengraph-image",
  ...privatePaths.map((path) => path.slice(1)),
];

const documentSource = `/((?!(?:${nonDocumentSegments.join("|")})(?:/|$))[^.]*)`;

export const cacheHeaderRules: HeaderRule[] = [
  {
    headers: [
      {
        key: "No-Vary-Search",
        value: `params=(${trackingParams.map((param) => `"${param}"`).join(" ")}), key-order`,
      },
    ],
    source: "/:path*",
  },
  // Next marks dynamic HTML no-store, which bars it from the back/forward cache.
  {
    headers: [{ key: "Cache-Control", value: "private, no-cache" }],
    source: documentSource,
  },
];

export const speculationRules = {
  prefetch: [
    {
      eagerness: "moderate",
      source: "document",
      where: {
        and: [
          { href_matches: "/*" },
          {
            not: {
              href_matches: privatePaths.flatMap((path) => [path, `${path}/*`]),
            },
          },
        ],
      },
    },
  ],
};
