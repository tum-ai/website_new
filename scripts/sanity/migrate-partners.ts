import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parseArgs } from "node:util";
import { getPartnerKey } from "@/features/partners";
import { organizationId } from "@/lib/organization-content";
import { backfillTarget } from "./backfill-target";
import {
  type DatasetOrganization,
  type DatasetPartner,
  describePlan,
  planPartnerMigration,
} from "./partner-migration";
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
  "pnpm sanity:migrate-partners",
);
if (!projectId) {
  throw new Error(
    "Set NEXT_PUBLIC_SANITY_PROJECT_ID (in .env.local): the migration reads the dataset of that project.",
  );
}

const published = `!(_id in path("drafts.**")) && !(_id in path("versions.**"))`;
const PARTNERS = `*[_type == "partner" && ${published}]{_id, name, link, category, tier, featured, image}`;
const ORGANIZATIONS = `*[_type == "organization" && ${published}]{_id, key, name, shortName, href, logo, partnerTier, partnerCategory, partnerFeatured, legacyPartnerId}`;

/** Reads published documents over the public API (not the CDN); throws on failure. */
async function query<T>(groq: string): Promise<T[]> {
  const url = new URL(
    `https://${projectId}.api.sanity.io/v2025-02-19/data/query/${dataset}`,
  );
  url.searchParams.set("query", groq);
  url.searchParams.set("perspective", "published");
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Could not read "${dataset}" of project "${projectId}": HTTP ${response.status} ${await response.text()}`,
    );
  }
  const { result } = (await response.json()) as { result?: unknown };
  if (!Array.isArray(result)) {
    throw new Error(`Unexpected response from "${dataset}": no result list`);
  }
  return result as T[];
}

const [partners, organizations] = await Promise.all([
  query<DatasetPartner>(PARTNERS),
  query<DatasetOrganization>(ORGANIZATIONS),
]);
const plan = planPartnerMigration({
  partners,
  organizations,
  companyKey: getPartnerKey,
  organizationId,
});

const outDir = join(root, ".sanity-backfill");
mkdirSync(outDir, { recursive: true });
const planFile = join(outDir, `${dataset}.partner-migration.json`);
writeFileSync(planFile, `${JSON.stringify(plan, null, 2)}\n`);

process.stdout.write(
  [
    `Partner migration for project "${projectId}", dataset "${dataset}": ${partners.length} partner document(s), ${organizations.length} organisation(s).`,
    describePlan(plan),
    `Plan: ${relative(root, planFile)}`,
    "",
  ].join("\n"),
);

if (!values.apply) {
  process.stdout.write(
    "Dry run: nothing was written to Sanity. Review the plan, then add --apply.\n",
  );
  process.exit(0);
}

if (plan.steps.length === 0) {
  process.stdout.write("Nothing to do.\n");
  process.exit(0);
}

process.stdout.write(
  `Applying ${plan.steps.length} step(s) to project "${projectId}", dataset "${dataset}"...\n`,
);
const applied = sanityExec(
  join(import.meta.dirname, "apply-partner-migration.ts"),
  {
    PARTNER_MIGRATION_PLAN: planFile,
    PARTNER_MIGRATION_DATASET: dataset,
    NEXT_PUBLIC_SANITY_PROJECT_ID: projectId,
  },
);
process.exit(applied.status ?? 1);
