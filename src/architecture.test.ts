import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
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
 * | features/<x>        | its own files except .css, features/<y> (index),    |
 * |                     | components/{ds,shell}, components/json-ld, config,  |
 * |                     | lib                                                 |
 * | features/<x>/index  | its own feature's files except pages                |
 * | components/ds       | its own files and lib/cn                            |
 * | components/shell    | its own files, ds, config, lib                      |
 * | components/*.tsx    | ds, config, lib                                     |
 * | config              | config, lib                                         |
 * | lib                 | lib                                                 |
 * | sanity              | sanity, lib                                         |
 * | styles              | styles                                              |
 *
 * Outside the design system, ds is imported through its barrel
 * (`@/components/ds`), the one public API its docs and showcase describe.
 *
 * A route imports exactly its page module. A feature's `index.ts` is its API
 * for other features and exists only where another feature needs something;
 * it never re-exports a page. Turbopack keeps every re-exported module that
 * has client islands (or CSS), so a page in a barrel ships its islands to
 * every page that imports the barrel: the three legal routes would all load
 * the privacy table of contents, and the homepage the partnership finder.
 * For the same reason a route file imports at most one page module, plus
 * CSS of that page's feature only.
 *
 * There are no exceptions: a new import that breaks a rule changes the code
 * or, deliberately, the rule (here and in docs/architecture.md).
 *
 * Only local modules (`@/…` and relative paths) are checked; packages are not.
 * Imports are found with a regex over `import … from`, `export … from`,
 * side-effect `import "…"` and dynamic `import("…")`.
 */

const srcDir = import.meta.dirname;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

const importPatterns = [
  /\b(?:import|export)\b[^"'`;]*?\bfrom\s*["']([^"']+)["']/g,
  /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  /\bimport\s*["']([^"']+)["']/g,
];

function localSpecifiers(source: string): string[] {
  const specifiers = importPatterns.flatMap((pattern) =>
    [...source.matchAll(pattern)].map((match) => match[1]),
  );
  return [...new Set(specifiers)].filter(
    (specifier) => specifier.startsWith("@/") || specifier.startsWith("."),
  );
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
    | "ds"
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
    if (second === "ds") return { path, layer: "ds" };
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

const isPageModule = (to: Module) =>
  to.layer === "features" && to.path.endsWith("-page.tsx");

const isStylesheet = (to: Module) => to.path.endsWith(".css");

const dsBarrel = "components/ds/index.ts";

/** Why `from` may not import `to`, or null when the import is allowed. */
function importViolation(from: Module, to: Module): string | null {
  if (to.layer === "ds" && from.layer !== "ds" && to.path !== dsBarrel) {
    return "import the design system from @/components/ds (its barrel)";
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
          return isFeatureIndex(from) && isPageModule(to)
            ? "a feature index may not re-export a page"
            : null;
        }
        return isFeatureIndex(to)
          ? null
          : `import @/features/${to.feature} (the index), not its files`;
      }
      if (
        to.layer === "ds" ||
        to.layer === "shell" ||
        to.layer === "config" ||
        to.layer === "lib" ||
        to.path === "components/json-ld.tsx"
      ) {
        return null;
      }
      return `features may not import ${to.layer}`;
    case "ds":
      return to.layer === "ds" || to.path === "lib/cn.ts"
        ? null
        : "the design system may import only lib/cn and its own files";
    case "shell":
      return ["shell", "ds", "config", "lib"].includes(to.layer)
        ? null
        : `the shell may not import ${to.layer}`;
    case "components":
      return ["ds", "config", "lib"].includes(to.layer)
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

describe("import rules", () => {
  test("every local import follows the layer rules", () => {
    const violations: string[] = [];
    let checked = 0;

    for (const file of sourceFiles(srcDir)) {
      const from = moduleOf(relative(srcDir, file));
      for (const specifier of localSpecifiers(readFileSync(file, "utf8"))) {
        const target = resolveImport(file, specifier);
        if (!target) {
          violations.push(`${from.path} → ${specifier} (does not resolve)`);
          continue;
        }
        checked++;
        const reason = importViolation(
          from,
          moduleOf(relative(srcDir, target)),
        );
        if (reason) violations.push(`${from.path} → ${specifier} (${reason})`);
      }
    }

    expect(violations).toStrictEqual([]);
    // Guards the regex: the tree has hundreds of local imports.
    expect(checked).toBeGreaterThan(200);
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
  ])("flags %s → %s", (from, to) => {
    expect(importViolation(moduleOf(from), moduleOf(to))).not.toBeNull();
  });

  test.each([
    ["components/ds/card.tsx", "lib/cn.ts"],
    ["features/home/home-page.tsx", "features/partners/index.ts"],
    ["features/home/home-page.tsx", "features/home/data/homepage.ts"],
    ["app/(site)/page.tsx", "features/home/home-page.tsx"],
    ["app/(site)/page.tsx", "features/home/home.css"],
    ["app/studio/[[...tool]]/page.tsx", "sanity/sanity.config.ts"],
    ["features/home/home-page.tsx", "components/ds/index.ts"],
    ["components/ds/dialog.tsx", "components/ds/refs.ts"],
    ["proxy.ts", "lib/redirects.ts"],
  ])("allows %s → %s", (from, to) => {
    expect(importViolation(moduleOf(from), moduleOf(to))).toBeNull();
  });
});
