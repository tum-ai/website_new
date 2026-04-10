import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

type RouteBundleStat = {
  route: string;
  firstLoadUncompressedJsBytes: number;
};

test("next build emits Tailwind utility classes for app routes", () => {
  const distDir = ".next-test";

  execFileSync("pnpm", ["exec", "next", "build"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NEXT_DIST_DIR: distDir,
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: "pipe",
  });

  const cssDir = join(distDir, "static", "chunks");
  const builtCss = readdirSync(cssDir)
    .filter((fileName) => fileName.endsWith(".css"))
    .map((fileName) => readFileSync(join(cssDir, fileName), "utf8"))
    .join("\n");

  assert.match(builtCss, /\.fixed\s*\{/);
  assert.match(builtCss, /\.min-h-screen\s*\{/);
  assert.match(builtCss, /\.text-minimal-gray\s*\{/);

  const routeStats = JSON.parse(
    readFileSync(
      join(distDir, "diagnostics", "route-bundle-stats.json"),
      "utf8",
    ),
  ) as RouteBundleStat[];

  const byRoute = new Map(
    routeStats.map((routeStat) => [routeStat.route, routeStat]),
  );

  assert.ok(
    (byRoute.get("/_not-found")?.firstLoadUncompressedJsBytes ?? Infinity) <
      590_000,
  );
  assert.ok(
    (byRoute.get("/")?.firstLoadUncompressedJsBytes ?? Infinity) < 760_000,
  );
  assert.ok(
    (byRoute.get("/community")?.firstLoadUncompressedJsBytes ?? Infinity) <
      590_000,
  );
});
