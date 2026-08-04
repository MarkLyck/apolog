import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import { AssistantMessage } from "./assistant-message";

describe("AssistantMessage", () => {
  test("renders model Markdown as semantic, readable HTML", () => {
    const html = renderToStaticMarkup(
      <AssistantMessage
        content={"**Summary**\n\n### Evidence\n\n- First source"}
      />
    );

    expect(html).toContain("<strong>Summary</strong>");
    expect(html).toContain("<h3>Evidence</h3>");
    expect(html).toContain("<li>First source</li>");
    expect(html).not.toContain("**Summary**");
  });
});
