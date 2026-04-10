import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export function resolveNextEnv(env, localDistDir) {
  const nextEnv = { ...env };

  if (!nextEnv.NEXT_DIST_DIR && !nextEnv.VERCEL && localDistDir) {
    nextEnv.NEXT_DIST_DIR = localDistDir;
  }

  return nextEnv;
}

function main() {
  const [command, localDistDir, ...extraArgs] = process.argv.slice(2);

  if (!command) {
    throw new Error(
      "Usage: node scripts/run-next-command.mjs <command> [localDistDir] [...args]",
    );
  }

  const env = resolveNextEnv(process.env, localDistDir);
  const bin = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const result = spawnSync(bin, ["exec", "next", command, ...extraArgs], {
    env,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  process.exit(result.status ?? 1);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
