import { describe, expect, test } from "bun:test";

const read = (relativePath: string) =>
  Bun.file(new URL(relativePath, import.meta.url)).text();

describe("server data boundaries", () => {
  test("does not silently replace Convex failures with demo fixtures", async () => {
    const source = await read("./data.ts");
    expect(source).not.toContain("contentFixtures");
    expect(source).not.toContain("catch (");
    expect(source).not.toContain("catch {");
  });

  test("uses the durable backend rate limiter", async () => {
    const source = await read("../app/api/chat/route.ts");
    expect(source).not.toContain("apologRateLimits");
    expect(source).toContain("api.rateLimits.consume");
  });

  test("consumes one canonical search result shape", async () => {
    const route = await read("../app/api/search/articles/route.ts");
    const chat = await read("../app/api/chat/route.ts");
    expect(route).not.toContain('"article" in hit');
    expect(chat).not.toContain('"article" in result');
  });
});
