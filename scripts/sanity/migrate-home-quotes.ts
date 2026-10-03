/**
 * `pnpm sanity:migrate-home-quotes --dataset redesign [--apply]`
 *
 * Moves the homepage's member quote into the list of member quotes the
 * join band's faces pick from (`home-quotes-plan.ts`). Without `--apply`
 * it is a dry run over the published documents (public API, no token).
 * `--apply` runs `migrate-home-quotes-apply.ts` through
 * `sanity exec --with-user-token` (your CLI login), which plans again over
 * the published document and its draft and patches each only at the
 * revision it read. `--dataset` is required and never `production`
 * (`backfill-target.ts`).
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { sanityApiVersion } from "@/lib/sanity-config";
import { backfillTarget } from "./backfill-target";
import { PLAN_QUERY, type PlanInput, planHomeQuotes } from "./home-quotes-plan";
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

const command = "pnpm sanity:migrate-home-quotes";
const { dataset, projectId } = backfillTarget(
  values.dataset,
  process.env,
  command,
);
if (!projectId) {
  throw new Error("Set NEXT_PUBLIC_SANITY_PROJECT_ID (in .env.local).");
}

if (values.apply) {
  process.stdout.write(
    `Migrating project "${projectId}", dataset "${dataset}" (homeCopy and its draft)...\n`,
  );
  const applied = sanityExec(
    join(import.meta.dirname, "migrate-home-quotes-apply.ts"),
    { MIGRATE_DATASET: dataset, NEXT_PUBLIC_SANITY_PROJECT_ID: projectId },
  );
  process.exit(applied.status ?? 1);
}

const url = new URL(
  `https://${projectId}.api.sanity.io/v${sanityApiVersion}/data/query/${dataset}`,
);
url.searchParams.set("query", PLAN_QUERY);
url.searchParams.set("perspective", "published");
const response = await fetch(url);
if (!response.ok) {
  throw new Error(`Reading "${dataset}" failed: ${response.status}`);
}
const { result } = (await response.json()) as { result: PlanInput };

process.stdout.write(
  [
    `Home quotes migration for project "${projectId}", dataset "${dataset}" (published; --apply also plans the draft):`,
    ...planHomeQuotes(result).lines,
    `Dry run: nothing was written. Review the changes, then: ${command} --dataset ${dataset} --apply`,
    "",
  ].join("\n"),
);
