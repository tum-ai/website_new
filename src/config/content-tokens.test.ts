import { expect, test } from "vitest";
import { contentTokenNames } from "@/lib/content-tokens";
import { contentTokens } from "./content-tokens";
import { eLabApplicationCopy } from "./e-lab";

test("every placeholder has a non-empty value without placeholders of its own", () => {
  expect(Object.keys(contentTokens).sort()).toStrictEqual(
    [...contentTokenNames].sort(),
  );
  for (const [name, value] of Object.entries(contentTokens)) {
    expect(value.trim(), name).not.toBe("");
    expect(value, name).not.toMatch(/\{\{/);
  }
});

test("values come from the config facts", () => {
  expect(contentTokens["eLab.deadline"]).toBe(
    eLabApplicationCopy.deadlineLabel,
  );
});
