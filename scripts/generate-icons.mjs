import { copyFile, mkdir, writeFile } from "node:fs/promises";

import sharp from "sharp";

const source = new URL("../favicon.svg", import.meta.url);
const destination = new URL("../apps/web/public/", import.meta.url);
await mkdir(destination, { recursive: true });
await copyFile(source, new URL("favicon.svg", destination));

for (const [filename, size] of [
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
]) {
  await sharp(source.pathname)
    .resize(size, size)
    .png()
    .toFile(new URL(filename, destination).pathname);
}

// Keep the entire letter inside Android's central 80% safe-zone circle.
await sharp(source.pathname)
  .resize(410, 410)
  .extend({
    background: "#db3f27",
    bottom: 51,
    left: 51,
    right: 51,
    top: 51,
  })
  .png()
  .toFile(new URL("icon-maskable-512.png", destination).pathname);

// ICO directory entries point to independently rendered PNG frames.
const sizes = [16, 32, 48];
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
const frames = [];
let offset = directory.length;
for (const [index, size] of sizes.entries()) {
  const frame = await sharp(source.pathname)
    .resize(size, size)
    .png()
    .toBuffer();
  const entry = 6 + index * 16;
  directory.writeUInt8(size, entry);
  directory.writeUInt8(size, entry + 1);
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(frame.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  frames.push(frame);
  offset += frame.length;
}
await writeFile(
  new URL("favicon.ico", destination),
  Buffer.concat([directory, ...frames])
);
