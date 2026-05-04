import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const { resolveNextEnv } = await import(
  new URL("../scripts/run-next-command.mjs", import.meta.url).href
);
const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

test("root scripts keep CI and build invariants stable", () => {
  assert.equal(
    packageJson.scripts.build,
    "node scripts/run-next-command.mjs build .next-prod",
  );
  assert.equal(
    packageJson.scripts.start,
    "node scripts/run-next-command.mjs start .next-prod",
  );
  assert.equal(
    packageJson.scripts.test,
    "node --import=tsx --test test/*.test.ts",
  );
  assert.equal(
    packageJson.scripts.typecheck,
    "NEXT_DIST_DIR=.next-typecheck next build",
  );
});

test("root build keeps isolated dist dirs locally without breaking Vercel", () => {
  assert.equal(resolveNextEnv({}, ".next-prod").NEXT_DIST_DIR, ".next-prod");
  assert.equal(
    resolveNextEnv({ NEXT_DIST_DIR: ".next-custom" }, ".next-prod")
      .NEXT_DIST_DIR,
    ".next-custom",
  );
  assert.equal(
    resolveNextEnv({ VERCEL: "1" }, ".next-prod").NEXT_DIST_DIR,
    undefined,
  );
});
