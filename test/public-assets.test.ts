import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { expect, test } from "vitest";

/**
 * Every literal `/assets/…` path in the source must exist under public/.
 * Paths built at runtime (template strings such as
 * `/assets/partners/logos/${logo}`) are not literals and are checked by the
 * tests of the module that builds them.
 */
const root = join(import.meta.dirname, "..");
const assetReference =
  /["'`(](\/assets\/[\w .()/-]+\.(?:png|jpe?g|webp|avif|gif|svg|ico|mp4|webm|ttf|woff2?|pdf))(?=["'`)?#])/g;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx|css)$/.test(name) ? [path] : [];
  });
}

test("literal /assets/ references point to files in public/", () => {
  const files = [
    ...sourceFiles(join(root, "src")),
    ...sourceFiles(join(root, "test")),
  ];
  const missing: string[] = [];
  let references = 0;

  for (const file of files) {
    for (const [, asset] of readFileSync(file, "utf8").matchAll(
      assetReference,
    )) {
      references++;
      if (!existsSync(join(root, "public", asset))) {
        missing.push(`${relative(root, file)} → ${asset}`);
      }
    }
  }

  expect(missing).toStrictEqual([]);
  // Guards the pattern: the site references well over a hundred assets.
  expect(references).toBeGreaterThan(100);
});
