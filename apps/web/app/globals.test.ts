import { describe, expect, test } from "bun:test";

const relativeLuminance = (hex: string) => {
  const channels = hex
    .match(/../gu)
    ?.map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    );
  const [red, green, blue] = channels ?? [];
  if (red === undefined || green === undefined || blue === undefined) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
};

const contrastRatio = (foreground: string, background: string) => {
  const luminances = [
    relativeLuminance(foreground),
    relativeLuminance(background),
  ].sort((left, right) => right - left);
  const [lighter, darker] = luminances;
  if (lighter === undefined || darker === undefined) {
    throw new Error("Missing luminance values");
  }
  return (lighter + 0.05) / (darker + 0.05);
};

const token = (cssBlock: string, name: string) => {
  const value = new RegExp(`${name}:\\s*#([0-9a-f]{6})`, "iu").exec(
    cssBlock
  )?.[1];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
};

describe("global color cascade", () => {
  test("does not override Tailwind link color utilities from an unlayered rule", async () => {
    const css = await Bun.file(new URL("globals.css", import.meta.url)).text();
    expect(css).not.toMatch(/a\s*\{[^}]*color:\s*inherit/gu);
  });
});

describe("responsive page shell", () => {
  test("keeps the footer at the bottom of short viewports", async () => {
    const css = await Bun.file(new URL("globals.css", import.meta.url)).text();
    expect(css).toMatch(/body\s*\{[^}]*min-height:\s*100dvh/su);
    expect(css).toMatch(/body\s*\{[^}]*display:\s*flex/su);
    expect(css).toMatch(/body\s*\{[^}]*flex-direction:\s*column/su);
    expect(css).toMatch(/#main-content\s*\{[^}]*flex:\s*1/su);
  });
});

describe("accessible color tokens", () => {
  test("keeps secondary text above WCAG AA contrast in both themes", async () => {
    const css = await Bun.file(new URL("globals.css", import.meta.url)).text();
    const light = /:root\s*\{(?<tokens>[^}]*)\}/su.exec(css)?.groups?.tokens;
    const dark = /\.dark\s*\{(?<tokens>[^}]*)\}/su.exec(css)?.groups?.tokens;
    if (!(light && dark)) {
      throw new Error("Missing theme token blocks");
    }

    for (const theme of [light, dark]) {
      expect(
        contrastRatio(token(theme, "--muted"), token(theme, "--surface-strong"))
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(token(theme, "--inverse-muted"), token(theme, "--ink"))
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});
