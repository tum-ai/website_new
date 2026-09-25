import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, test } from "vitest";

/**
 * Homepage performance budget, checked against the production build that
 * `pnpm build` wrote (Turbopack, like Vercel). See the "Homepage" constraint
 * in docs/design-system.md.
 */
const distDir = resolve(process.env.NEXT_DIST_DIR ?? ".next-prod");
const homepagePath = join(distDir, "server", "app", "index.html");

if (!existsSync(homepagePath)) {
  throw new Error(
    `No prerendered homepage at ${homepagePath}. Run \`pnpm build\` before \`pnpm test:perf\`.`,
  );
}

const { document } = new JSDOM(readFileSync(homepagePath, "utf8")).window;

function hrefs(selector: string) {
  return [...document.querySelectorAll(selector)]
    .map((element) => element.getAttribute("href"))
    .filter((href): href is string => href !== null);
}

/** Server-rendered markup without the inline RSC payload scripts. */
function markupWithoutScripts() {
  const root = document.documentElement.cloneNode(true) as HTMLElement;
  for (const script of root.querySelectorAll("script")) script.remove();
  return root.outerHTML;
}

/** The CSS the homepage actually links, read from the build output. */
function getHomepageCss() {
  const stylesheets = hrefs('link[rel="stylesheet"][href^="/_next/"]');
  expect(stylesheets.length, "homepage links no built CSS").toBeGreaterThan(0);

  return stylesheets
    .map((href) =>
      readFileSync(join(distDir, href.slice("/_next/".length)), "utf8"),
    )
    .join("\n");
}

describe("homepage build output", () => {
  test("limits above-the-fold image preloads to the hero logo", () => {
    const imagePreloads = hrefs('link[rel="preload"][as="image"]');

    expect(imagePreloads).toStrictEqual(["/assets/tum_ai_logo_new.svg"]);
    expect(imagePreloads).not.toContain("/assets/open_ai_speaker_event.webp");
    expect(imagePreloads).not.toContain(
      "/assets/innovation/robotics_discussion.webp",
    );
  });

  test("hero background stays decorative without server-rendered media tiles", () => {
    const markup = markupWithoutScripts();

    expect(markup).toContain('id="main-content"');
    expect(markup).not.toMatch(/brand-grid-tile/);
    expect(markup).not.toMatch(/mix-blend-overlay/);
  });

  test("linked CSS contains the Tailwind utilities the page uses", () => {
    const css = getHomepageCss();

    expect(css).toMatch(/\.fixed\s*\{/);
    expect(css).toMatch(/\.min-h-screen\s*\{/);
    expect(css).toMatch(/\.text-minimal-gray\s*\{/);
  });
});
