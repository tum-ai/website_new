/**
 * `pnpm sanity:backfill --dataset redesign [--apply [--overwrite]]`
 *
 * The one migration command for the new site's dataset. It writes
 * `.sanity-backfill/<dataset>.ndjson` (gitignored) with a count per type:
 *
 * - today's code content as Sanity documents (every slice registered in
 *   `slices.ts`), with their images as local files;
 * - a copy of the old site's content: every published `event`, `partner`
 *   and `research` document in `production`, read over the public API with
 *   the same `_id`s, their images as CDN URLs, and the events' `hosts` from
 *   the code (`production-copy.ts`).
 *
 * Nothing is written to Sanity unless `--apply` is given: then it runs
 * `sanity dataset import` with your CLI login (`sanity login`), which
 * uploads the `_sanityAsset` images into the target dataset.
 *
 * - `--apply` imports with `--missing`: it **creates** the documents the
 *   dataset lacks and leaves every existing one as it is, so running it
 *   again never touches what editors changed in the Studio. A re-run right
 *   before launch copies only the events, partners and research projects
 *   added to `production` since; edits there to documents already copied
 *   are not copied again (the new dataset is the source of truth).
 * - `--apply --overwrite` imports with `--replace`: every document in the
 *   file is **replaced**, code content and copies alike, discarding the
 *   editors' edits to it. Only for a dataset nobody has edited yet (or to
 *   deliberately reset it); the script warns before it starts.
 *
 * - Around the import, in both modes, the recovery step (`repair-assets.ts`)
 *   attaches the images an import created without a file: the import
 *   creates each document before it uploads its images, so a failed upload
 *   would otherwise stay missing, because `--missing` skips the existing
 *   document. Before the import it records the images of the documents the
 *   import creates in `.sanity-backfill/<dataset>.pending-assets.json`
 *   (gitignored); after it (also when it failed) it attaches only those,
 *   setting only the missing references, so the editors' edits stay and an
 *   image an editor removed stays removed. If recording fails, nothing is
 *   imported.
 *
 * Documents that exist only in the dataset are left alone in both modes.
 * Ids come from explicit keys in the code data (`backfillId`), so a copy
 * edit in code finds the same document instead of adding a second one.
 *
 * `--dataset` is required and never `production` (`backfill-target.ts`):
 * the old site renders what is there, and the backfill only reads it. The
 * script reads `.env.local` and `.env` like Next (the Sanity CLI runs from
 * `src/sanity` and would not find them) and prints the project and dataset
 * before it writes anything. See docs/adr/0009-cms-content-source.md for the
 * launch runbook.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parseArgs } from "node:util";
import { assetFileOf, collectSanityAssets } from "@/lib/cms-backfill";
import { backfillTarget } from "./backfill-target";
import { copyFromProduction, localizeCdnAssets } from "./production-copy";
import { sanityExec } from "./sanity-exec";
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

if (!projectId) {
  throw new Error(
    "Set NEXT_PUBLIC_SANITY_PROJECT_ID (in .env.local): the backfill copies the old site's events, partners and research from that project.",
  );
}

const copy = await copyFromProduction({ projectId });
const outDir = join(root, ".sanity-backfill");
const copiedAssetDir = join(outDir, "assets");
mkdirSync(copiedAssetDir, { recursive: true });
// The copied images are downloaded and checked here, so the import uploads
// local files rather than whatever format the CDN negotiates for it.
const localized = await localizeCdnAssets(copy.documents, {
  dir: copiedAssetDir,
  writeFile: (path, bytes) => writeFileSync(path, bytes),
});
const documents = [...collectBackfill(), ...localized.documents];

const seen = new Set<string>();
const duplicates = documents
  .map(({ _id }) => _id)
  .filter((id) => seen.size === seen.add(id).size);
if (duplicates.length > 0) {
  throw new Error(`Duplicate _id(s): ${[...new Set(duplicates)].join(", ")}`);
}

const assets = collectSanityAssets(documents);
const copiedAssets = assets.filter((asset) =>
  assetFileOf(asset)?.startsWith(copiedAssetDir),
);
const missing = assets.filter((asset) => {
  const file = assetFileOf(asset);
  return !file || !existsSync(file);
});
if (missing.length > 0) {
  throw new Error(`Missing asset file(s):\n${missing.join("\n")}`);
}

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
  `Backfill for project "${projectId}", dataset "${dataset}": ${relative(root, outFile)}`,
  ...[...counts].map(([type, count]) => `  ${type.padEnd(width)}  ${count}`),
  `  ${"assets".padEnd(width)}  ${assets.length} file(s) to upload: ${assets.length - copiedAssets.length} from public/, ${copiedAssets.length} copied from production`,
  `  ${"total".padEnd(width)}  ${documents.length} document(s): ${documents.length - copy.documents.length} from code, ${copy.documents.length} copied from production`,
  `  Event co-hosts: added to ${copy.hostsAdded} event(s)${copy.hostsKept ? `, kept on ${copy.hostsKept} that have their own` : ""}.`,
];
process.stdout.write(`${lines.join("\n")}\n`);

if (!values.apply) {
  process.stdout.write(
    `Dry run: nothing was written to Sanity. Review the file, then add --apply.\n`,
  );
  process.exit(0);
}

const mode = values.overwrite ? "--replace" : "--missing";
if (values.overwrite) {
  process.stderr.write(
    [
      "",
      "!!! --overwrite: every document above that already exists in",
      `!!! "${dataset}" is REPLACED by the code content or by the copy from`,
      "!!! production. Edits made in the Studio to those documents are lost.",
      "!!! Starting in 10 s; Ctrl+C unless nobody has edited this dataset yet",
      "!!! or you mean to reset it.",
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
const sanityCli = join(root, "node_modules", ".bin", "sanity");
const cliDir = join(root, "src", "sanity");
const pendingFile = join(outDir, `${dataset}.pending-assets.json`);
const repairAssets = (stage: "before" | "after") =>
  sanityExec(join(import.meta.dirname, "repair-assets.ts"), {
    BACKFILL_STAGE: stage,
    BACKFILL_FILE: outFile,
    BACKFILL_PENDING_FILE: pendingFile,
    BACKFILL_OVERWRITE: values.overwrite ? "1" : "",
    BACKFILL_DATASET: dataset,
    NEXT_PUBLIC_SANITY_PROJECT_ID: projectId,
  });
process.stdout.write("Recording the images the import uploads...\n");
const recorded = repairAssets("before");
if (recorded.status !== 0) {
  process.stderr.write(
    `Could not record the images the import uploads (${relative(root, pendingFile)}); nothing was imported.\n`,
  );
  process.exit(recorded.status || 1);
}
process.stdout.write(
  `Importing into project "${projectId}", dataset "${dataset}" (${mode})...\n`,
);
const imported = spawnSync(
  sanityCli,
  ["dataset", "import", outFile, "--dataset", dataset, mode],
  { cwd: cliDir, stdio: "inherit" },
);
process.stdout.write("Checking that every imported image has its file...\n");
const repaired = repairAssets("after");
process.exit((imported.status ?? 1) || (repaired.status ?? 1));
