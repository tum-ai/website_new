import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";

const assetReferencePattern =
  /["'`](\/assets\/[A-Za-z0-9_ .\-\/()]+\.(?:png|jpe?g|webp|svg|mp4|ttf))(?:["'`]|\?)/g;

function collectFiles(directory: string, extensions: Set<string>): string[] {
  const entries = readdirSync(directory);
  const files: string[] = [];

  for (const entry of entries) {
    const path = join(directory, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      files.push(...collectFiles(path, extensions));
      continue;
    }

    if (extensions.has(path.slice(path.lastIndexOf(".")))) {
      files.push(path);
    }
  }

  return files;
}

test("literal public asset references point to shipped files", () => {
  const filesToScan = [
    ...collectFiles("src", new Set([".ts", ".tsx", ".css"])),
    ...collectFiles("docs", new Set([".md"])),
    "README.md",
  ];
  const missingReferences: string[] = [];

  for (const filePath of filesToScan) {
    const source = readFileSync(filePath, "utf8");

    for (const match of source.matchAll(assetReferencePattern)) {
      const assetPath = match[1];

      if (!existsSync(join("public", assetPath))) {
        missingReferences.push(
          `${relative(process.cwd(), filePath)} -> ${assetPath}`,
        );
      }
    }
  }

  assert.deepEqual(missingReferences, []);
});
