import { evaluate, parse } from "groq-js";
import { beforeEach, expect, test, vi } from "vitest";
import { getFixtureDocuments } from "./cms-fixtures";
import { getPeople } from "./person-content";

const fixture = vi.hoisted(() => ({ docs: [] as Record<string, unknown>[] }));
vi.mock("./cms-content", () => ({
  loadContent: async ({
    query,
    params,
    select,
  }: {
    query: string;
    params?: Record<string, unknown>;
    select: (result: unknown) => unknown;
  }) =>
    select(
      await (
        await evaluate(parse(query), { dataset: fixture.docs, params })
      ).get(),
    ),
}));
beforeEach(() => {
  fixture.docs = structuredClone(getFixtureDocuments());
});
test("people resolve attribution in CMS order", async () => {
  const people = await getPeople({
    placement: "e-lab-testimonial",
    label: "testimonials",
    select: (p) => p,
  });
  expect(people.map((p) => p.key)).toEqual([
    "example-founder",
    "example-investor",
  ]);
  expect(people[0]?.organization?.name).toBe("Example Venture");
});
test("deleted collections stay empty", async () => {
  fixture.docs = fixture.docs.filter((doc) => doc._type !== "person");
  expect(
    await getPeople({
      placement: "partner-profile",
      label: "profiles",
      select: (p) => p,
    }),
  ).toEqual([]);
});
test("unresolved attribution and malformed identities throw", async () => {
  fixture.docs = fixture.docs.filter(
    (doc) => doc._id !== "organization-example-company",
  );
  await expect(
    getPeople({
      placement: "partner-profile",
      label: "profiles",
      select: (p) => p,
    }),
  ).rejects.toThrow(/unresolved organization/);
});
