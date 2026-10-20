import { describe, expect, test } from "bun:test";

import { contentBlockSchema } from "@apolog/shared/content";
import * as Result from "effect/Result";
import * as Schema from "effect/Schema";
import { hasRemoteMatch } from "next/dist/shared/lib/match-remote-pattern";

import nextConfig from "./next.config";

const candidates = [
  "https://h10hqun98rmndyjq.public.blob.vercel-storage.com/articles/a-Xy12.webp",
  "https://store.public.blob.vercel-storage.com/a.png",
  "http://store.public.blob.vercel-storage.com/a.png",
  "https://a.b.public.blob.vercel-storage.com/a.png",
  "https://public.blob.vercel-storage.com/a.png",
  "https://store.public.blob.vercel-storage.com:8443/a.png",
  "https://store.public.blob.vercel-storage.com/a.png?w=1",
  "https://example.com/a.png",
];

describe("image hosting", () => {
  test.each(candidates)(
    "next/image renders %s exactly when the content schema accepts it",
    (src) => {
      const accepted = Result.isSuccess(
        Schema.decodeUnknownResult(contentBlockSchema)({
          alt: "Alt",
          height: 1,
          id: "image",
          src,
          type: "image",
          width: 1,
        })
      );
      expect(
        hasRemoteMatch(
          [],
          nextConfig.images?.remotePatterns ?? [],
          new URL(src)
        )
      ).toBe(accepted);
    }
  );
});
