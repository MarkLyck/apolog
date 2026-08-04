import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import { Card } from "./card";

describe("Card", () => {
  test("uses semantic article markup and exposes an optional eyebrow", () => {
    const html = renderToStaticMarkup(
      <Card eyebrow="Evidence">
        <h2>Independent records</h2>
      </Card>
    );
    expect(html).toContain("<article");
    expect(html).toContain("Evidence");
    expect(html).toContain("Independent records");
  });
});
