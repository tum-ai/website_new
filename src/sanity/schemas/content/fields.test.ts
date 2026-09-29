import { expect, test } from "vitest";
import { contentTokenNames } from "@/lib/content-tokens";
import {
  contentImageField,
  placeholderHelp,
  validatePlaceholders,
  validateSiteOrHttpsLink,
  validateSitePath,
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

test("site links stay on the site; evidence may also be https", () => {
  expect(validateSitePath("/community#journey")).toBe(true);
  expect(validateSitePath(undefined)).toBe(true);
  for (const value of [
    "//evil",
    "/\\evil.example",
    "https://a.example",
    "/Research",
  ]) {
    expect(validateSitePath(value), value).toMatch(/path on this site/);
  }
  expect(validateSiteOrHttpsLink("/research")).toBe(true);
  expect(validateSiteOrHttpsLink("https://a.example")).toBe(true);
  expect(validateSiteOrHttpsLink("//evil.example")).toMatch(/https/);
  expect(validateSiteOrHttpsLink("http://a.example")).toMatch(/https/);
});
