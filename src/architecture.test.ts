import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * Architecture fitness test: the import rules from the target layout.
 *
 * | Module              | May import                                          |
 * | ------------------- | --------------------------------------------------- |
 * | app, src/*.ts       | features/<x> (index only), components, config, lib, |
 * |                     | sanity, styles, app                                 |
 * | app/studio          | sanity, lib (no site shell, CSS or features)        |
 * | features/<x>        | its own files, features/<y> (index only),           |
 * |                     | components/{ds,shell}, components/json-ld, config,  |
 * |                     | lib                                                 |
 * | components/ds       | its own files and lib/cn                            |
 * | components/shell    | its own files, ds, config, lib                      |
 * | components/*.tsx    | ds, config, lib                                     |
 * | config              | config, lib                                         |
 * | lib                 | lib                                                 |
 * | sanity              | sanity, lib                                         |
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

const isFeatureIndex = (to: Module) =>
  to.layer === "features" && to.path === `features/${to.feature}/index.ts`;

/** Why `from` may not import `to`, or null when the import is allowed. */
function importViolation(from: Module, to: Module): string | null {
  switch (from.layer) {
    case "app":
    case "root":
      if (to.layer === "features") {
        return isFeatureIndex(to)
          ? null
          : `import @/features/${to.feature} (the index), not its files`;
      }
      return to.layer === "studio"
        ? "the site may not import the studio"
        : null;
    case "studio":
      return to.layer === "studio" ||
        to.layer === "sanity" ||
        to.layer === "lib"
        ? null
        : "the studio may import only sanity and lib";
    case "features":
      if (to.layer === "features") {
        if (to.feature === from.feature || isFeatureIndex(to)) return null;
        return `import @/features/${to.feature} (the index), not its files`;
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
      return null;
  }
}

describe("import rules", () => {
  test("every local import follows the layer rules", () => {
    const violations: string[] = [];
    let checked = 0;

    for (const file of sourceFiles(srcDir)) {
      const from = moduleOf(relative(srcDir, file));
      for (const specifier of localSpecifiers(readFileSync(file, "utf8"))) {
        if (/^@\/(views|data)(\/|$)/.test(specifier)) {
          violations.push(`${from.path} → ${specifier} (removed directory)`);
          continue;
        }
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

  test("every feature folder has an index.ts", () => {
    const featuresDir = join(srcDir, "features");
    const missing = readdirSync(featuresDir)
      .filter((name) => statSync(join(featuresDir, name)).isDirectory())
      .filter((name) => !existsSync(join(featuresDir, name, "index.ts")));

    expect(missing).toStrictEqual([]);
  });

  test.each([
    ["components/ds/card.tsx", "config/contact.ts"],
    ["components/ds/card.tsx", "lib/sanity.ts"],
    ["features/home/home-page.tsx", "features/partners/partner-logo.tsx"],
    ["features/home/home-page.tsx", "app/(site)/layout.tsx"],
    ["app/(site)/page.tsx", "features/home/home-page.tsx"],
    ["app/studio/[[...tool]]/layout.tsx", "components/shell/header.tsx"],
    ["lib/sanity.ts", "config/seo.ts"],
    ["config/seo.ts", "components/json-ld.tsx"],
  ])("flags %s → %s", (from, to) => {
    expect(importViolation(moduleOf(from), moduleOf(to))).not.toBeNull();
  });

  test.each([
    ["components/ds/card.tsx", "lib/cn.ts"],
    ["features/home/home-page.tsx", "features/partners/index.ts"],
    ["features/home/home-page.tsx", "features/home/data/homepage.ts"],
    ["app/(site)/page.tsx", "features/home/index.ts"],
    ["app/studio/[[...tool]]/page.tsx", "sanity/sanity.config.ts"],
  ])("allows %s → %s", (from, to) => {
    expect(importViolation(moduleOf(from), moduleOf(to))).toBeNull();
  });
});
