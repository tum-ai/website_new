// Merges the schema extracts of the Studio's workspaces into the one schema
// file Sanity TypeGen reads (`pnpm sanity:typegen`).
//
// `sanity schemas extract` handles one workspace per run, and TypeGen takes
// one schema, so the package script extracts `live` and `content` separately
// and this script concatenates them. Both extracts repeat Sanity's built-in
// types (`sanity.imageAsset`, ...): identical duplicates are dropped. Two
// different types with the same name would make the generated types lie
// about one dataset, so that throws.
//
// Usage: node scripts/sanity/merge-schemas.mjs <out.json> <in.json>...

import { readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";

/** The union of `schemas` (arrays of extracted types), deduplicated by name. */
function mergeSchemas(schemas) {
  const byName = new Map();
  for (const type of schemas.flat()) {
    const existing = byName.get(type.name);
    if (existing && !isDeepStrictEqual(existing, type)) {
      throw new Error(
        `Schema type "${type.name}" differs between workspaces; give one of them another name.`,
      );
    }
    byName.set(type.name, type);
  }
  return [...byName.values()];
}

const [output, ...inputs] = process.argv.slice(2);
if (!output || inputs.length === 0) {
  throw new Error("Usage: merge-schemas.mjs <out.json> <in.json>...");
}
const schemas = inputs.map((file) => JSON.parse(readFileSync(file, "utf8")));
writeFileSync(output, `${JSON.stringify(mergeSchemas(schemas), null, 2)}\n`);
