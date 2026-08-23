import { createDryRunReport } from "./pipeline";
import { acquireSabContradictions, writeSabCatalog } from "./sab/acquire";

const command = process.argv[2] ?? "dry-run";
const repoRoot = new URL("../../..", import.meta.url).pathname;

if (command === "dry-run") {
  const report = createDryRunReport();
  console.log(JSON.stringify(report, null, 2));
  if (!report.valid) {
    process.exitCode = 1;
  }
} else if (command === "seed") {
  const child = Bun.spawn(["bunx", "convex", "run", "seed:seed"], {
    cwd: repoRoot,
    stderr: "inherit",
    stdout: "inherit",
  });
  process.exitCode = await child.exited;
} else if (command === "acquire-sab") {
  const result = await acquireSabContradictions();
  const destination = await writeSabCatalog(result.catalog);
  console.log(
    JSON.stringify(
      {
        destination,
        failed: result.failed,
        imported: result.catalog.length,
      },
      null,
      2
    )
  );
  const unexpectedFailures = result.failed.filter(
    (item) => item.error !== "SAB has no detail record for this list link"
  );
  if (unexpectedFailures.length > 0) {
    process.exitCode = 1;
  }
} else if (command === "import-sab") {
  const child = Bun.spawn(["bunx", "convex", "run", "seed:seedSabCatalog"], {
    cwd: repoRoot,
    stderr: "inherit",
    stdout: "inherit",
  });
  process.exitCode = await child.exited;
} else {
  console.error(
    `Unknown command: ${command}. Use "dry-run", "seed", "acquire-sab", or "import-sab".`
  );
  process.exitCode = 1;
}
