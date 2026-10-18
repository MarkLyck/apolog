import type { NextConfig } from "next";

import { linkHeader } from "./lib/discovery";
import { cacheHeaderRules } from "./lib/document-caching";
import { securityHeaderRules } from "./lib/security-headers";

const markdownSource = "/articles/:slug.md";

const nextConfig: NextConfig = {
  async headers() {
    return [
      ...securityHeaderRules,
      ...cacheHeaderRules,
      { headers: [{ key: "Link", value: linkHeader() }], source: "/:path*" },
      {
        headers: [
          {
            key: "Link",
            value: `${linkHeader()}, </articles/:slug>; rel="canonical"`,
          },
        ],
        source: markdownSource,
      },
    ];
  },
  htmlLimitedBots: /.*/u,
  async rewrites() {
    return [
      { destination: "/api/articles/:slug/markdown", source: markdownSource },
    ];
  },
  skipTrailingSlashRedirect: true,
  transpilePackages: ["@apolog/backend", "@apolog/shared", "@apolog/ui"],
};

export default nextConfig;
