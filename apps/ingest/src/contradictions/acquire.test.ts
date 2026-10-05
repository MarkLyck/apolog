import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as TestClock from "effect/testing/TestClock";

import { cachedFetch } from "./acquire";

async function withServer(
  fetch: (request: Request) => Response | Promise<Response>,
  run: (url: string, directory: string) => Promise<void>
) {
  const directory = await mkdtemp(path.join(tmpdir(), "apolog-cache-"));
  const server = Bun.serve({ port: 0, hostname: "127.0.0.1", fetch });
  try {
    await run(server.url.href, directory);
  } finally {
    await server.stop(true);
    await rm(directory, { recursive: true, force: true });
  }
}

describe("cached acquisition", () => {
  test("retries 429 and server failures, then reuses the persisted SHA-256 cache", async () => {
    let requests = 0;
    await withServer(
      () => {
        requests += 1;
        return new Response(requests < 3 ? "retry" : "complete body", {
          status: requests === 1 ? 429 : requests === 2 ? 503 : 200,
        });
      },
      async (url, directory) => {
        expect(await Effect.runPromise(cachedFetch(url, directory))).toBe(
          "complete body"
        );
        expect(requests).toBe(3);
        expect(await readdir(directory)).toEqual([
          `${createHash("sha256").update(url).digest("hex")}.txt`,
        ]);
        expect(await Effect.runPromise(cachedFetch(url, directory))).toBe(
          "complete body"
        );
        expect(requests).toBe(3);
      }
    );
  });

  test("stops after three server failures and leaves no successful cache entry", async () => {
    let requests = 0;
    await withServer(
      () => {
        requests += 1;
        return new Response("unavailable", { status: 503 });
      },
      async (url, directory) => {
        await expect(
          Effect.runPromise(cachedFetch(url, directory))
        ).rejects.toThrow("HTTP 503");
        expect(requests).toBe(3);
        expect(await readdir(directory)).toEqual([]);
      }
    );
  });

  test("does not retry other client errors", async () => {
    let requests = 0;
    await withServer(
      () => {
        requests += 1;
        return new Response("missing", { status: 404 });
      },
      async (url, directory) => {
        await expect(
          Effect.runPromise(cachedFetch(url, directory))
        ).rejects.toThrow("HTTP 404");
        expect(requests).toBe(1);
        expect(await readdir(directory)).toEqual([]);
      }
    );
  });

  test("an Effect timeout aborts a stalled response body without retrying", async () => {
    let requests = 0;
    const { promise: started, resolve: received } =
      Promise.withResolvers<boolean>();
    const { promise: cancelled, resolve: cancel } =
      Promise.withResolvers<boolean>();
    await withServer(
      () => {
        requests += 1;
        received(true);
        return new Response(
          new ReadableStream<Uint8Array>({
            start(controller) {
              controller.enqueue(new TextEncoder().encode("partial"));
            },
            cancel() {
              cancel(true);
            },
          })
        );
      },
      async (url, directory) => {
        await expect(
          Effect.runPromise(
            Effect.gen(function* timeoutRequest() {
              const request = yield* cachedFetch(url, directory).pipe(
                Effect.forkChild
              );
              yield* Effect.promise(() => started);
              yield* TestClock.adjust("1 minute");
              return yield* Fiber.join(request);
            }).pipe(Effect.provide(TestClock.layer()))
          )
        ).rejects.toThrow("timed out");
        expect(await cancelled).toBe(true);
        expect(requests).toBe(1);
        expect(await readdir(directory)).toEqual([]);
      }
    );
  });

  test("interrupts a streaming response without caching its partial body", async () => {
    let requests = 0;
    const { promise: cancelled, resolve: cancel } =
      Promise.withResolvers<boolean>();
    const { promise: started, resolve: received } =
      Promise.withResolvers<boolean>();
    await withServer(
      () => {
        requests += 1;
        if (requests > 1) {
          return new Response("recovered");
        }
        received(true);
        return new Response(
          new ReadableStream<Uint8Array>({
            start(controller) {
              controller.enqueue(new TextEncoder().encode("partial"));
            },
            cancel() {
              cancel(true);
            },
          })
        );
      },
      async (url, directory) => {
        const controller = new AbortController();
        const result = Effect.runPromise(cachedFetch(url, directory), {
          signal: controller.signal,
        });
        await started;
        controller.abort();
        await expect(result).rejects.toThrow();
        expect(await cancelled).toBe(true);
        expect(await readdir(directory)).toEqual([]);
        expect(requests).toBe(1);
        expect(await Effect.runPromise(cachedFetch(url, directory))).toBe(
          "recovered"
        );
      }
    );
  });
});
