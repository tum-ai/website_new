import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
const workspaceYaml = readFileSync(
  new URL("../pnpm-workspace.yaml", import.meta.url),
  "utf8",
);

test("root dev isolates the Next dev build output", () => {
  assert.equal(packageJson.scripts.dev, "NEXT_DIST_DIR=.next-dev next dev");
  assert.equal(
    packageJson.scripts.build,
    "NEXT_DIST_DIR=.next-prod next build",
  );
  assert.equal(
    packageJson.scripts.lint,
    "pnpm run lint:web && pnpm --dir packages/notion-data lint",
  );
  assert.doesNotMatch(workspaceYaml, /apps\/\*/);
});

test("root typecheck covers the remaining workspace packages", () => {
  assert.equal(
    packageJson.scripts.typecheck,
    "NEXT_DIST_DIR=.next-typecheck next build",
  );
  assert.equal(
    packageJson.scripts["typecheck:all"],
    "pnpm typecheck && pnpm --dir packages/notion-data typecheck",
  );
});
