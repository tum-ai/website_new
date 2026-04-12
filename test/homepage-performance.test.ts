import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import test from "node:test";

const DIST_DIR = ".next-homepage-perf";

function buildHomepageHtml() {
  const nextEnvPath = new URL("../next-env.d.ts", import.meta.url);
  const tsconfigPath = new URL("../tsconfig.json", import.meta.url);
  const hadNextEnv = existsSync(nextEnvPath);
  const originalNextEnv = hadNextEnv ? readFileSync(nextEnvPath, "utf8") : null;
  const originalTsconfig = readFileSync(tsconfigPath, "utf8");

  rmSync(".next", { recursive: true, force: true });
  rmSync(DIST_DIR, { recursive: true, force: true });

  try {
    execFileSync("pnpm", ["exec", "next", "build", "--webpack"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NEXT_DIST_DIR: DIST_DIR,
        NEXT_TELEMETRY_DISABLED: "1",
      },
      stdio: "pipe",
    });
  } finally {
    if (originalNextEnv !== null) {
      writeFileSync(nextEnvPath, originalNextEnv);
    }
    writeFileSync(tsconfigPath, originalTsconfig);
  }

  return readFileSync(`${DIST_DIR}/server/app/index.html`, "utf8");
}

function stripScripts(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
}

function getImagePreloads(html: string) {
  return [...html.matchAll(/<link\b[^>]*>/g)]
    .map((match) => match[0])
    .filter(
      (tag) =>
        /rel="preload"/.test(tag) &&
        /as="image"/.test(tag) &&
        /href="[^"]+"/.test(tag),
    )
    .map((tag) => tag.match(/href="([^"]+)"/)?.[1])
    .filter((href): href is string => href !== undefined);
}

const homepageHtml = buildHomepageHtml();
const homepageMarkup = stripScripts(homepageHtml);

test("homepage limits above-the-fold image preloads to the hero logo", () => {
  const imagePreloads = getImagePreloads(homepageHtml);

  assert.deepEqual(imagePreloads, ["/assets/tum_ai_logo_new.svg"]);
  assert.ok(!imagePreloads.includes("/assets/open_ai_speaker_event.webp"));
  assert.ok(
    !imagePreloads.includes("/assets/innovation/robotics_discussion.webp"),
  );
});

test("homepage hero background stays decorative without server-rendered media tiles", () => {
  assert.doesNotMatch(homepageMarkup, /brand-grid-tile/);
  assert.doesNotMatch(homepageMarkup, /mix-blend-overlay/);
});
