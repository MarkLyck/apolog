import { gzipSync } from "node:zlib";

const pageUrl = process.argv[2];
if (!pageUrl) {
  throw new Error("Usage: bun scripts/measure-page-javascript.ts <page-url>");
}

const page = await fetch(pageUrl);
if (!page.ok) {
  throw new Error(`Page request failed with ${page.status}`);
}
const html = await page.text();
const paths = [
  ...new Set(
    [
      ...html.matchAll(/<script\b[^>]*\bsrc="(?<src>[^"]+\.js(?:\?[^"]*)?)"/gu),
    ].map((match) => match[1])
  ),
];
if (paths.length === 0) {
  throw new Error("The page has no JavaScript script tags.");
}

const chunks = await Promise.all(
  paths.map(async (path) => {
    const response = await fetch(new URL(path, pageUrl));
    if (!response.ok) {
      throw new Error(`Script request failed with ${response.status}: ${path}`);
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    return { path, bytes: bytes.length, gzipBytes: gzipSync(bytes).length };
  })
);

process.stdout.write(
  `${JSON.stringify(
    {
      pageUrl,
      chunks,
      bytes: chunks.reduce((sum, chunk) => sum + chunk.bytes, 0),
      gzipBytes: chunks.reduce((sum, chunk) => sum + chunk.gzipBytes, 0),
    },
    null,
    2
  )}\n`
);
