import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import test from "node:test";

test("next build emits Tailwind utility classes for app routes", () => {
  const distDir = ".next-test";
  const nextEnvPath = new URL("../next-env.d.ts", import.meta.url);
  const hadNextEnv = existsSync(nextEnvPath);
  const originalNextEnv = hadNextEnv ? readFileSync(nextEnvPath, "utf8") : null;

  rmSync(".next", { recursive: true, force: true });
  rmSync(distDir, { recursive: true, force: true });

  try {
    execFileSync("pnpm", ["exec", "next", "build", "--webpack"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NEXT_DIST_DIR: distDir,
        NEXT_TELEMETRY_DISABLED: "1",
      },
      stdio: "pipe",
    });
  } finally {
    if (originalNextEnv !== null) {
      writeFileSync(nextEnvPath, originalNextEnv);
    }
  }

  const cssDir = join(distDir, "static", "css");
  const builtCss = readdirSync(cssDir)
    .filter((fileName) => fileName.endsWith(".css"))
    .map((fileName) => readFileSync(join(cssDir, fileName), "utf8"))
    .join("\n");

  assert.match(builtCss, /\.fixed\s*\{/);
  assert.match(builtCss, /\.min-h-screen\s*\{/);
  assert.match(builtCss, /\.text-minimal-gray\s*\{/);
});
