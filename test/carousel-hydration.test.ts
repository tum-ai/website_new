import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("carousel keeps scrollability flags stable through hydration", () => {
  const source = readFileSync(
    new URL("../src/components/ui/carousel.tsx", import.meta.url),
    "utf8",
  );

  assert.match(
    source,
    /const \[isHydrated, setIsHydrated\] = React\.useState\(false\)/,
  );
  assert.match(source, /setIsHydrated\(true\)/);
  assert.match(source, /canScrollPrev: isHydrated && canScrollPrev/);
  assert.match(source, /canScrollNext: isHydrated && canScrollNext/);
});
