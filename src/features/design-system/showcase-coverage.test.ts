import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import ts from "typescript";
import { expect, test } from "vitest";

/**
 * Structural integration guard: the website demonstrates every runtime export
 * of the installed kit's public root. This reads its shipped public declaration,
 * never a local primitive barrel or the kit's private implementation.
 */
const require = createRequire(import.meta.url);
const packagePath = require.resolve("@tum.ai/ui-kit/package.json");
const packageJson = JSON.parse(readFileSync(packagePath, "utf8")) as {
  exports: { ".": { types: string } };
};
const publicApiPath = join(
  dirname(packagePath),
  packageJson.exports["."].types,
);
const publicApi = ts.createSourceFile(
  publicApiPath,
  readFileSync(publicApiPath, "utf8"),
  ts.ScriptTarget.Latest,
  true,
);
const runtimeExports = publicApi.statements.flatMap((statement) => {
  if (
    !ts.isExportDeclaration(statement) ||
    statement.isTypeOnly ||
    !statement.exportClause ||
    !ts.isNamedExports(statement.exportClause)
  ) {
    return [];
  }
  return statement.exportClause.elements
    .filter((entry) => !entry.isTypeOnly)
    .map((entry) => entry.name.text);
});

/** Exports with nothing to show, and where they are exercised instead. */
const withoutVisuals: Record<string, string> = {
  MotionProvider: "rendered once by the (site) layout around every page",
};

const demonstrated = new Set<string>();
for (const filename of readdirSync(import.meta.dirname)) {
  if (!filename.endsWith(".tsx") || filename.includes(".test.")) continue;
  const source = ts.createSourceFile(
    filename,
    readFileSync(join(import.meta.dirname, filename), "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const imports = new Map<string, string>();
  for (const statement of source.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== "@tum.ai/ui-kit" ||
      statement.importClause?.isTypeOnly
    ) {
      continue;
    }
    const bindings = statement.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    for (const entry of bindings.elements) {
      if (!entry.isTypeOnly) {
        imports.set(entry.name.text, (entry.propertyName ?? entry.name).text);
      }
    }
  }
  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node)) return;
    if (ts.isIdentifier(node)) {
      const publicName = imports.get(node.text);
      if (publicName) demonstrated.add(publicName);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}

test("the installed kit exposes runtime primitives", () => {
  expect(runtimeExports.length).toBeGreaterThan(0);
});

test.each(runtimeExports.filter((name) => !(name in withoutVisuals)))(
  "the showcase uses the installed kit's %s",
  (name) => {
    expect(demonstrated.has(name)).toBe(true);
  },
);
