import { expect, test } from "vitest";
import { checkReadiness } from "../scripts/sanity/readiness";

test("readiness invokes every parser and reports actionable failures without stopping the rest", async () => {
  let calls = 0;
  const result = await checkReadiness([
    {
      label: "settings",
      read: async () => {
        calls++;
        return { name: "Example" };
      },
    },
    {
      label: "copy",
      read: async () => {
        calls++;
        throw new Error("copy.hero.title is required");
      },
    },
    {
      label: "list",
      read: async () => {
        calls++;
        return [];
      },
    },
  ]);
  expect(calls).toBe(3);
  expect(result).toStrictEqual([
    { label: "settings", ready: true },
    { label: "copy", ready: false, detail: "copy.hero.title is required" },
    { label: "list", ready: true },
  ]);
});
