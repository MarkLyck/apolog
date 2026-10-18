import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  htmlLimitedBots: /.*/u,
  transpilePackages: ["@apolog/backend", "@apolog/shared", "@apolog/ui"],
};

export default nextConfig;
