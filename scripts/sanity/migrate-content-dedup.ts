/**
 * `pnpm sanity:migrate-content-dedup --dataset redesign [--apply]`
 *
 * Brings the page content already in a dataset in line with the content
 * model after the dedup changes (#287); the plan is `content-dedup-plan.ts`:
 *
 * - the E-Lab phases' durations become an amount and a unit;
 * - `siteSettings.organization` gets `acceptanceRate` and
 *   `linkedinAudience`, and the /partners copy uses their placeholders
 *   instead of the typed figures;
 * - the Q&A member-journey entry loses the points the page now derives
 *   from the journey;
 * - a campaign's `featuredEventId` string becomes the weak `featuredEvent`
 *   reference.
 *
 * A field changes only while it still holds the value the backfill wrote,
 * so the editors' edits stay; the rest is listed as left alone.
 *
 * Without `--apply` it is a dry run: it reads the published documents over
 * the public API (no token) and prints each planned change as before and
 * after. `--apply` runs `migrate-content-dedup-apply.ts` through
 * `sanity exec --with-user-token` (your CLI login), which plans again over
 * the published documents and their drafts and patches each one only at the
 * revision it read. `--dataset` is required and never `production`
 * (`backfill-target.ts`).
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { sanityApiVersion } from "@/lib/sanity-config";
import { backfillTarget } from "./backfill-target";
import {
  formatPlan,
  PLAN_QUERY,
  planContentDedup,
  type StoredDocument,
  singletonIds,
} from "./content-dedup-plan";

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

const command = "pnpm sanity:migrate-content-dedup";
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
    `Migrating project "${projectId}", dataset "${dataset}" (published documents and drafts)...\n`,
  );
  const applied = spawnSync(
    join(root, "node_modules", ".bin", "sanity"),
    [
      "exec",
      join(import.meta.dirname, "migrate-content-dedup-apply.ts"),
      "--with-user-token",
    ],
    {
      cwd: join(root, "src", "sanity"),
      stdio: "inherit",
      env: {
        ...process.env,
        MIGRATE_DATASET: dataset,
        NEXT_PUBLIC_SANITY_PROJECT_ID: projectId,
      },
    },
  );
  process.exit(applied.status ?? 1);
}

const url = new URL(
  `https://${projectId}.api.sanity.io/v${sanityApiVersion}/data/query/${dataset}`,
);
url.searchParams.set("query", PLAN_QUERY);
url.searchParams.set("$ids", JSON.stringify(singletonIds));
url.searchParams.set("perspective", "published");
const response = await fetch(url);
if (!response.ok) {
  throw new Error(`Reading "${dataset}" failed: ${response.status}`);
}
const { result } = (await response.json()) as { result: StoredDocument[] };

process.stdout.write(
  [
    `Content dedup migration for project "${projectId}", dataset "${dataset}" (published documents; --apply also plans their drafts):`,
    formatPlan(planContentDedup(result)),
    `Dry run: nothing was written. Review the changes, then: ${command} --dataset ${dataset} --apply`,
    "",
  ].join("\n"),
);
