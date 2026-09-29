/**
 * `pnpm sanity:migrate-partners --dataset redesign [--apply]`
 *
 * Moves the old site's partners onto organisations in the new site's
 * dataset: every `partner` document (copied from `production` by the
 * backfill) finds its organisation by key and gives it a partnership
 * (`partnerTier`, `partnerCategory`, `partnerFeatured`) and its id
 * (`legacyPartnerId`, which `/api/getPartners` returns), and the code's
 * highlighted partners get their tiers. The plan is `partner-migration.ts`.
 *
 * - Without `--apply` (the default) it is a dry run: it reads the dataset
 *   over the public API (no token), prints every organisation it would
 *   create or update, and writes the plan to
 *   `.sanity-backfill/<dataset>.partner-migration.json` (gitignored).
 *   Nothing is written to Sanity.
 * - `--apply` then carries out that plan through
 *   `sanity exec apply-partner-migration.ts --with-user-token` (your CLI
 *   login, like the backfill's import): it creates missing organisations
 *   with `createIfNotExists` (uploading the code's logo files) and sets
 *   fields with `setIfMissing`, on the published document and its draft, so
 *   an editor's value is never replaced.
 *
 * `--dataset` is required and never `production` (`backfill-target.ts`):
 * the old site reads its `partner` documents there. Run it after
 * `pnpm sanity:backfill --apply` (which copies the partner documents and
 * creates the code's organisations) and before switching the site to the
 * dataset: until an organisation has a tier, `/api/getPartners` answers from
 * the partner documents and the pages from the code. Running it again is
 * safe: organisations it migrated keep what editors changed. See
 * docs/adr/0009-cms-content-source.md.
 */
import { spawnSync } from "node:child_process";
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
import { collectBackfill } from "./slices";

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
const ORGANIZATIONS = `*[_type == "organization" && ${published}]{_id, key, name, href, logo, partnerTier, partnerCategory, partnerFeatured, legacyPartnerId}`;

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
  codeOrganizations: collectBackfill().filter(
    ({ _type }) => _type === "organization",
  ),
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
const applied = spawnSync(
  join(root, "node_modules", ".bin", "sanity"),
  [
    "exec",
    join(import.meta.dirname, "apply-partner-migration.ts"),
    "--with-user-token",
  ],
  {
    cwd: join(root, "src", "sanity"),
    stdio: "inherit",
    env: {
      ...process.env,
      PARTNER_MIGRATION_PLAN: planFile,
      PARTNER_MIGRATION_DATASET: dataset,
      NEXT_PUBLIC_SANITY_PROJECT_ID: projectId,
    },
  },
);
process.exit(applied.status ?? 1);
