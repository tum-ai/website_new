import { expect, test } from "vitest";
import { contentSchemaTypes } from "./index";

type SchemaNode = {
  name?: string;
  group?: string | string[];
  groups?: { name: string }[];
  fields?: SchemaNode[];
  of?: SchemaNode[];
};

/**
 * A field's `group` resolves against the type that directly holds it: the
 * document's `groups` for top-level fields, the object's own `groups` for
 * nested ones. A group the holder does not declare makes the Studio throw
 * while it prepares the form, so the whole document becomes uneditable.
 */
function undeclaredGroups(holder: SchemaNode, path: string): string[] {
  const declared = new Set((holder.groups ?? []).map(({ name }) => name));
  return [...(holder.fields ?? []), ...(holder.of ?? [])].flatMap((field) => {
    const at = `${path}.${field.name ?? "[]"}`;
    const groups = [field.group ?? []].flat();
    return [
      ...groups
        .filter((group) => !declared.has(group))
        .map((group) => `${at}: ${group}`),
      ...undeclaredGroups(field, at),
    ];
  });
}

test("every field group is declared by the type that holds the field", () => {
  const problems = contentSchemaTypes.flatMap((type) =>
    undeclaredGroups(type as SchemaNode, type.name),
  );
  expect(problems).toStrictEqual([]);
});
