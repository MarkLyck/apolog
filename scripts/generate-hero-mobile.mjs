import sharp from "sharp";

await sharp("apps/web/public/images/exalt-hero-sky.webp")
  .extract({ left: 896, top: 0, width: 768, height: 1441 })
  .webp({ quality: 85 })
  .toFile("apps/web/public/images/exalt-hero-sky-mobile.webp");
