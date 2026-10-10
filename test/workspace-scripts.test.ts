import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import {
  clearNextArtifacts,
  LEGACY_NEXT_OUTPUT_DIRS,
} from "../scripts/next-artifacts.mjs";
import { resolveNextEnv } from "../scripts/run-next-command.mjs";

const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
const scripts: Record<string, string> = packageJson.scripts;

/** The local dist dir a `run-next-command.mjs <command> <distDir>` script uses. */
function distDirOf(script: string, command: string) {
  return script.match(
    new RegExp(`run-next-command\\.mjs ${command} (\\.next-[\\w-]+)`),
  )?.[1];
}

describe("package scripts", () => {
  test("build and start share one isolated dist dir, separate from dev", () => {
    const buildDir = distDirOf(scripts.build, "build");
    expect(buildDir).toBeDefined();
    expect(distDirOf(scripts.start, "start")).toBe(buildDir);

    const devDir = scripts.dev.match(/NEXT_DIST_DIR=(\S+)/)?.[1];
    expect(devDir).toMatch(/^\.next-/);
    expect(devDir).not.toBe(buildDir);
  });

  test("the fast checks never run a Next.js build", () => {
    for (const name of ["lint", "typecheck", "test"]) {
      expect(scripts[name], name).not.toMatch(/\bbuild\b/);
    }
  });

  test("verify runs every gate, with the perf check after the build", () => {
    const steps = scripts.verify
      .split("&&")
      .map((step) => step.trim().replace(/^pnpm (run )?/, ""));
    expect(steps).toEqual(
      expect.arrayContaining([
        "lint",
        "typecheck",
        "test",
        "build",
        "test:perf",
      ]),
    );
    expect(steps.indexOf("test:perf")).toBeGreaterThan(steps.indexOf("build"));
  });
});

describe("resolveNextEnv", () => {
  test("uses the isolated local dist dir by default", () => {
    expect(resolveNextEnv({}, ".next-prod").NEXT_DIST_DIR).toBe(".next-prod");
  });

  test("respects an explicit NEXT_DIST_DIR", () => {
    expect(
      resolveNextEnv({ NEXT_DIST_DIR: ".next-custom" }, ".next-prod")
        .NEXT_DIST_DIR,
    ).toBe(".next-custom");
  });

  test("leaves NEXT_DIST_DIR unset on Vercel", () => {
    expect(
      resolveNextEnv({ VERCEL: "1" }, ".next-prod").NEXT_DIST_DIR,
    ).toBeUndefined();
  });
});

describe("clearNextArtifacts", () => {
  let root: string;

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  function makeDirs(...dirs: string[]) {
    root = mkdtempSync(join(tmpdir(), "next-artifacts-"));
    for (const dir of dirs) mkdirSync(join(root, dir), { recursive: true });
  }

  test("never deletes dev-server output", () => {
    makeDirs(".next-dev/dev/types", ".next/dev/types", ".next/types");

    clearNextArtifacts({ root, preserve: [".next-prod"] });

    expect(existsSync(join(root, ".next-dev/dev/types"))).toBe(true);
    expect(existsSync(join(root, ".next/dev/types"))).toBe(true);
  });

  test("removes legacy dist dirs and stale default build output", () => {
    makeDirs(...LEGACY_NEXT_OUTPUT_DIRS, ".next/types", ".next/cache");

    clearNextArtifacts({ root, preserve: [".next-prod"] });

    for (const dir of LEGACY_NEXT_OUTPUT_DIRS) {
      expect(existsSync(join(root, dir)), dir).toBe(false);
    }
    expect(existsSync(join(root, ".next/types"))).toBe(false);
    expect(existsSync(join(root, ".next/cache"))).toBe(true);
  });

  test("keeps preserved dist dirs", () => {
    makeDirs(".next/types");

    clearNextArtifacts({ root, preserve: [".next"] });

    expect(existsSync(join(root, ".next/types"))).toBe(true);
  });
});
