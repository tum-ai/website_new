import { expect, test, vi } from "vitest";
import { rexInstitutionsOf } from "./data/rex";
import { getRexInstitutions } from "./rex-content";

const lists = vi.hoisted(() => ({
  "rex-institutions": [] as { key: string; name: string }[],
}));
vi.mock("@/lib/organization-content", () => ({
  getLogoLists: async () => lists,
}));
test("deleted REX list stays empty", async () => {
  expect(await getRexInstitutions()).toEqual([]);
});
test("institution names and artwork derive from the supplied organizations", () => {
  expect(rexInstitutionsOf([{ key: "example", name: "Example Lab" }])).toEqual([
    { key: "example", name: "Example Lab", shortName: "Example Lab" },
  ]);
});
