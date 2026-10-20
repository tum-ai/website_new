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
  test("limits image preloads to the logo and the hero aperture's first photo", () => {
    // Responsive preloads carry `imagesrcset` instead of `href`.
    const imagePreloads = [
      ...document.querySelectorAll('link[rel="preload"][as="image"]'),
    ].map(
      (link) =>
        link.getAttribute("href") ?? link.getAttribute("imagesrcset") ?? "",
    );
    const photo = document.querySelector(".home-aperture img");
    expect(
      photo,
      "hero aperture must render its first CMS photo",
    ).not.toBeNull();
    const photoSrc = photo?.getAttribute("src") ?? "";
    const photoSrcset = photo?.getAttribute("srcset");
    expect(imagePreloads).toHaveLength(2);
    expect(imagePreloads).toContain("/assets/tum_ai_logo_new.svg");
    expect(imagePreloads).toContain(photoSrcset ?? photoSrc);
    expect(document.querySelectorAll(".home-aperture img")).toHaveLength(1);
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
