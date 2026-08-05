interface Manifest {
  packageManager?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

const exactVersion = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u;
const dependencyGroups = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
] as const;

export async function checkDependencyPolicy(root: string) {
  const errors: string[] = [];
  const glob = new Bun.Glob(
    "{package.json,apps/*/package.json,packages/*/package.json}"
  );
  for await (const relativePath of glob.scan({ cwd: root, onlyFiles: true })) {
    const manifest = (await Bun.file(
      `${root}/${relativePath}`
    ).json()) as Manifest;
    for (const group of dependencyGroups) {
      for (const [name, version] of Object.entries(manifest[group] ?? {})) {
        if (version === "workspace:*") {
          continue;
        }
        if (!exactVersion.test(version)) {
          errors.push(
            `${relativePath}: ${group}.${name} must be exact, found ${version}`
          );
        }
      }
    }
  }

  const rootManifest = (await Bun.file(
    `${root}/package.json`
  ).json()) as Manifest;
  if (!/^bun@\d+\.\d+\.\d+$/u.test(rootManifest.packageManager ?? "")) {
    errors.push(
      "package.json: packageManager must be an exact bun@x.y.z version"
    );
  }
  for (const lockfile of [
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "bun.lockb",
  ]) {
    if (await Bun.file(`${root}/${lockfile}`).exists()) {
      errors.push(`Unexpected package-manager lockfile: ${lockfile}`);
    }
  }
  return { errors };
}

if (import.meta.main) {
  const result = await checkDependencyPolicy(process.cwd());
  if (result.errors.length) {
    console.error(result.errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("Dependency policy passed.");
  }
}
