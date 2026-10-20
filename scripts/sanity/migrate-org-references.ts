/** CMS-only organization-reference migration, dry-run by default. */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { sanityApiVersion } from "@/lib/sanity-config";
import { backfillTarget } from "./backfill-target";
import {
  eventHostsListId,
  formatPlan,
  PLAN_QUERY,
  type PlanDataset,
  planOrgReferences,
} from "./org-references-plan";
import { sanityExec } from "./sanity-exec";

async function main() {
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

  const command = "pnpm sanity:migrate-org-references";
  const { dataset, projectId } = backfillTarget(
    values.dataset,
    process.env,
    command,
  );
  if (!projectId) {
    throw new Error("Set NEXT_PUBLIC_SANITY_PROJECT_ID (in .env.local).");
  }

  if (values.apply) {
    const applied = sanityExec(
      join(import.meta.dirname, "migrate-org-references-apply.ts"),
      {
        MIGRATE_DATASET: dataset,
        NEXT_PUBLIC_SANITY_PROJECT_ID: projectId,
      },
    );
    process.exit(applied.status ?? 1);
  }

  const url = new URL(
    `https://${projectId}.api.sanity.io/v${sanityApiVersion}/data/query/${dataset}`,
  );
  url.searchParams.set("query", PLAN_QUERY);
  url.searchParams.set("$listIds", JSON.stringify([eventHostsListId]));
  url.searchParams.set("perspective", "published");
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Reading "${dataset}" failed: ${response.status}`);
  }
  const { result } = (await response.json()) as { result: PlanDataset };

  process.stdout.write(
    [
      `Organisation references for project "${projectId}", dataset "${dataset}" (published documents; --apply also plans their drafts): ${result.documents.length} document(s), ${result.organizations.length} organisation(s).`,
      formatPlan(planOrgReferences(result)),
      `Dry run: nothing was written. Review the changes, then: ${command} --dataset ${dataset} --apply`,
      "",
    ].join("\n"),
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
