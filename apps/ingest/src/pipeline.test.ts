import { describe, expect, test } from "bun:test";

import { createDryRunReport, sourceHash } from "./pipeline";

describe("ingestion pipeline", () => {
  test("creates deterministic source hashes", () => {
    expect(sourceHash("same input")).toBe(sourceHash("same input"));
    expect(sourceHash("same input")).not.toBe(sourceHash("changed input"));
  });

  test("reports publishable fixture counts without mutating data", () => {
    const report = createDryRunReport();
    expect(report.valid).toBe(true);
    expect(report.counts.articles).toBeGreaterThan(500);
    expect(report.counts.corpora).toBe(2);
    expect(report.counts.sabContradictions).toBeGreaterThan(500);
    expect(report.mode).toBe("dry-run");
  });
});
