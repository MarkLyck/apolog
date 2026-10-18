import { describe, expect, test } from "bun:test";

import nextConfig from "../next.config";

describe("security headers", () => {
  test("every route gets the static header set, and the share image stays embeddable", async () => {
    expect(await nextConfig.headers?.()).toEqual(
      expect.arrayContaining([
        {
          headers: [
            { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
            { key: "X-Frame-Options", value: "DENY" },
            { key: "X-Content-Type-Options", value: "nosniff" },
            {
              key: "Referrer-Policy",
              value: "strict-origin-when-cross-origin",
            },
            {
              key: "Permissions-Policy",
              value:
                "accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), xr-spatial-tracking=()",
            },
            { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
            { key: "Cross-Origin-Resource-Policy", value: "same-site" },
          ],
          source: "/:path*",
        },
        {
          headers: [
            { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
          ],
          source: "/opengraph-image",
        },
      ])
    );
  });
});
