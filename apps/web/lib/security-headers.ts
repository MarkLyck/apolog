import type { NextConfig } from "next";

type HeaderRule = Awaited<
  ReturnType<NonNullable<NextConfig["headers"]>>
>[number];

const deniedFeatures = [
  "accelerometer",
  "autoplay",
  "camera",
  "display-capture",
  "encrypted-media",
  "fullscreen",
  "geolocation",
  "gyroscope",
  "keyboard-map",
  "magnetometer",
  "microphone",
  "midi",
  "payment",
  "picture-in-picture",
  "publickey-credentials-get",
  "screen-wake-lock",
  "sync-xhr",
  "usb",
  "xr-spatial-tracking",
];

const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: deniedFeatures.map((feature) => `${feature}=()`).join(", "),
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
];

export const securityHeaderRules: HeaderRule[] = [
  { headers: securityHeaders, source: "/:path*" },
  {
    headers: [{ key: "Cross-Origin-Resource-Policy", value: "cross-origin" }],
    source: "/opengraph-image",
  },
];
