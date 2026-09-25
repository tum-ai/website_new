import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
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

const homepageHtml = readFileSync(homepagePath, "utf8");

function stripScripts(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
}

function linkTags(html: string) {
  return [...html.matchAll(/<link\b[^>]*>/g)].map(([tag]) => tag);
}

function hrefOf(tag: string) {
  return tag.match(/href="([^"]+)"/)?.[1];
}

function getImagePreloads(html: string) {
  return linkTags(html)
    .filter((tag) => /rel="preload"/.test(tag) && /as="image"/.test(tag))
    .map(hrefOf)
    .filter((href): href is string => href !== undefined);
}

/** The CSS the homepage actually links, read from the build output. */
function getHomepageCss(html: string) {
  const stylesheets = linkTags(html)
    .filter((tag) => /rel="stylesheet"/.test(tag))
    .map(hrefOf)
    .filter((href): href is string => href?.startsWith("/_next/") ?? false);

  expect(stylesheets.length, "homepage links no built CSS").toBeGreaterThan(0);

  return stylesheets
    .map((href) =>
      readFileSync(join(distDir, href.slice("/_next/".length)), "utf8"),
    )
    .join("\n");
}

describe("homepage build output", () => {
  test("limits above-the-fold image preloads to the hero logo", () => {
    const imagePreloads = getImagePreloads(homepageHtml);

    expect(imagePreloads).toStrictEqual(["/assets/tum_ai_logo_new.svg"]);
    expect(imagePreloads).not.toContain("/assets/open_ai_speaker_event.webp");
    expect(imagePreloads).not.toContain(
      "/assets/innovation/robotics_discussion.webp",
    );
  });

  test("hero background stays decorative without server-rendered media tiles", () => {
    const markup = stripScripts(homepageHtml);

    expect(markup).not.toMatch(/brand-grid-tile/);
    expect(markup).not.toMatch(/mix-blend-overlay/);
  });

  test("linked CSS contains the Tailwind utilities the page uses", () => {
    const css = getHomepageCss(homepageHtml);

    expect(css).toMatch(/\.fixed\s*\{/);
    expect(css).toMatch(/\.min-h-screen\s*\{/);
    expect(css).toMatch(/\.text-minimal-gray\s*\{/);
  });
});
