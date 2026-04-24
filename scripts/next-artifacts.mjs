import { rmSync } from "node:fs";

const KNOWN_NEXT_OUTPUT_DIRS = [
  ".next",
  ".next-dev",
  ".next-homepage-perf",
  ".next-prod",
  ".next-test",
  ".next-typecheck",
  ".next-webpack",
];

export function clearNextArtifacts({ preserve = [] } = {}) {
  const preserved = new Set(preserve);

  for (const dir of KNOWN_NEXT_OUTPUT_DIRS) {
    if (preserved.has(dir)) {
      continue;
    }

    rmSync(dir, { recursive: true, force: true });
  }

  rmSync("tsconfig.tsbuildinfo", { force: true });
}
