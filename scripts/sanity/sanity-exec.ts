import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = join(import.meta.dirname, "..", "..");

/**
 * Runs `script` through `sanity exec --with-user-token` (the editor's CLI
 * login) from `src/sanity`, where the CLI finds its config, with the
 * current environment plus `env`. The scripts run under
 * `tsx --tsconfig scripts/sanity/tsconfig.json`, which hands the child a
 * relative `TSX_TSCONFIG_PATH`; from `src/sanity` that path points nowhere
 * and the child fails before it starts, so it is passed as absolute.
 */
export function sanityExec(script: string, env: Record<string, string>) {
  return spawnSync(
    join(root, "node_modules", ".bin", "sanity"),
    ["exec", script, "--with-user-token"],
    {
      cwd: join(root, "src", "sanity"),
      stdio: "inherit",
      env: {
        ...process.env,
        TSX_TSCONFIG_PATH: join(root, "scripts", "sanity", "tsconfig.json"),
        ...env,
      },
    },
  );
}
