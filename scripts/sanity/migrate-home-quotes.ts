/** Published CMS-only quote conversion; default dry run, never a local copy seed. */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import {
  homeQuotesPreflightRequest,
  type PlanInput,
  planHomeQuotes,
} from "./home-quotes-plan";
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
  const target = {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() ?? "",
    dataset: values.dataset ?? "",
  };
  const { url, init, draftVisibility } = homeQuotesPreflightRequest(
    target,
    process.env.SANITY_API_READ_TOKEN?.trim(),
  );
  const response = await fetch(url, init);
  if (!response.ok)
    throw new Error(
      `Reading home quote prerequisites failed: HTTP ${response.status}`,
    );
  const { result } = (await response.json()) as { result: PlanInput };
  const plan = planHomeQuotes(result, target, { draftVisibility });
  const directory = join(root, ".sanity-backfill");
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    join(directory, `${target.dataset}.home-quotes-migration.json`),
    `${JSON.stringify(plan, null, 2)}\n`,
  );
  process.stdout.write(
    "Home quotes migration for " +
      target.projectId +
      "/" +
      target.dataset +
      "\n" +
      "Draft visibility: " +
      (draftVisibility === "verified"
        ? "verified authenticated raw read"
        : "UNKNOWN; public published reads cannot inspect drafts") +
      "\n" +
      plan.lines.join("\n") +
      "\n",
  );
  if (plan.blocked.length) {
    process.stderr.write(
      `Blocked prerequisites:\n${plan.blocked.join("\n")}\n`,
    );
    process.exitCode = 1;
    return;
  }
  if (!values.apply) {
    process.stdout.write(
      "Dry run: " +
        plan.patches.length +
        " quote conversion(s); no CMS writes or uploads.\n",
    );
    return;
  }
  const applied = sanityExec(
    join(import.meta.dirname, "migrate-home-quotes-apply.ts"),
    {
      MIGRATE_DATASET: target.dataset,
      HOME_QUOTES_APPLY: "1",
      NEXT_PUBLIC_SANITY_PROJECT_ID: target.projectId,
    },
  );
  process.exitCode = applied.status ?? 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await main();
