import { createHash } from "node:crypto";
import {
  type MigrationDocument,
  migrationCompleted,
  readMigrationCompletion,
  type SingleSourcePlan,
} from "./single-source-migration";
import { validateSingleSourcePlan } from "./single-source-migration-apply";

// Dimensions measured from the retained migration files, not uploaded CDN assets.
const dimensions: Record<string, readonly [number, number]> = {
  "/assets/partners/hero.webp": [1304, 864],
  "/assets/events/hosts/atira.svg": [44, 18],
  "/assets/events/hackathons/ehl-2026-grand-finale-poster.webp": [800, 800],
  "/assets/events/hackathons/makeathon-2023-group.webp": [1080, 1080],
};

/** A simulated asset for query/parser readiness only; never upload or write it. */
function plannedImageAsset(
  path: string,
  plan: SingleSourcePlan,
): MigrationDocument {
  const size = dimensions[path];
  if (!size) throw new Error(`Unknown planned migration image ${path}`);
  const [width, height] = size;
  const format = path.split(".").at(-1) as string;
  const hash = createHash("sha1")
    .update(`readiness-only:${path}`)
    .digest("hex");
  const filename = `${hash}-${width}x${height}.${format}`;
  return {
    _id: `image-${hash}-${width}x${height}-${format}`,
    _type: "sanity.imageAsset",
    _rev: "readiness-only",
    url: `https://cdn.sanity.io/images/${plan.projectId}/${plan.dataset}/${filename}`,
    metadata: { dimensions: { width, height, aspectRatio: width / height } },
    source: { name: "single-source-readiness-only" },
  };
}

/**
 * Preview proposed patches in memory, retaining actual editor values and revisions.
 * Local images become simulated asset references solely so real GROQ projections and
 * content parsers can be checked. This does not establish upload/CDN readiness.
 * A caller can resolve planned images to independently supplied asset documents.
 */
export function applyPlanToDocuments(
  plan: SingleSourcePlan,
  documents: readonly MigrationDocument[],
  options: { resolveImage?: (path: string) => MigrationDocument } = {},
): MigrationDocument[] {
  validateSingleSourcePlan(plan, plan);
  const completion = readMigrationCompletion(documents, plan);
  const copied = structuredClone([...documents]);
  const byId = new Map(copied.map((doc) => [doc._id, doc]));
  const resolve = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(resolve);
    if (!value || typeof value !== "object") return value;
    const { _localAsset, ...rest } = value as Record<string, unknown>;
    const resolved = Object.fromEntries(
      Object.entries(rest).map(([key, field]) => [key, resolve(field)]),
    );
    if (_localAsset === undefined) return resolved;
    if (typeof _localAsset !== "string")
      throw new Error("Invalid planned image path");
    const asset =
      options.resolveImage?.(_localAsset) ??
      plannedImageAsset(_localAsset, plan);
    if (asset._type !== "sanity.imageAsset")
      throw new Error(
        "Readiness image resolver must return an image asset document",
      );
    if (!byId.has(asset._id)) {
      const copy = structuredClone(asset);
      copied.push(copy);
      byId.set(copy._id, copy);
    }
    return { ...resolved, asset: { _type: "reference", _ref: asset._id } };
  };
  for (const step of plan.steps) {
    const id = step.action === "create" ? step.document._id : step.id;
    if (migrationCompleted(completion, id)) continue;
    if (step.action === "create") {
      if (byId.has(step.document._id)) continue;
      const doc = resolve(step.document) as MigrationDocument;
      copied.push(doc);
      byId.set(doc._id, doc);
      continue;
    }
    const doc = byId.get(step.id);
    if (!doc || doc._rev !== step.revision || doc._type !== step.type)
      throw new Error(`Readiness plan has a stale revision for ${step.id}`);
    for (const [path, value] of Object.entries(step.fields)) {
      if (migrationCompleted(completion, id, path)) continue;
      const segments = path.split(".");
      let parent: Record<string, unknown> = doc;
      for (const key of segments.slice(0, -1)) {
        const child = parent[key];
        if (!child || typeof child !== "object" || Array.isArray(child))
          throw new Error(
            `Readiness patch parent ${step.id}.${path} is absent or invalid`,
          );
        parent = child as Record<string, unknown>;
      }
      const field = segments.at(-1) as string;
      if (parent[field] === undefined) parent[field] = resolve(value);
    }
  }
  return copied;
}
