/**
 * `pnpm sanity:backfill [--dataset redesign] [--apply] [--allow-production]`
 *
 * Turns today's code content into Sanity documents (every slice registered
 * in `slices.ts`) and writes them to `.sanity-backfill/<dataset>.ndjson`
 * (gitignored), with a count per type. Nothing leaves the machine unless
 * `--apply` is given: then it runs
 * `sanity dataset import <file> <dataset> --replace` with your CLI login
 * (`sanity login`), which uploads the `_sanityAsset` images and replaces
 * documents with the same `_id`. Documents that exist only in the dataset are
 * left alone.
 *
 * The live dataset (`production`) is refused without `--allow-production`:
 * the old site renders what is there. See docs/adr/0009-cms-content-source.md
 * for the launch runbook.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parseArgs } from "node:util";
import { assetFileOf, collectSanityAssets } from "@/lib/cms-backfill";
import { collectBackfill } from "./slices";

const root = join(import.meta.dirname, "..", "..");

const { values } = parseArgs({
  options: {
    dataset: { type: "string", default: "redesign" },
    apply: { type: "boolean", default: false },
    "allow-production": { type: "boolean", default: false },
  },
});

const dataset = values.dataset;
if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(dataset)) {
  throw new Error(`Not a dataset name: "${dataset}"`);
}

if (values.apply && dataset === "production" && !values["allow-production"]) {
  throw new Error(
    'Refusing to import into "production": the old site renders that dataset. Use the content dataset (--dataset redesign), or pass --allow-production if you really mean it.',
  );
}

const documents = collectBackfill();

const seen = new Set<string>();
const duplicates = documents
  .map(({ _id }) => _id)
  .filter((id) => seen.size === seen.add(id).size);
if (duplicates.length > 0) {
  throw new Error(`Duplicate _id(s): ${[...new Set(duplicates)].join(", ")}`);
}

const assets = collectSanityAssets(documents);
const missing = assets.filter((asset) => {
  const file = assetFileOf(asset);
  return !file || !existsSync(file);
});
if (missing.length > 0) {
  throw new Error(`Missing asset file(s):\n${missing.join("\n")}`);
}

const outDir = join(root, ".sanity-backfill");
const outFile = join(outDir, `${dataset}.ndjson`);
mkdirSync(outDir, { recursive: true });
writeFileSync(
  outFile,
  `${documents.map((document) => JSON.stringify(document)).join("\n")}\n`,
);

const counts = new Map<string, number>();
for (const { _type } of documents) {
  counts.set(_type, (counts.get(_type) ?? 0) + 1);
}
const width = Math.max(...[...counts.keys()].map((type) => type.length), 6);
const lines = [
  `Backfill for dataset "${dataset}": ${relative(root, outFile)}`,
  ...[...counts].map(([type, count]) => `  ${type.padEnd(width)}  ${count}`),
  `  ${"assets".padEnd(width)}  ${assets.length} file(s) to upload`,
  `  ${"total".padEnd(width)}  ${documents.length} document(s)`,
];
process.stdout.write(`${lines.join("\n")}\n`);

if (!values.apply) {
  process.stdout.write(
    `Dry run: nothing was written to Sanity. Review the file, then add --apply.\n`,
  );
  process.exit(0);
}

process.stdout.write(`Importing into "${dataset}" (--replace)...\n`);
const result = spawnSync(
  join(root, "node_modules", ".bin", "sanity"),
  ["dataset", "import", outFile, dataset, "--replace"],
  { cwd: join(root, "src", "sanity"), stdio: "inherit" },
);
process.exit(result.status ?? 1);
