/**
 * `pnpm sanity:backfill --dataset redesign [--apply [--overwrite]]`
 *
 * Turns today's code content into Sanity documents (every slice registered
 * in `slices.ts`) and writes them to `.sanity-backfill/<dataset>.ndjson`
 * (gitignored), with a count per type. Nothing leaves the machine unless
 * `--apply` is given: then it runs `sanity dataset import` with your CLI
 * login (`sanity login`), which uploads the `_sanityAsset` images.
 *
 * - `--apply` imports with `--missing`: it **creates** the documents the
 *   dataset lacks and leaves every existing one as it is, so running it
 *   again never touches what editors changed in the Studio.
 * - `--apply --overwrite` imports with `--replace`: every document with a
 *   backfill `_id` is **replaced by the code content**, discarding the
 *   editors' edits to it. Only for a dataset nobody has edited yet (or to
 *   deliberately reset it); the script warns before it starts.
 *
 * Documents that exist only in the dataset are left alone in both modes.
 * Ids come from explicit keys in the code data (`backfillId`), so a copy
 * edit in code finds the same document instead of adding a second one.
 *
 * `--dataset` is required and never the live dataset (`production` or the
 * configured `NEXT_PUBLIC_SANITY_DATASET`; `backfill-target.ts`): the old
 * site renders what is there. The script reads `.env.local` and `.env` like
 * Next (the Sanity CLI runs from `src/sanity` and would not find them) and
 * prints the project and dataset before it writes anything. See
 * docs/adr/0009-cms-content-source.md for the launch runbook.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parseArgs } from "node:util";
import { assetFileOf, collectSanityAssets } from "@/lib/cms-backfill";
import { backfillTarget } from "./backfill-target";
import { collectBackfill } from "./slices";

const root = join(import.meta.dirname, "..", "..");

// Like Next: the shell's values win, then .env.local, then .env. The
// import below inherits them, so the Sanity CLI sees the same project.
for (const file of [".env.local", ".env"]) {
  const path = join(root, file);
  if (existsSync(path)) process.loadEnvFile(path);
}

const { values } = parseArgs({
  options: {
    dataset: { type: "string" },
    apply: { type: "boolean", default: false },
    overwrite: { type: "boolean", default: false },
  },
});

const { dataset, projectId } = backfillTarget(values.dataset, process.env);

if (values.overwrite && !values.apply) {
  throw new Error("--overwrite only changes how --apply imports; add --apply.");
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
  `Backfill for project "${projectId ?? "(NEXT_PUBLIC_SANITY_PROJECT_ID unset)"}", dataset "${dataset}": ${relative(root, outFile)}`,
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

if (!projectId) {
  throw new Error(
    "Set NEXT_PUBLIC_SANITY_PROJECT_ID (in .env.local) before importing.",
  );
}
const mode = values.overwrite ? "--replace" : "--missing";
if (values.overwrite) {
  process.stderr.write(
    [
      "",
      "!!! --overwrite: every document above that already exists in",
      `!!! "${dataset}" is REPLACED by the code content. Edits made in the`,
      "!!! Studio to those documents are lost. Starting in 10 s; Ctrl+C unless",
      "!!! nobody has edited this dataset yet or you mean to reset it.",
      "",
    ].join("\n"),
  );
  // A moment to read the warning and abort before anything is replaced.
  await new Promise((resolve) => setTimeout(resolve, 10_000));
} else {
  process.stdout.write(
    "Creating missing documents only (--missing): existing ones, and the edits in them, stay as they are.\n",
  );
}
process.stdout.write(
  `Importing into project "${projectId}", dataset "${dataset}" (${mode})...\n`,
);
const result = spawnSync(
  join(root, "node_modules", ".bin", "sanity"),
  ["dataset", "import", outFile, "--dataset", dataset, mode],
  { cwd: join(root, "src", "sanity"), stdio: "inherit" },
);
process.exit(result.status ?? 1);
