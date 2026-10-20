/** Standalone ledger recovery. Dry runs never upload, patch, or settle the ledger. */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { backfillTarget } from "./backfill-target";
import { sanityExec } from "./sanity-exec";

const root = join(import.meta.dirname, "..", "..");
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
  "pnpm sanity:repair-assets",
);
if (!projectId) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is required");
const ledger = join(root, ".sanity-backfill", `${dataset}.pending-assets.json`);
const entries = existsSync(ledger)
  ? (JSON.parse(readFileSync(ledger, "utf8")) as unknown)
  : [];
if (!Array.isArray(entries)) throw new Error(`${ledger} is not a ledger array`);
process.stdout.write(`${entries.length} pending image record(s): ${ledger}\n`);
if (values.apply) {
  const result = sanityExec(join(import.meta.dirname, "repair-assets.ts"), {
    BACKFILL_STAGE: "after",
    BACKFILL_PENDING_FILE: ledger,
    BACKFILL_DATASET: dataset,
    NEXT_PUBLIC_SANITY_PROJECT_ID: projectId,
  });
  process.exit(result.status ?? 1);
}
process.stdout.write(
  "Dry run: ledger preserved; no upload or mutation. Add --apply to repair.\n",
);
