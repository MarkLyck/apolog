import type { NextConfig } from "next";

import { securityHeaderRules } from "./lib/security-headers";

const nextConfig: NextConfig = {
  headers: async () => securityHeaderRules,
  htmlLimitedBots: /.*/u,
  transpilePackages: ["@apolog/backend", "@apolog/shared", "@apolog/ui"],
};

export default nextConfig;
