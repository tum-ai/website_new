import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

/**
 * The /design-system page is the living reference: every runtime export of
 * the design-system barrel must be used on it, so a new component can't ship
 * without a showcase entry. Type-only exports are skipped.
 */
const root = join(import.meta.dirname, "..", "..");
const barrel = readFileSync(join(root, "components/ds/index.ts"), "utf8");

/** Exports with nothing to show, and where they are exercised instead. */
const withoutVisuals: Record<string, string> = {
  MotionProvider: "rendered once by the (site) layout around every page",
  useInertBackground: "called by every <Dialog> on the page",
};

function runtimeExports(source: string): string[] {
  const names: string[] = [];
  for (const [, list = ""] of source.matchAll(/export\s*\{([^}]*)\}\s*from/g)) {
    for (const entry of list.split(",")) {
      const name = entry.trim();
      if (name && !name.startsWith("type ")) names.push(name);
    }
  }
  return names;
}

const showcase = readdirSync(import.meta.dirname)
  .filter((name) => /\.tsx$/.test(name) && !name.includes(".test."))
  .map((name) => readFileSync(join(import.meta.dirname, name), "utf8"))
  .join("\n");

test("the barrel has runtime exports", () => {
  expect(runtimeExports(barrel).length).toBeGreaterThan(40);
});

test.each(runtimeExports(barrel).filter((name) => !(name in withoutVisuals)))(
  "the showcase uses %s",
  (name) => {
    expect(showcase).toMatch(new RegExp(`\\b${name}\\b`));
  },
);
