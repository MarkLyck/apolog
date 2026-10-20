import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
        port: "",
        protocol: "https",
        search: "",
      },
    ],
  },
  transpilePackages: ["@apolog/backend", "@apolog/shared", "@apolog/ui"],
};

export default nextConfig;
