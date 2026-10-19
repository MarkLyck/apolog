export const defaultTrustedTypePolicy = "default";

const chunkPathPrefix = "/_next/static/";

export function isStaticChunkUrl(input: string, page: URL): boolean {
  const url = new URL(input, page);
  return url.origin === page.origin && url.pathname.startsWith(chunkPathPrefix);
}
