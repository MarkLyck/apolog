import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import { DebateClient } from "./debate-client";

describe("DebateClient", () => {
  test("uses a submit button for the message form", () => {
    const html = renderToStaticMarkup(<DebateClient corpusKey="quran" />);
    const sendButton = html.match(
      /<button[^>]*aria-label="Send message"[^>]*>/u
    )?.[0];
    expect(sendButton).toContain('type="submit"');
  });
});
