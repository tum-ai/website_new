import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("member journey does not nest block content inside paragraph tags", () => {
  const source = readFileSync(
    new URL("../src/components/apply/MemberJourney.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /<p\b[^>]*>(?:(?!<\/p>).)*<div\b[\s\S]*?<\/p>/);
  assert.doesNotMatch(
    source,
    /<p\b[^>]*>(?:(?!<\/p>).)*<Button\b[\s\S]*?<\/p>/,
  );
});

test("milestones does not return shorthand fragments from mapped lists", () => {
  const source = readFileSync(
    new URL("../src/components/apply/Milestones.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /\.map\([\s\S]*=>\s*\(\s*<>/);
  assert.doesNotMatch(source, /key=\{itemIndex\}/);
});

test("app icon exists so favicon resolution stays in the App Router", () => {
  assert.ok(existsSync(new URL("../src/app/icon.svg", import.meta.url)));
});
