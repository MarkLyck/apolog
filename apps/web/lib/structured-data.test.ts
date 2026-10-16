import { describe, expect, test } from "bun:test";

import { serializeJsonLd, siteStructuredData } from "./structured-data";
import type { SiteStructuredData } from "./structured-data";

describe("serializeJsonLd", () => {
  test("cannot close the script tag it renders into", () => {
    const [website, organization] = siteStructuredData["@graph"];
    const data: SiteStructuredData = {
      ...siteStructuredData,
      "@graph": [
        { ...website, description: "</script><script>alert(1)</script>" },
        organization,
      ],
    };
    const serialized = serializeJsonLd(data);
    expect(serialized).not.toContain("<");
    expect(JSON.parse(serialized)).toEqual(data);
  });
});
