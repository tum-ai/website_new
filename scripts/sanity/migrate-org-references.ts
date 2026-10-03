/**
 * `pnpm sanity:migrate-org-references --dataset redesign [--apply]`
 *
 * Gives the documents already in a dataset the references to organisations
 * that replace the names they held (the plan is `org-references-plan.ts`):
 * research institutions from the titles, event co-hosts from `hosts`, lab
 * sites' organisations from their alias strings, people's organisations
 * and positions from their roles, the task force's partner from its name;
 * and deletes the `event-hosts` logo list, which the site no longer reads.
 * Names without an organisation are listed, never invented; only the
 * logo-less institutions this change added to the code
 * ({@link introducedOrganizationKeys}) are created.
 *
 * Without `--apply` it is a dry run: it reads the published documents over
 * the public API (no token) and prints each planned change as before and
 * after. `--apply` runs `migrate-org-references-apply.ts` through
 * `sanity exec --with-user-token` (your CLI login), which plans again over
 * the published documents and their drafts and patches each one only at
 * the revision it read. `--dataset` is required and never `production`
 * (`backfill-target.ts`), where the old site reads the names. Run it after
 * `pnpm sanity:migrate-partners --apply` (the references point at partner
 * organisations) and again after a backfill re-run copies new events or
 * research; it only fills empty fields.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { sanityApiVersion } from "@/lib/sanity-config";
import { backfillTarget } from "./backfill-target";
import {
  eventHostsListId,
  formatPlan,
  PLAN_QUERY,
  type PlanDataset,
  type PlanInput,
  planOrgReferences,
} from "./org-references-plan";
import { sanityExec } from "./sanity-exec";
import { collectBackfill } from "./slices";

/**
 * The organisations this change added to the code for institutions the
 * site named without one: the migration creates them where a reference
 * needs them. They have no logo, so creating them uploads nothing.
 */
const introducedOrganizationKeys = [
  "tum",
  "tum-camp",
  "lmu-klinikum",
  "ibm-almaden",
  "ibm-research",
] as const;

/** The plan's code input, from the backfill's organisation documents. */
export function planInput(): PlanInput {
  const organizations = collectBackfill().filter(
    ({ _type }) => _type === "organization",
  );
  const newOrganizations = introducedOrganizationKeys.map((key) => {
    const document = organizations.find((candidate) => candidate.key === key);
    if (!document) throw new Error(`No code organisation "${key}"`);
    if (document.logo || document.logoOnDark) {
      throw new Error(`"${key}" has artwork; the migration uploads none`);
    }
    return document;
  });
  return {
    codeOrganizations: organizations.map(({ key, name, shortName }) => ({
      key: String(key),
      name: String(name),
      ...(typeof shortName === "string" ? { shortName } : {}),
    })),
    newOrganizations,
  };
}

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
  const input = planInput();

  if (values.apply) {
    const outDir = join(root, ".sanity-backfill");
    mkdirSync(outDir, { recursive: true });
    const inputFile = join(outDir, `${dataset}.org-references-input.json`);
    writeFileSync(inputFile, `${JSON.stringify(input, null, 2)}\n`);
    process.stdout.write(
      `Migrating project "${projectId}", dataset "${dataset}" (published documents and drafts; input ${relative(root, inputFile)})...\n`,
    );
    const applied = sanityExec(
      join(import.meta.dirname, "migrate-org-references-apply.ts"),
      {
        MIGRATE_DATASET: dataset,
        ORG_REFERENCES_INPUT: inputFile,
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
      formatPlan(planOrgReferences(input, result)),
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
