const deployCommand = [
  "bunx",
  "convex",
  "deploy",
  "--cmd-url-env-var-name",
  "NEXT_PUBLIC_CONVEX_URL",
  "--cmd",
  "bun turbo run build --filter=@apolog/web",
] as const;

export function vercelDeploymentCommands(
  environment: string | undefined,
  branch?: string
): readonly (readonly string[])[] {
  if (environment !== "preview") {
    return [deployCommand];
  }
  if (!branch) {
    throw new Error("VERCEL_GIT_COMMIT_REF is required for preview seeding");
  }
  return [
    deployCommand,
    ["bunx", "convex", "run", "seed:seed", "--preview-name", branch],
  ];
}

async function run(command: readonly string[]) {
  const child = Bun.spawn(command, {
    stderr: "inherit",
    stdin: "inherit",
    stdout: "inherit",
  });
  const exitCode = await child.exited;
  if (exitCode !== 0) {
    throw new Error(`Deployment command failed with exit code ${exitCode}`);
  }
}

if (import.meta.main) {
  const commands = vercelDeploymentCommands(
    process.env.VERCEL_ENV,
    process.env.VERCEL_GIT_COMMIT_REF
  );
  for (const command of commands) {
    await run(command);
  }
}
