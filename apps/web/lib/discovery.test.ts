import { describe, expect, test } from "bun:test";

import { GET as getSkill } from "@/app/.well-known/agent-skills/apolog/SKILL.md/route";
import { GET as getIndex } from "@/app/.well-known/agent-skills/index.json/route";

import { apiCatalog, linkHeader } from "./discovery";

describe("agent discovery", () => {
  test("the api-catalog describes every resource the Link header advertises", () => {
    const site = new Map(
      Object.entries(apiCatalog("https://apolog.example").linkset[0] ?? {})
    );
    const advertised = [
      ...linkHeader().matchAll(/<(?<href>[^>]+)>; rel="(?<rel>[^"]+)"/gu),
    ]
      .map(({ groups }) => ({ href: groups?.href, rel: groups?.rel }))
      .filter(({ rel }) => rel !== "api-catalog");
    expect(advertised.length).toBeGreaterThan(0);
    for (const { href, rel } of advertised) {
      const targets: unknown = site.get(rel ?? "");
      expect(targets).toEqual([
        expect.objectContaining({ href: `https://apolog.example${href}` }),
      ]);
    }
  });

  test("the agent-skills index digest matches the served SKILL.md bytes", async () => {
    const skill = await getSkill().text();
    expect(await getIndex().json()).toMatchObject({
      skills: [
        {
          digest: `sha256:${new Bun.CryptoHasher("sha256").update(skill).digest("hex")}`,
        },
      ],
    });
    expect(skill).toStartWith("---\nname: apolog\ndescription: ");
  });
});
