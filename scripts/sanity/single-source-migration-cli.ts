import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { sanityExec } from "./sanity-exec";
import {
  assertSingleSourceTarget,
  type MigrationDocument,
  planSingleSourceMigration,
  singleSourceCompletionId,
} from "./single-source-migration";

/** Public reads cannot inspect drafts; an available read token enables raw draft preflight. */
export function singleSourcePreflightRequest(
  target: { projectId: string; dataset: string },
  token?: string,
) {
  assertSingleSourceTarget(target);
  const url = new URL(
    `https://${target.projectId}.api.sanity.io/v2025-02-19/data/query/${target.dataset}`,
  );

  const draftVisibility = token ? ("verified" as const) : ("unknown" as const);
  url.searchParams.set("perspective", token ? "raw" : "published");
  url.searchParams.set(
    "query",
    `*[(_id == "${singleSourceCompletionId}" || _type in ["organization", "logoList", "person", "caseStudy", "event", "siteSettings", "partnersCopy", "eLabCopy", "hackathonsCopy"]) ${token ? "" : '&& !(_id in path("drafts.**"))'} && !(_id in path("versions.**"))]`,
  );
  return {
    url,
    draftVisibility,
    init: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  };
}

/** Reads published prerequisites and, when authenticated, drafts; never uploads or mutates. */
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
  const target = {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() ?? "",
    dataset: values.dataset ?? "",
  };
  assertSingleSourceTarget(target);
  const { url, draftVisibility, init } = singleSourcePreflightRequest(
    target,
    process.env.SANITY_API_READ_TOKEN?.trim(),
  );
  const response = await fetch(url, init);
  if (!response.ok)
    throw new Error(
      `Migration prerequisite read failed: HTTP ${response.status}`,
    );
  const { result } = (await response.json()) as { result?: unknown };
  if (!Array.isArray(result))
    throw new Error("Migration prerequisite read returned no document list");
  const plan = planSingleSourceMigration(
    result as MigrationDocument[],
    target,
    { draftVisibility },
  );
  const directory = join(root, ".sanity-backfill");
  mkdirSync(directory, { recursive: true });
  const planFile = join(
    directory,
    `${target.dataset}.single-source-migration.json`,
  );
  const ledgerFile = join(
    directory,
    `${target.dataset}.single-source-assets.json`,
  );
  writeFileSync(planFile, `${JSON.stringify(plan, null, 2)}\n`);
  process.stdout.write(
    `Single-source migration for ${target.projectId}/${target.dataset}:\n`,
  );
  process.stdout.write(
    `Draft readiness: ${draftVisibility === "verified" ? "verified authenticated raw read" : "UNKNOWN (public published read cannot inspect drafts)"}.\n`,
  );
  for (const step of plan.steps) {
    process.stdout.write(
      step.action === "create"
        ? `  create missing ${step.document._id}\n`
        : `  fill ${step.id} (revision ${step.revision}): ${Object.keys(step.fields).join(", ")}\n`,
    );
  }
  process.stdout.write(`Plan: ${relative(root, planFile)}\n`);
  if (plan.blocked.length) {
    process.stderr.write(
      `Blocked prerequisites:\n${plan.blocked.map((reason) => `  ${reason}`).join("\n")}\n`,
    );
    process.exitCode = 1;
    return;
  }
  if (!values.apply) {
    process.stdout.write(
      "Dry run: no CMS writes or uploads. Review the plan before the maintainer launch step --apply.\n",
    );
    return;
  }
  const applied = sanityExec(
    join(import.meta.dirname, "single-source-migration-apply.ts"),
    {
      SINGLE_SOURCE_PLAN: planFile,
      SINGLE_SOURCE_DATASET: target.dataset,
      SINGLE_SOURCE_UPLOAD_LEDGER: ledgerFile,
      SINGLE_SOURCE_APPLY: "1",
      NEXT_PUBLIC_SANITY_PROJECT_ID: target.projectId,
    },
  );
  process.exitCode = applied.status ?? 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await main();
