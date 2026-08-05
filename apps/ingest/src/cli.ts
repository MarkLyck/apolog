import { createDryRunReport } from "./pipeline";

const command = process.argv[2] ?? "dry-run";

if (command === "dry-run") {
  const report = createDryRunReport();
  console.log(JSON.stringify(report, null, 2));
  if (!report.valid) {
    process.exitCode = 1;
  }
} else if (command === "seed") {
  const child = Bun.spawn(["bunx", "convex", "run", "seed:seed"], {
    cwd: new URL("../../..", import.meta.url).pathname,
    stderr: "inherit",
    stdout: "inherit",
  });
  process.exitCode = await child.exited;
} else {
  console.error(`Unknown command: ${command}. Use "dry-run" or "seed".`);
  process.exitCode = 1;
}
