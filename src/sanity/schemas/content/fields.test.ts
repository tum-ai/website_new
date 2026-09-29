import { expect, test } from "vitest";
import { contentTokenNames } from "@/lib/content-tokens";
import {
  contentImageField,
  placeholderHelp,
  validatePlaceholders,
} from "./fields";

test("placeholder validation accepts known names and names the unknown ones", () => {
  const known = `Closes {{${contentTokenNames[0]}}}.`;
  expect(validatePlaceholders(known)).toBe(true);
  expect(validatePlaceholders(undefined)).toBe(true);
  expect(validatePlaceholders("Closes {{eLab.dedline}}.")).toMatch(
    /Unknown placeholder \{\{eLab\.dedline\}\}\. Available: /,
  );
});

test("the help text lists every placeholder", () => {
  for (const name of contentTokenNames) {
    expect(placeholderHelp).toContain(`{{${name}}}`);
  }
});

test("content images have alt text and a hotspot for toContentImage", () => {
  const field = contentImageField({
    name: "logo",
    title: "Logo",
    required: true,
  });
  expect(field).toMatchObject({
    name: "logo",
    type: "image",
    options: { hotspot: true },
    fields: [expect.objectContaining({ name: "alt", type: "string" })],
  });
  expect(field.validation).toBeTypeOf("function");
  expect(
    contentImageField({ name: "photo", title: "Photo" }).validation,
  ).toBeUndefined();
});
