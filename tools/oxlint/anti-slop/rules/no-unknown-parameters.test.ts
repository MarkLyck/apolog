import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

let directory: string;

beforeAll(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "apolog-schema-lint-"));
  await Bun.write(
    path.join(directory, "oxlint.json"),
    JSON.stringify({
      categories: { correctness: "off" },
      jsPlugins: [
        {
          name: "anti-slop",
          specifier: new URL("../index.ts", import.meta.url).pathname,
        },
      ],
      rules: { "anti-slop/no-unknown-parameters": "error" },
    })
  );
});

afterAll(async () => {
  await rm(directory, { recursive: true, force: true });
});

async function lint(name: string, source: string) {
  const file = path.join(directory, `${name}.ts`);
  await Bun.write(file, source);
  const child = Bun.spawn(
    [
      process.execPath,
      new URL("../../../../node_modules/oxlint/bin/oxlint", import.meta.url)
        .pathname,
      "--config",
      path.join(directory, "oxlint.json"),
      file,
    ],
    { stdout: "pipe", stderr: "pipe" }
  );
  const [exitCode, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  return { exitCode, output: stdout + stderr };
}

describe("unknown parameters at Effect Schema boundaries", () => {
  for (const decoder of [
    "decodeUnknownResult",
    "decodeUnknownSync",
    "decodeUnknownEffect",
  ]) {
    test(`accepts direct ${decoder} parsing`, async () => {
      const result = await lint(
        decoder,
        `import { Schema } from "effect";
        export function parse(input: unknown) {
          return Schema.${decoder}(Schema.String)(input);
        }`
      );
      expect(result.output).not.toContain("no-unknown-parameters");
      expect(result.exitCode).toBe(0);
    });
  }

  test("accepts imported schema aliases and namespace imports", async () => {
    const result = await lint(
      "imports",
      `import { Schema as Codec } from "effect";
      import * as Schema from "effect/Schema";
      export const first = (input: unknown) => Codec.decodeUnknownResult(Codec.String)(input);
      export const second = (input: unknown) => Schema.decodeUnknownSync(Schema.String)(input);`
    );
    expect(result.output).not.toContain("no-unknown-parameters");
    expect(result.exitCode).toBe(0);
  });

  const rejected = {
    unparsed: "return input;",
    delegated: "return parseElsewhere(input);",
    nested: "return () => Schema.decodeUnknownResult(Schema.String)(input);",
    escaped: "Schema.decodeUnknownResult(Schema.String)(input); return input;",
    shadowed:
      "const Schema = localSchema; return Schema.decodeUnknownResult(Schema.String)(input);",
  };
  for (const [name, body] of Object.entries(rejected)) {
    test(`rejects ${name} unknown input`, async () => {
      const result = await lint(
        name,
        `import { Schema } from "effect";
        export function parse(input: unknown) { ${body} }`
      );
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain("no-unknown-parameters");
      expect(result.output).toContain("Parameter `input` leaves input unparsed");
    });
  }

  test("rejects a matching decoder from a different library", async () => {
    const result = await lint(
      "imposter",
      `import { Schema } from "another-library";
      export function parse(input: unknown) {
        return Schema.decodeUnknownResult(Schema.String)(input);
      }`
    );
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain("Parameter `input` leaves input unparsed");
  });
});
