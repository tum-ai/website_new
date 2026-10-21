import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, test } from "vitest";

/**
 * E-Lab performance budget, checked against the production build that
 * `pnpm build` wrote (see homepage.perf.ts).
 */
const distDir = resolve(process.env.NEXT_DIST_DIR ?? ".next-prod");
const pagePath = join(distDir, "server", "app", "e-lab.html");

if (!existsSync(pagePath)) {
  throw new Error(
    `No prerendered /e-lab at ${pagePath}. Run \`pnpm build\` before \`pnpm test:perf\`.`,
  );
}

const { document } = new JSDOM(readFileSync(pagePath, "utf8")).window;

/**
 * At most this many elements run the hero field's load fade. One CSS
 * animation per dot (hundreds of SVG circles) blocked a phone's main
 * thread for seconds; FieldDots draws each batch as one path.
 */
const MAX_FADE_ELEMENTS = 40;

describe("/e-lab build output", () => {
  test("the hero field fades out in batches, not one animation per dot", () => {
    const fading = document.querySelectorAll(".elab-field-out");
    expect(fading.length, "the hero field renders its fade").toBeGreaterThan(0);
    expect(fading.length).toBeLessThanOrEqual(MAX_FADE_ELEMENTS);
    for (const element of fading) expect(element.tagName).toBe("path");
  });

  test("the closed venture discs request no logos on load", () => {
    expect(document.querySelectorAll("svg image")).toHaveLength(0);
  });
});
