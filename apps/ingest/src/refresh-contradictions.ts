import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { articleContentSchema } from "@apolog/shared/content";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Result from "effect/Result";
import * as Schema from "effect/Schema";

import { acquireEffect } from "./contradictions/acquire";
import { buildArticle } from "./contradictions/build";
import { unavailablePaths } from "./contradictions/corrections";

const forEachEffect = Effect.forEach;

const preparedSchema = Schema.Struct({
  valid: Schema.Literal(true),
  digest: Schema.String,
  articles: Schema.Array(articleContentSchema).check(Schema.isMinLength(500)),
});
const snapshotSchema = Schema.Struct({
  status: Schema.Literal("success"),
  value: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      version: Schema.Number,
      importKey: Schema.String,
      status: Schema.String,
      content: articleContentSchema,
    })
  ),
});
const resultSchema = Schema.Struct({
  status: Schema.Literal("success"),
  value: Schema.Struct({
    deleted: Schema.Number,
    inserted: Schema.Number,
    unchanged: Schema.Number,
  }),
});
const deploymentSchema = Schema.Struct({
  url: Schema.String.check(
    Schema.isPattern(/^https:\/\/[a-z0-9-]+\.convex\.cloud$/u)
  ),
  key: Schema.String.check(Schema.isMinLength(1)),
});
const failureSchema = Schema.Struct({
  status: Schema.Literal("error"),
  errorMessage: Schema.String,
});

const RefreshIoError = Data.TaggedError("RefreshIoError")<{
  operation: string;
  cause: unknown;
  message: string;
}>;

const RefreshInvariantError = Data.TaggedError("RefreshInvariantError")<{
  message: string;
}>;

function ioError(operation: string, cause: unknown) {
  return new RefreshIoError({
    operation,
    cause,
    message: `${operation}: ${String(cause)}`,
  });
}

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function writeArtifact(file: string, contents: string) {
  return Effect.tryPromise({
    try: () => Bun.write(file, contents),
    catch: (cause) => ioError(`Write ${file}`, cause),
  });
}

function prepare(directory: string) {
  return Effect.gen(function* prepareProgram() {
    const { bible, catalog, failures, indexed } =
      yield* acquireEffect(directory);
    const unavailable = failures.filter(
      (failure) =>
        unavailablePaths.has(failure.path) &&
        failure.error.includes("Missing contradiction detail body")
    );
    const errors = failures.filter((failure) => !unavailable.includes(failure));
    const now = Date.now();
    const results = yield* forEachEffect(catalog, (entry) =>
      Effect.try({
        try: () => buildArticle(entry, bible, now),
        catch: (cause) => ({ path: entry.path, error: String(cause) }),
      }).pipe(Effect.result)
    );
    const articles = [];
    for (const result of results) {
      if (Result.isSuccess(result)) {
        articles.push(result.success);
      } else {
        errors.push(result.failure);
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
    yield* writeArtifact(
      path.join(directory, "report.json"),
      JSON.stringify(report, null, 2)
    );
    yield* writeArtifact(
      path.join(directory, "prepared.json"),
      JSON.stringify({
        valid,
        digest: digest(JSON.stringify(articles)),
        articles,
      })
    );
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    if (!valid) {
      return yield* Effect.fail(
        new RefreshInvariantError({
          message:
            "Incomplete scrape. Database replacement is disabled; see report.json.",
        })
      );
    }
  });
}

function connection() {
  return Effect.gen(function* connectionProgram() {
    if (!process.env.NEXT_PUBLIC_CONVEX_URL || !process.env.CONVEX_DEPLOY_KEY) {
      return yield* Effect.fail(
        new RefreshInvariantError({
          message:
            "Set NEXT_PUBLIC_CONVEX_URL and CONVEX_DEPLOY_KEY in an environment file before applying or verifying the import.",
        })
      );
    }
    const deployment = yield* Schema.decodeUnknownEffect(deploymentSchema)({
      url: process.env.NEXT_PUBLIC_CONVEX_URL,
      key: process.env.CONVEX_DEPLOY_KEY,
    });
    const deploymentName = new URL(deployment.url).hostname.split(".")[0];
    if (
      deployment.key.includes("|") &&
      !deployment.key.split("|")[0]?.endsWith(`:${deploymentName}`)
    ) {
      return yield* Effect.fail(
        new RefreshInvariantError({
          message:
            "Use a deployment-specific CONVEX_DEPLOY_KEY matching NEXT_PUBLIC_CONVEX_URL.",
        })
      );
    }
    return deployment;
  });
}

function call(kind: "query" | "mutation", functionPath: string, args: string) {
  return Effect.gen(function* convexCallProgram() {
    const { url, key } = yield* connection();
    return yield* Effect.acquireUseRelease(
      Effect.sync(() => new AbortController()),
      (controller) =>
        Effect.gen(function* responseProgram() {
          const response = yield* Effect.tryPromise({
            try: (signal) =>
              fetch(`${url}/api/${kind}`, {
                method: "POST",
                headers: {
                  Authorization: `Convex ${key}`,
                  "Content-Type": "application/json",
                },
                body: `{"path":${JSON.stringify(functionPath)},"args":[${args}],"format":"convex_encoded_json"}`,
                signal: AbortSignal.any([signal, controller.signal]),
              }),
            catch: (cause) => ioError(`Convex ${kind} ${functionPath}`, cause),
          });
          if (!response.ok) {
            const text = yield* Effect.tryPromise({
              try: () => response.text(),
              catch: (cause) => ioError(`Read Convex ${kind} error`, cause),
            });
            return yield* Effect.fail(
              new RefreshInvariantError({
                message: `Convex ${kind} failed: HTTP ${response.status}. ${text}`,
              })
            );
          }
          const body: unknown = yield* Effect.tryPromise({
            try: () => response.json(),
            catch: (cause) => ioError(`Read Convex ${kind} response`, cause),
          });
          const failure = Schema.decodeUnknownResult(failureSchema)(body);
          if (Result.isSuccess(failure)) {
            return yield* Effect.fail(
              new RefreshInvariantError({
                message: failure.success.errorMessage,
              })
            );
          }
          return body;
        }),
      (controller) => Effect.sync(() => controller.abort())
    ).pipe(Effect.timeout("120 seconds"));
  });
}

function snapshot() {
  return Effect.gen(function* snapshotProgram() {
    const response = yield* call("query", "contradictionImport:snapshot", "{}");
    return (yield* Schema.decodeUnknownEffect(snapshotSchema)(response)).value;
  });
}

function readPrepared(directory: string) {
  return Effect.gen(function* readPreparedProgram() {
    const file = path.join(directory, "prepared.json");
    const json: unknown = yield* Effect.tryPromise({
      try: () => Bun.file(file).json(),
      catch: (cause) => ioError(`Read ${file}`, cause),
    });
    const prepared = yield* Schema.decodeUnknownEffect(preparedSchema)(json);
    if (prepared.digest !== digest(JSON.stringify(prepared.articles))) {
      return yield* Effect.fail(
        new RefreshInvariantError({
          message:
            "Prepared articles do not match their digest. Run prepare again.",
        })
      );
    }
    return prepared;
  });
}

function verify(directory: string) {
  return Effect.gen(function* verifyProgram() {
    const prepared = yield* readPrepared(directory);
    const actual = yield* snapshot();
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
      return yield* Effect.fail(
        new RefreshInvariantError({
          message: "Database articles differ from the prepared import.",
        })
      );
    }
    const report = {
      verified: actual.length,
      deployment: (yield* connection()).url,
      digest: prepared.digest,
    };
    yield* writeArtifact(
      path.join(directory, "verification.json"),
      JSON.stringify(report, null, 2)
    );
    process.stdout.write(`${JSON.stringify(report)}\n`);
  });
}

function apply(directory: string) {
  return Effect.gen(function* applyProgram() {
    const prepared = yield* readPrepared(directory);
    const before = yield* snapshot();
    const backup = path.join(directory, `backup-${Date.now()}.json`);
    const deployment = yield* connection();
    yield* Effect.tryPromise({
      try: () =>
        writeFile(
          backup,
          JSON.stringify(
            { deployment: deployment.url, articles: before },
            null,
            2
          ),
          { mode: 0o600, flag: "wx" }
        ),
      catch: (cause) => ioError(`Back up ${backup}`, cause),
    });
    process.stderr.write(
      `Backed up ${before.length} contradictions to ${backup}\n`
    );
    const response = yield* call(
      "mutation",
      "contradictionImport:replace",
      JSON.stringify({
        digest: prepared.digest,
        articles: prepared.articles,
        expected: before.map(({ id, version }) => ({ id, version })),
      })
    );
    const result = (yield* Schema.decodeUnknownEffect(resultSchema)(response))
      .value;
    process.stdout.write(`${JSON.stringify(result)}\n`);
    yield* verify(directory);
  });
}

export function refreshContradictions(command: string, directory: string) {
  return Effect.gen(function* refreshProgram() {
    yield* Effect.tryPromise({
      try: () => mkdir(directory, { recursive: true }),
      catch: (cause) => ioError(`Create ${directory}`, cause),
    });
    switch (command) {
      case "prepare": {
        return yield* prepare(directory);
      }
      case "apply": {
        return yield* apply(directory);
      }
      case "verify": {
        return yield* verify(directory);
      }
      default: {
        return yield* Effect.fail(
          new RefreshInvariantError({
            message:
              "Usage: refresh-contradictions.ts prepare|apply|verify [artifact-directory]",
          })
        );
      }
    }
  });
}

if (import.meta.main) {
  const command = process.argv[2] ?? "prepare";
  const directory = path.resolve(process.argv[3] ?? ".context/contradictions");
  try {
    await Effect.runPromise(refreshContradictions(command, directory));
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`
    );
    process.exitCode = 1;
  }
}
