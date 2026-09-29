import { describe, expect, test } from "vitest";
import { copyString, copyStringList, copyText } from "./copy-fields";

type Check = (value: unknown) => true | string;

/**
 * Runs a field's `validation` against a stand-in Rule that records the
 * length limit, whether it is required, and the custom checks.
 */
function rulesOf(field: { validation?: unknown }) {
  const recorded = { required: false, max: 0, checks: [] as Check[] };
  const rule: Record<string, unknown> = {};
  Object.assign(rule, {
    required: () => {
      recorded.required = true;
      return rule;
    },
    max: (length: number) => {
      recorded.max = length;
      return rule;
    },
    min: () => rule,
    custom: (check: Check) => {
      recorded.checks.push(check);
      return rule;
    },
  });
  (field.validation as (rule: unknown) => unknown)(rule);
  const check = (value: unknown) =>
    recorded.checks
      .map((run) => run(value))
      .find((result) => result !== true) ?? true;
  return { ...recorded, check };
}

describe("copy fields", () => {
  test("are required with the layout's limit, stated for editors", () => {
    const field = copyString({ name: "title", title: "Title", max: 40 });
    expect(rulesOf(field)).toMatchObject({ required: true, max: 40 });
    expect(field.description).toContain("At most 40 characters.");
    expect(
      rulesOf(copyText({ name: "x", title: "X", max: 9, required: false })),
    ).toMatchObject({ required: false, max: 9 });
  });

  test("placeholders are validated by name", () => {
    const { check } = rulesOf(
      copyText({ name: "lead", title: "Lead", max: 200, placeholders: true }),
    );
    expect(check("Since {{org.foundingYear}}.")).toBe(true);
    expect(check("Since {{org.foundedYear}}.")).toMatch(/Unknown placeholder/);
  });

  test("page tokens are accepted only on the fields that declare them", () => {
    const field = copyText({
      name: "lead",
      title: "Lead",
      max: 200,
      placeholders: true,
      pageTokens: { count: "the number of task forces" },
    });
    expect(field.description).toContain(
      "{{count}} becomes the number of task forces.",
    );
    const { check } = rulesOf(field);
    expect(check("{{count}} run since {{org.foundingYear}}.")).toBe(true);
    expect(check("{{partner}} runs.")).toMatch(/\{\{partner\}\}/);
    const plain = rulesOf(
      copyText({ name: "lead", title: "Lead", max: 200, placeholders: true }),
    );
    expect(plain.check("{{count}} run.")).toMatch(/\{\{count\}\}/);
  });

  test("a string list limits each item", () => {
    const field = copyStringList({
      name: "items",
      title: "Items",
      max: 120,
      minItems: 1,
    });
    const [item] = field.of as { validation?: unknown }[];
    expect(rulesOf(item)).toMatchObject({ required: true, max: 120 });
    expect(field.description).toContain("Each at most 120 characters.");
  });
});
