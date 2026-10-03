/** Create-only copy of missing live production documents; dry-run by default. */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parseArgs } from "node:util";
import { assetFileOf, collectSanityAssets } from "./asset-ledger";
import { backfillTarget } from "./backfill-target";
import { copyFromProduction, localizeCdnAssets } from "./production-copy";
import { sanityExec } from "./sanity-exec";

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
  },
});

const { dataset, projectId } = backfillTarget(
  values.dataset,
  process.env,
  "pnpm sanity:copy-production",
);

if (!projectId) {
  throw new Error(
    "Set NEXT_PUBLIC_SANITY_PROJECT_ID (in .env.local): the backfill copies the old site's events, partners and research from that project.",
  );
}

const copy = await copyFromProduction({ projectId });
// Only missing source IDs are planned; existing target content is the editorial owner.
const targetUrl = new URL(
  `https://${projectId}.api.sanity.io/v2025-02-19/data/query/${dataset}`,
);
targetUrl.searchParams.set("query", "*[_id in $ids]._id");
targetUrl.searchParams.set(
  "$ids",
  JSON.stringify(copy.documents.map(({ _id }) => _id)),
);
targetUrl.searchParams.set("perspective", "published");
const targetResponse = await fetch(targetUrl);
if (!targetResponse.ok)
  throw new Error(`Reading target IDs failed: HTTP ${targetResponse.status}`);
const targetBody = (await targetResponse.json()) as { result?: unknown };
if (
  !Array.isArray(targetBody.result) ||
  !targetBody.result.every((id) => typeof id === "string")
)
  throw new Error("Target ID query returned an invalid result");
const existing = new Set(targetBody.result);
const missingDocuments = copy.documents.filter(({ _id }) => !existing.has(_id));
const outDir = join(root, ".sanity-backfill");
const copiedAssetDir = join(outDir, "assets");
mkdirSync(copiedAssetDir, { recursive: true });
// The copied images are downloaded and checked here, so the import uploads
// local files rather than whatever format the CDN negotiates for it.
const localized = await localizeCdnAssets(missingDocuments, {
  dir: copiedAssetDir,
  writeFile: (path, bytes) => writeFileSync(path, bytes),
});
const documents = localized.documents;

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

const outFile = join(outDir, `${dataset}.production-copy.ndjson`);
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
  `Production copy for project "${projectId}", dataset "${dataset}": ${relative(root, outFile)}`,
  ...[...counts].map(([type, count]) => `  ${type.padEnd(width)}  ${count}`),
  `  ${"assets".padEnd(width)}  ${assets.length} file(s) to upload: ${assets.length - copiedAssets.length} from public/, ${copiedAssets.length} copied from production`,
  `  ${"total".padEnd(width)}  ${documents.length} missing source document(s); ${existing.size} existing target document(s) skipped`,
];
process.stdout.write(`${lines.join("\n")}\n`);

if (!values.apply) {
  process.stdout.write(
    `Dry run: nothing was written to Sanity. Review the file, then add --apply.\n`,
  );
  process.exit(0);
}

if (documents.length === 0) {
  process.stdout.write("No missing source documents.\n");
  process.exit(0);
}
const mode = "--missing";
const sanityCli = join(root, "node_modules", ".bin", "sanity");
const cliDir = join(root, "src", "sanity");
const pendingFile = join(outDir, `${dataset}.pending-assets.json`);
const repairAssets = (stage: "before" | "after") =>
  sanityExec(join(import.meta.dirname, "repair-assets.ts"), {
    BACKFILL_STAGE: stage,
    BACKFILL_FILE: outFile,
    BACKFILL_PENDING_FILE: pendingFile,
    BACKFILL_OVERWRITE: "",
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
