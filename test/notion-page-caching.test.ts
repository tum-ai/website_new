import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const eventsPageSource = readFileSync(
  new URL("../src/app/events/page.tsx", import.meta.url),
  "utf8",
);
const researchPageSource = readFileSync(
  new URL("../src/app/research/page.tsx", import.meta.url),
  "utf8",
);

test("notion-backed pages use revalidation instead of forced dynamic rendering", () => {
  assert.doesNotMatch(eventsPageSource, /force-dynamic/);
  assert.match(eventsPageSource, /export const revalidate = \d+;/);

  assert.doesNotMatch(researchPageSource, /force-dynamic/);
  assert.match(researchPageSource, /export const revalidate = \d+;/);
});
