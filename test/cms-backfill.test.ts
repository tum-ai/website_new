import { existsSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { assetFileOf, collectSanityAssets } from "@/lib/cms-backfill";
import { pinnedDocuments } from "@/sanity/content-structure";
import {
  contentSchemaTypes,
  contentSingletons,
} from "@/sanity/schemas/content";
import { backfillSlices, collectBackfill } from "../scripts/sanity/slices";

/**
 * Every registered content slice's backfill (scripts/sanity/slices.ts) is
 * importable as is: what `pnpm sanity:backfill --apply` would send.
 */
const documents = collectBackfill();

type Field = { name: string; validation?: unknown };
const schemaByName = new Map<string, { name: string; fields: Field[] }>(
  contentSchemaTypes.map((type) => [
    type.name,
    type as unknown as { name: string; fields: Field[] },
  ]),
);

/**
 * Whether a field's `validation` calls `Rule.required()`: runs it against a
 * stand-in Rule whose every method chains and records `required`.
 */
function isRequired(validation: unknown): boolean {
  if (typeof validation !== "function") return false;
  let required = false;
  const rule: unknown = new Proxy(() => rule, {
    get: (_, method) => () => {
      if (method === "required") required = true;
      return rule;
    },
  });
  validation(rule);
  return required;
}

const isSet = (value: unknown) =>
  value !== undefined &&
  value !== null &&
  !(typeof value === "string" && value.trim() === "") &&
  !(Array.isArray(value) && value.length === 0);

describe("the CMS backfill", () => {
  test("every slice builds documents", () => {
    for (const { slice, build } of backfillSlices) {
      expect(build().length, slice).toBeGreaterThan(0);
    }
  });

  test("ids are unique and public (no dots, no drafts prefix)", () => {
    const ids = documents.map(({ _id }) => _id);
    expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toStrictEqual(
      [],
    );
    // Letters (a singleton's id is its camelCase type name), digits and
    // hyphens: a `.` would make the document private.
    for (const id of ids) expect(id).toMatch(/^[a-zA-Z0-9][a-zA-Z0-9-]*$/);
  });

  test("every type is a content workspace type, never a live dataset one", () => {
    const unknown = documents
      .map(({ _type }) => _type)
      .filter((type) => !schemaByName.has(type));
    expect([...new Set(unknown)]).toStrictEqual([]);
  });

  test("singletons use their type as the id", () => {
    const singletons = new Set(contentSingletons.map(({ type }) => type));
    for (const { _id, _type } of documents) {
      if (singletons.has(_type)) expect(_id).toBe(_type);
    }
  });

  test("every document the Studio pins by id is backfilled with that id", () => {
    for (const { id, type } of pinnedDocuments) {
      expect(
        documents.find(({ _id }) => _id === id)?._type,
        `pinned document ${id}`,
      ).toBe(type);
    }
  });

  test("every required field is set", () => {
    let checked = 0;
    const missing = documents.flatMap((document) =>
      (schemaByName.get(document._type)?.fields ?? [])
        .filter((field) => isRequired(field.validation))
        .filter((field) => {
          checked++;
          return !isSet(document[field.name]);
        })
        .map((field) => `${document._id}.${field.name}`),
    );
    expect(missing).toStrictEqual([]);
    // Guards the Rule stand-in: the content types do have required fields.
    expect(checked).toBeGreaterThan(documents.length);
  });

  test("every image file exists", () => {
    const missing = collectSanityAssets(documents).filter((asset) => {
      const file = assetFileOf(asset);
      return !file || !existsSync(file);
    });
    expect(missing).toStrictEqual([]);
  });

  test("the required-field check sees Rule.required()", () => {
    expect(
      isRequired((rule: { required: () => unknown }) => rule.required()),
    ).toBe(true);
    expect(isRequired(undefined)).toBe(false);
    expect(
      isRequired((rule: { integer: () => unknown }) => rule.integer()),
    ).toBe(false);
  });
});
