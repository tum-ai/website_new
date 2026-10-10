import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { builtinModules } from "node:module";
import { dirname, join, relative, resolve, sep } from "node:path";
import ts from "typescript";
import { describe, expect, test } from "vitest";

/**
 * Architecture fitness test: the import rules from the target layout.
 *
 * | Module              | May import                                          |
 * | ------------------- | --------------------------------------------------- |
 * | app                 | features/<x>/<name>-page.tsx and page .css,         |
 * |                     | components, config, lib, styles, app                |
 * | app/studio          | sanity, lib (no site shell, CSS or features)        |
 * | src/*.ts            | config, lib (proxy.ts)                              |
 * | features/<x>        | its own files except .css, features/<y> (index or  |
 * |                     | server entry),                                      |
 * |                     | components/shell, components/json-ld, config, lib   |
 * | features/<x>/index  | its own feature's files except pages                |
 * | features/<x>/server | the same; starts with `import "server-only"`        |
 * | components/shell    | its own files, config, lib                          |
 * | components/*.tsx    | config, lib                                         |
 * | config              | config, lib                                         |
 * | lib                 | lib                                                 |
 * | sanity              | sanity, lib                                         |
 * | styles              | styles                                              |
 *
 * Shared UI comes from the public @tum.ai/ui-kit entry points. Website
 * modules never import copied primitives or the package's private files.
 * Kit CSS is imported by routes or the site stylesheet, never by Studio.
 *
 * A route imports exactly its page module. A feature's `index.ts` is its API
 * for other features and exists only where another feature needs something;
 * it never re-exports a page. It is isomorphic: nothing it reaches imports
 * `server-only`, so a client island may import any index. What reads the
 * CMS content source (the `get…` content getters, async server components)
 * goes in the feature's `server.ts` entry instead, which starts with
 * `import "server-only"` and follows the same rules. Turbopack keeps every re-exported module that
 * has client islands (or CSS), so a page in a barrel ships its islands to
 * every page that imports the barrel: the three legal routes would all load
 * the privacy table of contents, and the homepage the partnership finder.
 * For the same reason a route file imports at most one page module, plus
 * CSS of that page's feature only.
 *
 * There are no exceptions: a new import that breaks a rule changes the code
 * or, deliberately, the rule (here and in docs/architecture.md).
 *
 * Local modules (`@/…` and relative paths) and UI kit entry points are checked.
 * Other external packages are outside these layer rules.
 * Imports are read from the TypeScript syntax tree (`ts.createSourceFile`):
 * `import … from`, `export … from`, side-effect `import "…"`, `import x =
 * require("…")`, and `import("…")` or `require("…")` calls with a string or
 * template literal, so comments, strings and import attributes can't hide or
 * fake one.
 */

const srcDir = import.meta.dirname;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

/** One import of a module, as {@link moduleImports} reads it. */
type ModuleImport = {
  specifier: string;
  /** Erased by the compiler (`import type`, `{ type A }` only, `import("x").T`). */
  typeOnly: boolean;
  /** Only import() can cross from production code into an opt-in mock loader. */
  dynamic?: boolean;
  /** The import occurs inside the literal build-time mock condition's true branch. */
  mockGated?: boolean;
};

const namedTypeOnly = (
  elements: ts.NodeArray<ts.ImportSpecifier | ts.ExportSpecifier>,
) => elements.length > 0 && elements.every((element) => element.isTypeOnly);

/** Exact environment access, so a helper cannot hide a build-time fixture gate. */
function isEnvironmentField(node: ts.Expression, field: string): boolean {
  return (
    ts.isPropertyAccessExpression(node) &&
    node.name.text === field &&
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.name.text === "env" &&
    ts.isIdentifier(node.expression.expression) &&
    node.expression.expression.text === "process"
  );
}

function isMockCondition(node: ts.Expression): boolean {
  return (
    ts.isBinaryExpression(node) &&
    node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken &&
    ts.isBinaryExpression(node.left) &&
    node.left.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken &&
    isEnvironmentField(node.left.left, "USE_MOCK_CMS") &&
    ts.isStringLiteral(node.left.right) &&
    node.left.right.text === "1" &&
    ts.isPrefixUnaryExpression(node.right) &&
    node.right.operator === ts.SyntaxKind.ExclamationToken &&
    isEnvironmentField(node.right.operand, "VERCEL")
  );
}

/** An import in the false branch is never guarded, even under the same condition. */
function hasMockGate(node: ts.Node): boolean {
  for (
    let child = node, parent = node.parent;
    parent;
    child = parent, parent = parent.parent
  ) {
    if (
      ts.isIfStatement(parent) &&
      child === parent.thenStatement &&
      isMockCondition(parent.expression)
    )
      return true;
  }
  return false;
}

/**
 * Every import of `source`, from its syntax tree: static imports and
 * re-exports, `import = require`, and `import()` or `require()` calls whose
 * first argument is a string or a template literal without substitutions.
 */
function moduleImports(source: string): ModuleImport[] {
  const file = ts.createSourceFile(
    "module.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const imports: ModuleImport[] = [];
  const visit = (node: ts.Node): void => {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const clause = node.importClause;
      const bindings = clause?.namedBindings;
      imports.push({
        specifier: node.moduleSpecifier.text,
        typeOnly: Boolean(
          clause &&
            (clause.isTypeOnly ||
              (!clause.name &&
                bindings &&
                ts.isNamedImports(bindings) &&
                namedTypeOnly(bindings.elements))),
        ),
      });
    } else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const clause = node.exportClause;
      imports.push({
        specifier: node.moduleSpecifier.text,
        typeOnly:
          node.isTypeOnly ||
          Boolean(
            clause &&
              ts.isNamedExports(clause) &&
              namedTypeOnly(clause.elements),
          ),
      });
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      ts.isStringLiteral(node.moduleReference.expression)
    ) {
      imports.push({
        specifier: node.moduleReference.expression.text,
        typeOnly: node.isTypeOnly,
      });
    } else if (ts.isCallExpression(node)) {
      const [argument] = node.arguments;
      const callee = node.expression;
      const loads =
        callee.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(callee) && callee.text === "require");
      if (loads && argument && ts.isStringLiteralLike(argument)) {
        imports.push({
          specifier: argument.text,
          typeOnly: false,
          dynamic: callee.kind === ts.SyntaxKind.ImportKeyword,
          mockGated: hasMockGate(node),
        });
      }
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    ) {
      imports.push({ specifier: node.argument.literal.text, typeOnly: true });
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return imports;
}

const isLocal = (specifier: string) =>
  specifier.startsWith("@/") || specifier.startsWith(".");

/** The local modules `source` imports, type-only imports included. */
function localSpecifiers(source: string): string[] {
  return [
    ...new Set(
      moduleImports(source)
        .map(({ specifier }) => specifier)
        .filter(isLocal),
    ),
  ];
}

function resolveImport(from: string, specifier: string): string | null {
  const base = specifier.startsWith("@/")
    ? join(srcDir, specifier.slice(2))
    : resolve(dirname(from), specifier);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ];
  return (
    candidates.find(
      (candidate) => existsSync(candidate) && statSync(candidate).isFile(),
    ) ?? null
  );
}

type Module = {
  /** Path relative to src/, with forward slashes. */
  path: string;
  layer:
    | "app"
    | "studio"
    | "features"
    | "shell"
    | "components"
    | "config"
    | "lib"
    | "sanity"
    | "styles"
    | "root";
  /** Feature folder name, for `features`. */
  feature?: string;
};

function moduleOf(pathFromSrc: string): Module {
  const path = pathFromSrc.split(sep).join("/");
  const [top, second] = path.split("/");
  if (path.startsWith("app/studio/")) return { path, layer: "studio" };
  if (top === "features") return { path, layer: "features", feature: second };
  if (top === "components") {
    if (second === "shell") return { path, layer: "shell" };
    return { path, layer: "components" };
  }
  if (
    top === "app" ||
    top === "config" ||
    top === "lib" ||
    top === "sanity" ||
    top === "styles"
  ) {
    return { path, layer: top };
  }
  return { path, layer: "root" };
}

const isFeatureIndex = (module: Module) =>
  module.layer === "features" &&
  module.path === `features/${module.feature}/index.ts`;

const isFeatureServerEntry = (module: Module) =>
  module.layer === "features" &&
  module.path === `features/${module.feature}/server.ts`;

/** A feature's entries for other features: `index.ts` and `server.ts`. */
const isFeatureEntry = (module: Module) =>
  isFeatureIndex(module) || isFeatureServerEntry(module);

const isPageModule = (to: Module) =>
  to.layer === "features" && to.path.endsWith("-page.tsx");

const isStylesheet = (to: Module) => to.path.endsWith(".css");

/** Why `from` may not import `to`, or null when the import is allowed. */
function importViolation(
  from: Module,
  to: Module,
  imported: Pick<ModuleImport, "typeOnly" | "dynamic" | "mockGated"> = {
    typeOnly: false,
  },
): string | null {
  const fromFixture = from.path.startsWith("lib/cms-fixtures/");
  const toFixture = to.path.startsWith("lib/cms-fixtures/");
  const fromTest = /\.test\.tsx?$/.test(from.path);
  const mockLoaders = ["lib/cms-content-mock.ts", "lib/mock-cms.ts"];
  const fromMock = mockLoaders.includes(from.path);
  if (toFixture) {
    return fromFixture || fromTest || fromMock
      ? null
      : "CMS fixtures belong only to tests and opt-in mock loaders";
  }
  if (fromFixture) {
    // Erased domain types check fixture shape without loading domain code.
    return imported.typeOnly && ["features", "config", "lib"].includes(to.layer)
      ? null
      : "CMS fixtures may not load production modules at runtime";
  }
  if (mockLoaders.includes(to.path)) {
    if (fromTest || fromMock) return null;
    const entry =
      (from.path === "lib/cms-content.ts" &&
        to.path === "lib/cms-content-mock.ts") ||
      (from.path === "lib/sanity.ts" && to.path === "lib/mock-cms.ts");
    return entry && imported.dynamic && imported.mockGated
      ? null
      : "load CMS mocks dynamically inside the literal USE_MOCK_CMS gate";
  }
  if (
    from.path.startsWith("components/ds/") ||
    to.path.startsWith("components/ds/")
  ) {
    return "shared UI belongs to @tum.ai/ui-kit, not local copies";
  }
  switch (from.layer) {
    case "app":
      if (to.layer === "features") {
        return isPageModule(to) || isStylesheet(to)
          ? null
          : "routes import a page module (<name>-page.tsx) or page CSS only";
      }
      if (to.layer === "studio") return "the site may not import the studio";
      if (to.layer === "sanity") return "only the studio imports sanity";
      return null;
    case "root":
      return to.layer === "config" || to.layer === "lib"
        ? null
        : "top-level files (proxy.ts) may import only config and lib";
    case "studio":
      return to.layer === "studio" ||
        to.layer === "sanity" ||
        to.layer === "lib"
        ? null
        : "the studio may import only sanity and lib";
    case "features":
      // A CSS import is a side effect, so the bundler keeps the importing
      // module in every page that imports it. Routes import page CSS instead.
      if (isStylesheet(to)) return "import page CSS from the route file";
      if (to.layer === "features") {
        if (to.feature === from.feature) {
          return isFeatureEntry(from) && isPageModule(to)
            ? "a feature entry (index, server) may not re-export a page"
            : null;
        }
        return isFeatureEntry(to)
          ? null
          : `import @/features/${to.feature} (the index) or its server entry, not its files`;
      }
      if (
        to.layer === "shell" ||
        to.layer === "config" ||
        to.layer === "lib" ||
        to.path === "components/json-ld.tsx"
      ) {
        return null;
      }
      return `features may not import ${to.layer}`;
    case "shell":
      return ["shell", "config", "lib"].includes(to.layer)
        ? null
        : `the shell may not import ${to.layer}`;
    case "components":
      return ["config", "lib"].includes(to.layer)
        ? null
        : `components may not import ${to.layer}`;
    case "config":
      return to.layer === "config" || to.layer === "lib"
        ? null
        : "config may import only lib";
    case "lib":
      return to.layer === "lib" ? null : "lib may import only lib";
    case "sanity":
      return to.layer === "sanity" || to.layer === "lib"
        ? null
        : "sanity may import only lib";
    case "styles":
      return to.layer === "styles" ? null : "styles may import only styles";
  }
}

/** Public package entry points consumed by this application. */
const kitEntries = new Set([
  "@tum.ai/ui-kit",
  "@tum.ai/ui-kit/shell",
  "@tum.ai/ui-kit/halftone",
  "@tum.ai/ui-kit/tailwind.css",
  "@tum.ai/ui-kit/shell.css",
  "@tum.ai/ui-kit/halftone.css",
  "@tum.ai/ui-kit/fonts.css",
  "@tum.ai/ui-kit/package.json",
]);

/** Keep shared UI out of data/Studio layers and enforce public package APIs. */
function kitImportViolation(from: Module, specifier: string): string | null {
  if (
    specifier !== "@tum.ai/ui-kit" &&
    !specifier.startsWith("@tum.ai/ui-kit/")
  )
    return null;
  if (
    !kitEntries.has(specifier) &&
    !specifier.startsWith("@tum.ai/ui-kit/assets/")
  ) {
    return "import the UI kit through its public entry points";
  }
  if (!["app", "features", "shell", "components"].includes(from.layer)) {
    return "the UI kit belongs to the site UI, not data or Studio layers";
  }
  if (specifier.endsWith(".css") && from.layer !== "app") {
    return "import kit CSS from the site layout or route";
  }
  return null;
}

/**
 * The specifiers a module imports at runtime: type-only imports and exports
 * are erased by the compiler, so they add no edge to the bundle's module
 * graph.
 */
function runtimeSpecifiers(source: string): string[] {
  return [
    ...new Set(
      moduleImports(source)
        .filter(({ typeOnly }) => !typeOnly)
        .map(({ specifier }) => specifier),
    ),
  ];
}

/** Whether the module's directive prologue holds `"use client"`. */
function isClientModule(source: string): boolean {
  const file = ts.createSourceFile(
    "module.tsx",
    source,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TSX,
  );
  for (const statement of file.statements) {
    if (
      !ts.isExpressionStatement(statement) ||
      !ts.isStringLiteral(statement.expression)
    ) {
      return false;
    }
    if (statement.expression.text === "use client") return true;
  }
  return false;
}

/**
 * Modules that never run in the browser: `server-only`, Next's request and
 * cache APIs, and Node built-ins with or without the `node:` prefix.
 */
const serverModules = new Set([
  "server-only",
  "next/headers",
  "next/cache",
  ...builtinModules,
]);

/** Why a module may not run in the browser, or null when it may. */
function serverOnlyReason(source: string): string | null {
  const specifier = runtimeSpecifiers(source).find(
    (name) => name.startsWith("node:") || serverModules.has(name),
  );
  return specifier ? `imports "${specifier}"` : null;
}

describe("client graph", () => {
  test("parses runtime imports and skips type-only ones", () => {
    expect(
      runtimeSpecifiers(
        [
          'import type { A } from "pkg-a";',
          'import { type B, type C } from "pkg-b";',
          'import { type D, e } from "pkg-d";',
          'import F, { type G } from "pkg-default";',
          'export { f } from "pkg-f";',
          'export type { G } from "pkg-g";',
          'import "server-only";',
          'const h = () => import("pkg-h");',
          'type T = import("pkg-type").T;',
        ].join("\n"),
      ).sort(),
    ).toStrictEqual(["pkg-d", "pkg-default", "pkg-f", "pkg-h", "server-only"]);
  });

  test("finds imports a regex would miss, and none in comments or strings", () => {
    expect(
      runtimeSpecifiers(
        [
          "import {",
          "  a, // it's the first",
          '} from "pkg-apostrophe";',
          "const b = import(`pkg-template`);",
          'const c = import("pkg-attributes", { with: { type: "json" } });',
          'const d = require("pkg-require");',
          'import e = require("pkg-import-equals");',
          '// import "pkg-comment";',
          "const f = 'import \"pkg-string\"';",
          "const g = import(`pkg-` + name);",
        ].join("\n"),
      ).sort(),
    ).toStrictEqual([
      "pkg-apostrophe",
      "pkg-attributes",
      "pkg-import-equals",
      "pkg-require",
      "pkg-template",
    ]);
  });

  test("reads the use client directive from the prologue only", () => {
    expect(isClientModule('/* it\'s */\n// note\n"use client";\nx();')).toBe(
      true,
    );
    expect(isClientModule("'use strict';\n'use client';")).toBe(true);
    expect(isClientModule('import "a";\n"use client";')).toBe(false);
    expect(isClientModule('const a = "use client";')).toBe(false);
  });

  test("flags server-only modules, Next request APIs and Node built-ins", () => {
    expect(serverOnlyReason('import "server-only";')).toBe(
      'imports "server-only"',
    );
    expect(serverOnlyReason('import { cookies } from "next/headers";')).toBe(
      'imports "next/headers"',
    );
    expect(serverOnlyReason('import { readFileSync } from "fs";')).toBe(
      'imports "fs"',
    );
    expect(serverOnlyReason('import { join } from "node:path";')).toBe(
      'imports "node:path"',
    );
    expect(serverOnlyReason('import type { Stats } from "fs";')).toBeNull();
    expect(serverOnlyReason('import { cn } from "@/lib/cn";')).toBeNull();
  });

  /*
   * Turbopack fails the production build when a "use client" module
   * reaches, through any chain of static or dynamic imports (feature index
   * barrels and data modules included), a module that imports
   * `server-only` or a Node built-in: the CMS content slices and their
   * mock loader. Islands take CMS values as props instead. This catches
   * the edge without a build.
   */
  // Parsing every module with TypeScript takes several seconds under
  // coverage instrumentation, so this test (the first to build the graph)
  // gets a longer timeout than the 5 s default.
  test('no "use client" module reaches a server-only module', {
    timeout: 30_000,
  }, () => {
    const graph = moduleGraph();
    const islands = graph.files.filter((file) =>
      isClientModule(graph.sources.get(file) ?? ""),
    );

    expect(serverOnlyChains(graph, islands)).toStrictEqual([]);
    // Guards the directive regex: the site has dozens of islands.
    expect(islands.length).toBeGreaterThan(20);
  });

  test("feature indexes are safe for client islands", () => {
    const graph = moduleGraph();
    const indexes = graph.files.filter((file) =>
      isFeatureIndex(moduleOf(relative(srcDir, file))),
    );

    expect(serverOnlyChains(graph, indexes)).toStrictEqual([]);
  });

  test('every feature server entry starts with import "server-only"', () => {
    const graph = moduleGraph();
    const unmarked = graph.files
      .filter((file) => isFeatureServerEntry(moduleOf(relative(srcDir, file))))
      .filter(
        (file) =>
          !/^import "server-only";/m.test(graph.sources.get(file) ?? ""),
      )
      .map((file) => relative(srcDir, file));

    expect(unmarked).toStrictEqual([]);
  });
});

type ModuleGraph = {
  files: string[];
  sources: Map<string, string>;
  /** Each module's local runtime imports, resolved to files. */
  edges: Map<string, string[]>;
};

let cachedGraph: ModuleGraph | undefined;

/**
 * The runtime import graph of every non-test module under src/, built once
 * per run: the tests below only read it.
 */
function moduleGraph(): ModuleGraph {
  cachedGraph ??= buildModuleGraph();
  return cachedGraph;
}

function buildModuleGraph(): ModuleGraph {
  const files = sourceFiles(srcDir).filter(
    (file) => !/\.test\.tsx?$/.test(file),
  );
  const sources = new Map(
    files.map((file) => [file, readFileSync(file, "utf8")]),
  );
  const edges = new Map(
    files.map((file) => [
      file,
      runtimeSpecifiers(sources.get(file) ?? "")
        .filter(isLocal)
        .map((specifier) => resolveImport(file, specifier))
        .filter((target): target is string => target !== null),
    ]),
  );
  return { files, sources, edges };
}

/**
 * Every import chain from one of `roots` to a module that may not run in
 * the browser ({@link serverOnlyReason}), as "a → b → c (reason)". The
 * walk stops at such a module, so each chain names the first one reached.
 */
function serverOnlyChains(
  { sources, edges }: ModuleGraph,
  roots: readonly string[],
): string[] {
  const name = (file: string) => relative(srcDir, file).split(sep).join("/");
  const chains: string[] = [];
  for (const root of roots) {
    const parent = new Map<string, string | null>([[root, null]]);
    const queue = [root];
    while (queue.length > 0) {
      const current = queue.shift() as string;
      const reason = serverOnlyReason(sources.get(current) ?? "");
      if (reason) {
        const chain: string[] = [];
        for (let at: string | null = current; at; at = parent.get(at) ?? null) {
          chain.unshift(name(at));
        }
        chains.push(`${chain.join(" → ")} (${reason})`);
        continue;
      }
      for (const next of edges.get(current) ?? []) {
        if (!parent.has(next)) {
          parent.set(next, current);
          queue.push(next);
        }
      }
    }
  }
  return chains;
}

describe("CMS fixture isolation", () => {
  test.each([
    ["features/home/home-page.tsx", "lib/cms-fixtures/index.ts"],
    ["lib/cms-content-model.ts", "lib/cms-fixtures/types.ts"],
    ["sanity/schemas/content/home-copy.ts", "lib/cms-fixtures/community.ts"],
    ["lib/cms-fixtures/community.ts", "features/community/content.ts"],
  ])("rejects runtime import %s → %s", (from, to) => {
    expect(importViolation(moduleOf(from), moduleOf(to))).not.toBeNull();
  });

  test("allows fixture shape checks with erased domain types only", () => {
    expect(
      importViolation(
        moduleOf("lib/cms-fixtures/settings.ts"),
        moduleOf("config/site-facts.ts"),
        { typeOnly: true },
      ),
    ).toBeNull();
    expect(
      importViolation(
        moduleOf("lib/cms-fixtures/programmes.ts"),
        moduleOf("features/e-lab/data/copy.ts"),
        { typeOnly: true },
      ),
    ).toBeNull();
    expect(
      importViolation(
        moduleOf("config/site-facts.ts"),
        moduleOf("lib/cms-fixtures/types.ts"),
        { typeOnly: true },
      ),
    ).not.toBeNull();
  });

  test.each([
    ["lib/cms-fixtures/index.ts", "lib/cms-fixtures/settings.ts"],
    ["lib/cms-content-mock.ts", "lib/cms-fixtures/index.ts"],
    ["lib/mock-cms.ts", "lib/cms-content-mock.ts"],
    ["features/legal/imprint-page.test.tsx", "lib/cms-fixtures/settings.ts"],
  ])("allows test support import %s → %s", (from, to) => {
    expect(importViolation(moduleOf(from), moduleOf(to))).toBeNull();
  });

  test.each([
    ['import "./cms-content-mock";', false],
    ['const mock = import("./cms-content-mock");', false],
    [
      'if (process.env.USE_MOCK_CMS === "1") { import("./cms-content-mock"); }',
      false,
    ],
    [
      'if (process.env.USE_MOCK_CMS === "1" && !process.env.VERCEL) {} else { import("./cms-content-mock"); }',
      false,
    ],
    [
      'if (process.env.USE_MOCK_CMS === "1" && !process.env.VERCEL) { require("./cms-content-mock"); }',
      false,
    ],
    [
      'if (process.env.USE_MOCK_CMS === "1" && !process.env.VERCEL) { import("./cms-content-mock"); }',
      true,
    ],
  ])("validates the opt-in fixture gate in %s", (source, allowed) => {
    const imported = moduleImports(source)[0];
    expect(imported).toBeDefined();
    expect(
      importViolation(
        moduleOf("lib/cms-content.ts"),
        moduleOf("lib/cms-content-mock.ts"),
        imported,
      ) === null,
    ).toBe(allowed);
  });
});

describe("import rules", () => {
  test("every local import follows the layer rules", () => {
    const violations: string[] = [];
    let checked = 0;

    for (const file of sourceFiles(srcDir)) {
      const from = moduleOf(relative(srcDir, file));
      for (const imported of moduleImports(readFileSync(file, "utf8")).filter(
        ({ specifier }) => isLocal(specifier),
      )) {
        const { specifier } = imported;
        const target = resolveImport(file, specifier);
        if (!target) {
          violations.push(`${from.path} → ${specifier} (does not resolve)`);
          continue;
        }
        checked++;
        const reason = importViolation(
          from,
          moduleOf(relative(srcDir, target)),
          imported,
        );
        if (reason) violations.push(`${from.path} → ${specifier} (${reason})`);
      }
    }

    expect(violations).toStrictEqual([]);
    // Guards the regex: the tree has hundreds of local imports.
    expect(checked).toBeGreaterThan(200);
  });

  test("UI kit imports use public entry points in the site UI only", () => {
    const violations: string[] = [];
    for (const file of sourceFiles(srcDir)) {
      const from = moduleOf(relative(srcDir, file));
      for (const { specifier } of moduleImports(readFileSync(file, "utf8"))) {
        const reason = kitImportViolation(from, specifier);
        if (reason) violations.push(`${from.path} → ${specifier} (${reason})`);
      }
    }
    expect(violations).toStrictEqual([]);
  });

  test.each([
    ["app/studio/[[...tool]]/layout.tsx", "@tum.ai/ui-kit/shell"],
    ["app/studio/[[...tool]]/layout.tsx", "@tum.ai/ui-kit/tailwind.css"],
    ["lib/sanity.ts", "@tum.ai/ui-kit"],
    ["features/home/home-page.tsx", "@tum.ai/ui-kit/dist/components/button.js"],
    ["features/home/home-page.tsx", "@tum.ai/ui-kit/src/index.ts"],
    ["features/home/home-page.tsx", "@tum.ai/ui-kit/shell.css"],
  ])("rejects kit import %s → %s", (from, specifier) => {
    expect(kitImportViolation(moduleOf(from), specifier)).not.toBeNull();
  });

  test.each([
    ["features/home/home-page.tsx", "@tum.ai/ui-kit"],
    ["components/shell/header.tsx", "@tum.ai/ui-kit/shell"],
    ["features/hackathons/makeathon-dawn.tsx", "@tum.ai/ui-kit/halftone"],
    ["app/(site)/hackathons/page.tsx", "@tum.ai/ui-kit/halftone.css"],
  ])("allows kit import %s → %s", (from, specifier) => {
    expect(kitImportViolation(moduleOf(from), specifier)).toBeNull();
  });

  test("a route file imports one page and only its feature's CSS", () => {
    const violations: string[] = [];

    for (const file of sourceFiles(join(srcDir, "app"))) {
      const from = moduleOf(relative(srcDir, file));
      const featureImports = localSpecifiers(readFileSync(file, "utf8"))
        .map((specifier) => resolveImport(file, specifier))
        .filter((target): target is string => target !== null)
        .map((target) => moduleOf(relative(srcDir, target)))
        .filter((to) => to.layer === "features");

      const pages = featureImports.filter(isPageModule);
      if (pages.length > 1) {
        violations.push(
          `${from.path} imports ${pages.length} page modules: ${pages.map((page) => page.path).join(", ")}`,
        );
      }
      const features = new Set(featureImports.map((to) => to.feature));
      if (features.size > 1) {
        violations.push(
          `${from.path} imports from ${features.size} features: ${[...features].join(", ")}`,
        );
      }
    }

    expect(violations).toStrictEqual([]);
  });

  test("every feature folder has a page module for its route", () => {
    const featuresDir = join(srcDir, "features");
    const missing = readdirSync(featuresDir)
      .filter((name) => statSync(join(featuresDir, name)).isDirectory())
      .filter(
        (name) =>
          !readdirSync(join(featuresDir, name)).some((file) =>
            file.endsWith("-page.tsx"),
          ),
      );

    expect(missing).toStrictEqual([]);
  });

  test.each([
    ["components/ds/card.tsx", "config/contact.ts"],
    ["components/ds/card.tsx", "lib/sanity.ts"],
    ["features/home/home-page.tsx", "features/partners/partner-logo.tsx"],
    ["features/home/home-page.tsx", "features/partners/partners-page.tsx"],
    ["features/home/home-page.tsx", "app/(site)/layout.tsx"],
    ["app/(site)/page.tsx", "features/partners/index.ts"],
    ["app/(site)/page.tsx", "features/home/data/homepage.ts"],
    ["app/studio/[[...tool]]/layout.tsx", "components/shell/header.tsx"],
    ["lib/sanity.ts", "config/seo.ts"],
    ["config/seo.ts", "components/json-ld.tsx"],
    ["features/home/home-page.tsx", "features/home/home.css"],
    ["features/partners/index.ts", "features/partners/partners-page.tsx"],
    ["features/home/home-page.tsx", "components/ds/button.tsx"],
    ["components/shell/header.tsx", "components/ds/dialog.tsx"],
    ["app/(site)/layout.tsx", "sanity/sanity.config.ts"],
    ["proxy.ts", "features/home/home-page.tsx"],
    ["proxy.ts", "components/json-ld.tsx"],
    ["features/partners/server.ts", "features/partners/partners-page.tsx"],
    ["features/home/home-page.tsx", "features/partners/content.ts"],
  ])("flags %s → %s", (from, to) => {
    expect(importViolation(moduleOf(from), moduleOf(to))).not.toBeNull();
  });

  test.each([
    ["features/home/home-page.tsx", "features/partners/index.ts"],
    ["features/home/home-page.tsx", "features/home/data/homepage.ts"],
    ["app/(site)/page.tsx", "features/home/home-page.tsx"],
    ["app/(site)/page.tsx", "features/home/home.css"],
    ["app/studio/[[...tool]]/page.tsx", "sanity/sanity.config.ts"],
    ["proxy.ts", "lib/redirects.ts"],
    ["features/home/home-page.tsx", "features/partners/server.ts"],
  ])("allows %s → %s", (from, to) => {
    expect(importViolation(moduleOf(from), moduleOf(to))).toBeNull();
  });
});
