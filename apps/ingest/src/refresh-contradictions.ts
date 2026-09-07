import { createHash } from "node:crypto";
import { chmod, mkdir } from "node:fs/promises";
import path from "node:path";

import { articleContentSchema } from "@apolog/shared";
import * as v from "valibot";

import { acquire } from "./contradictions/acquire";
import { buildArticle } from "./contradictions/build";
import { unavailablePaths } from "./contradictions/corrections";

const preparedSchema = v.object({
  valid: v.literal(true),
  digest: v.string(),
  articles: v.pipe(v.array(articleContentSchema), v.minLength(500)),
});
const snapshotSchema = v.object({
  status: v.literal("success"),
  value: v.array(
    v.object({
      id: v.string(),
      version: v.number(),
      importKey: v.string(),
      status: v.string(),
      content: articleContentSchema,
    })
  ),
});
const resultSchema = v.object({
  status: v.literal("success"),
  value: v.object({
    deleted: v.number(),
    inserted: v.number(),
    unchanged: v.number(),
  }),
});

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function prepare(directory: string) {
  const { bible, catalog, failures, indexed } = await acquire(directory);
  const unavailable = failures.filter(
    (failure) =>
      unavailablePaths.has(failure.path) &&
      failure.error.includes("Missing contradiction detail body")
  );
  const errors = failures.filter((failure) => !unavailable.includes(failure));
  const articles = [];
  const now = Date.now();
  for (const entry of catalog) {
    try {
      articles.push(buildArticle(entry, bible, now));
    } catch (error) {
      errors.push({ path: entry.path, error: String(error) });
    }
  }
  const valid =
    errors.length === 0 && articles.length + unavailable.length === indexed;
  const report = {
    valid,
    indexed,
    articles: articles.length,
    passages: articles.flatMap((article) =>
      article.document.blocks.filter((block) => block.type === "quote")
    ).length,
    unavailable,
    errors,
  };
  await Bun.write(
    path.join(directory, "report.json"),
    JSON.stringify(report, null, 2)
  );
  await Bun.write(
    path.join(directory, "prepared.json"),
    JSON.stringify({
      valid,
      digest: digest(JSON.stringify(articles)),
      articles,
    })
  );
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!valid) {
    throw new Error(
      "Incomplete scrape. Database replacement is disabled; see report.json."
    );
  }
}

function connection() {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL || !process.env.CONVEX_DEPLOY_KEY) {
    throw new Error(
      "Set NEXT_PUBLIC_CONVEX_URL and CONVEX_DEPLOY_KEY in an environment file before applying or verifying the import."
    );
  }
  const deployment = v.parse(
    v.object({
      url: v.pipe(
        v.string(),
        v.url(),
        v.regex(/^https:\/\/[a-z0-9-]+\.convex\.cloud$/u)
      ),
      key: v.pipe(v.string(), v.minLength(1)),
    }),
    {
      url: process.env.NEXT_PUBLIC_CONVEX_URL,
      key: process.env.CONVEX_DEPLOY_KEY,
    }
  );
  const deploymentName = new URL(deployment.url).hostname.split(".")[0];
  if (
    deployment.key.includes("|") &&
    !deployment.key.split("|")[0]?.endsWith(`:${deploymentName}`)
  ) {
    throw new Error(
      "Use a deployment-specific CONVEX_DEPLOY_KEY matching NEXT_PUBLIC_CONVEX_URL."
    );
  }
  return deployment;
}

async function call(
  kind: "query" | "mutation",
  functionPath: string,
  args: string
) {
  const { url, key } = connection();
  const response = await fetch(`${url}/api/${kind}`, {
    method: "POST",
    headers: {
      Authorization: `Convex ${key}`,
      "Content-Type": "application/json",
    },
    body: `{"path":${JSON.stringify(functionPath)},"args":[${args}],"format":"convex_encoded_json"}`,
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) {
    throw new Error(
      `Convex ${kind} failed: HTTP ${response.status}. ${await response.text()}`
    );
  }
  const failure = v.safeParse(
    v.object({ status: v.literal("error"), errorMessage: v.string() }),
    await response.clone().json()
  );
  if (failure.success) {
    throw new Error(failure.output.errorMessage);
  }
  return response;
}

async function snapshot() {
  const response = await call("query", "contradictionImport:snapshot", "{}");
  return v.parse(snapshotSchema, await response.json()).value;
}

async function readPrepared(directory: string) {
  const prepared = v.parse(
    preparedSchema,
    await Bun.file(path.join(directory, "prepared.json")).json()
  );
  if (prepared.digest !== digest(JSON.stringify(prepared.articles))) {
    throw new Error(
      "Prepared articles do not match their digest. Run prepare again."
    );
  }
  return prepared;
}

async function verify(directory: string) {
  const prepared = await readPrepared(directory);
  const actual = await snapshot();
  const expected = new Map(
    prepared.articles.map((article) => [article.slug, article])
  );
  if (
    actual.length !== expected.size ||
    actual.some(
      (article) =>
        article.status !== "published" ||
        article.importKey !==
          `contradictions:v2:${prepared.digest}:${article.content.slug}` ||
        JSON.stringify(article.content) !==
          JSON.stringify(expected.get(article.content.slug))
    )
  ) {
    throw new Error("Database articles differ from the prepared import.");
  }
  const report = {
    verified: actual.length,
    deployment: connection().url,
    digest: prepared.digest,
  };
  await Bun.write(
    path.join(directory, "verification.json"),
    JSON.stringify(report, null, 2)
  );
  process.stdout.write(`${JSON.stringify(report)}\n`);
}

async function apply(directory: string) {
  const prepared = await readPrepared(directory);
  const before = await snapshot();
  const backup = path.join(directory, `backup-${Date.now()}.json`);
  await Bun.write(
    backup,
    JSON.stringify({ deployment: connection().url, articles: before }, null, 2)
  );
  await chmod(backup, 0o600);
  process.stderr.write(
    `Backed up ${before.length} contradictions to ${backup}\n`
  );
  const response = await call(
    "mutation",
    "contradictionImport:replace",
    JSON.stringify({
      digest: prepared.digest,
      articles: prepared.articles,
      expected: before.map(({ id, version }) => ({ id, version })),
    })
  );
  const result = v.parse(resultSchema, await response.json()).value;
  process.stdout.write(`${JSON.stringify(result)}\n`);
  await verify(directory);
}

if (import.meta.main) {
  const command = process.argv[2] ?? "prepare";
  const directory = path.resolve(process.argv[3] ?? ".context/contradictions");
  await mkdir(directory, { recursive: true });
  try {
    switch (command) {
      case "prepare": {
        await prepare(directory);
        break;
      }
      case "apply": {
        await apply(directory);
        break;
      }
      case "verify": {
        await verify(directory);
        break;
      }
      default: {
        throw new Error(
          "Usage: refresh-contradictions.ts prepare|apply|verify [artifact-directory]"
        );
      }
    }
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`
    );
    process.exitCode = 1;
  }
}
