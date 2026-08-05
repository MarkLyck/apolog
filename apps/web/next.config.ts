import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@apolog/backend", "@apolog/shared", "@apolog/ui"],
};

export default nextConfig;
