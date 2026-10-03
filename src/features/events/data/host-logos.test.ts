import { existsSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { organizationsWithKeys } from "@/features/partners";
import { getMockEvents } from "@/lib/mock-cms";
import { hostArtworkOf } from "./host-logos";

const publicDir = path.resolve(import.meta.dirname, "../../../../public");

test("every co-host of the fixtures has artwork that ships in public/", () => {
  const keys = [
    ...new Set(
      getMockEvents().flatMap((event) =>
        (event.coHosts ?? []).map(({ key }) => key),
      ),
    ),
  ];
  const { logos, icons } = hostArtworkOf(organizationsWithKeys(keys));
  for (const key of keys) {
    const src = logos[key]?.src ?? icons[key];
    expect(src, key).toBeDefined();
    if (src) expect(existsSync(path.join(publicDir, src)), key).toBe(true);
  }
});
