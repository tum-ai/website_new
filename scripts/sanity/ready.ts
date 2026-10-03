/** Non-mock published CMS readiness; never writes CMS documents or assets. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { checkReadiness, type ReadinessCheck } from "./readiness";

const root = join(import.meta.dirname, "..", "..");
for (const file of [".env.local", ".env"]) {
  const path = join(root, file);
  if (existsSync(path)) process.loadEnvFile(path);
}
const { values } = parseArgs({
  options: { dataset: { type: "string" }, plan: { type: "string" } },
});
process.env.NEXT_PUBLIC_SANITY_DATASET = values.dataset;
const { backfillTarget } = await import("./backfill-target");
const { dataset, projectId } = backfillTarget(
  values.dataset,
  process.env,
  "pnpm sanity:ready",
);
if (!projectId) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is required");
// Set before importing readers: config is constructed on module evaluation.
process.env.NEXT_PUBLIC_SANITY_DATASET = dataset;
process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = projectId;
delete process.env.USE_MOCK_CMS;
delete process.env.MOCK_CMS_NOW;
const { contentClient } = await import("../../src/lib/cms-content");
contentClient.config({ useCdn: false });
let draftPreflight: "verified" | "unknown" = "unknown";
let homeQuotesProjection:
  | { conversions: number; blocked: string[] }
  | undefined;
if (values.plan) {
  const { applyPlanToDocuments } = await import(
    "./single-source-migration-readiness"
  );
  const { validateSingleSourcePlan } = await import(
    "./single-source-migration-apply"
  );
  const plan = JSON.parse(
    readFileSync(values.plan, "utf8"),
  ) as import("./single-source-migration").SingleSourcePlan;
  validateSingleSourcePlan(plan, { projectId, dataset });
  draftPreflight = plan.draftVisibility;
  const publishedDocuments = await contentClient.fetch<
    import("./single-source-migration").MigrationDocument[]
  >('*[!(_id in path("drafts.**")) && !(_id in path("versions.**"))]');
  let projectedDocuments = applyPlanToDocuments(plan, publishedDocuments);
  const { homeQuotesInput, planHomeQuotes, projectHomeQuotes } = await import(
    "./home-quotes-plan"
  );
  const quotePlan = planHomeQuotes(homeQuotesInput(projectedDocuments), {
    projectId,
    dataset,
  });
  homeQuotesProjection = {
    conversions: quotePlan.patches.length,
    blocked: quotePlan.blocked,
  };
  if (!quotePlan.blocked.length)
    projectedDocuments = projectHomeQuotes(quotePlan, projectedDocuments);
  const { evaluate, parse } = await import("groq-js");
  // Audit-process override only: the normal production reader and parsers stay unchanged.
  contentClient.fetch = (async (
    query: string,
    params: Record<string, unknown> = {},
  ) => {
    const result = await evaluate(parse(query, { params }), {
      dataset: projectedDocuments,
      params,
    });
    return result.get();
  }) as typeof contentClient.fetch;
}
process.stdout.write(
  `Read-only validation: ${projectId}/${dataset}, ${values.plan ? "proposed migration projection (simulated planned assets)" : "live published CMS"}.\n`,
);
const checks: ReadinessCheck[] = [];
const register = async (module: string, names: readonly string[]) => {
  const getters = (await import(module)) as Record<
    string,
    () => Promise<unknown>
  >;
  for (const name of names) {
    if (typeof getters[name] !== "function")
      throw new Error(`Readiness getter ${name} missing in ${module}`);
    checks.push({ label: name, read: getters[name] });
  }
};
await register("../../src/config/site-settings-content.ts", ["getSiteFacts"]);
await register("../../src/config/schedule-content.ts", [
  "getMembershipWindow",
  "getELabWindow",
  "getCampaigns",
]);
await register("../../src/features/home/content.ts", ["getHomeContent"]);
await register("../../src/features/apply/content.ts", [
  "getApplyContent",
  "getApplyFaqs",
]);
await register("../../src/features/community/content.ts", [
  "getCommunityContent",
]);
await register("../../src/features/community/people-content.ts", [
  "getMemberStories",
]);
await register("../../src/features/qanda/content.ts", ["getQandaContent"]);
await register("../../src/features/partners/content.ts", [
  "getPartnersCopy",
  "getPartnerProfiles",
  "getPartnerCaseStudies",
]);
await register("../../src/features/partners/organization-content.ts", [
  "getPartnerLogos",
  "getPartners",
]);
await register("../../src/features/e-lab/content.ts", [
  "getELabCopy",
  "getELabFaqs",
]);
await register("../../src/features/e-lab/venture-content.ts", [
  "getNotableStartups",
  "getTestimonialCards",
  "getTracedVenture",
  "getELabVoices",
]);
await register("../../src/features/projects/content.ts", [
  "getProjectsContent",
]);
await register("../../src/features/research/content.ts", [
  "getResearchCopy",
  "getLabSiteList",
]);
await register("../../src/features/research/rex-content.ts", [
  "getRexInstitutions",
]);
await register("../../src/features/hackathons/content.ts", [
  "getHackathonsCopy",
]);
await register("../../src/features/events/content.ts", ["getEventsCopy"]);
const { getLogoLists } = await import("../../src/lib/organization-content");
checks.push({
  label: "hackathon league partner logos",
  read: () =>
    getLogoLists({
      surfaces: ["ehl-partners"],
      label: "hackathon league partners",
    }),
});
const results = await checkReadiness(checks);
const report = {
  projectId,
  dataset,
  perspective: "published",
  mock: false,
  validation: values.plan ? "proposed-migration-projection" : "live-published",
  plannedImages: Boolean(values.plan),
  uploadReadinessVerified: false,
  draftPreflight,
  homeQuotesProjection,
  checkedAt: new Date().toISOString(),
  ready: results.every(({ ready }) => ready),
  results,
};
const dir = join(root, ".sanity-backfill");
mkdirSync(dir, { recursive: true });
const reportFile = join(
  dir,
  `${dataset}.${values.plan ? "projected-readiness" : "readiness"}.json`,
);
writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`);
for (const result of results)
  process.stdout.write(
    `${result.ready ? "READY" : "BLOCKED"} ${result.label}${result.detail ? `: ${result.detail}` : ""}\n`,
  );
process.stdout.write(
  `Report: ${reportFile}\n${report.ready ? "All registered runtime parsers passed." : "Blocked content must be completed in Studio or the reviewed focused migration."} Nothing was written to Sanity.\n`,
);
if (values.plan)
  process.stdout.write(
    "Projected validation uses simulated planned image assets. It does not verify uploads, CDN delivery, or live CMS readiness.\n",
  );
if (homeQuotesProjection)
  process.stdout.write(
    "Additional CMS-only home quote projection: " +
      homeQuotesProjection.conversions +
      " conversion(s)" +
      (homeQuotesProjection.blocked.length
        ? `; blocked: ${homeQuotesProjection.blocked.join("; ")}`
        : "") +
      ". Any proposed conversion requires the separate reviewed home quote migration.\n",
  );
if (!report.ready) process.exitCode = 1;

process.stdout.write(
  `Draft preflight: ${draftPreflight === "verified" ? "authenticated raw read recorded in the migration plan" : "UNKNOWN; public published reads cannot inspect drafts"}.\n`,
);
