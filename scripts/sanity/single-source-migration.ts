import { createHash } from "node:crypto";
import hackathonsCopy from "./single-source-migration-data.json";

/** Historical inputs for the CMS cutover, never imported by application code. */
export type MigrationDocument = Record<string, unknown> & {
  _id: string;
  _type: string;
  _rev?: string;
};
export type MigrationTarget = { projectId: string; dataset: string };
export type SingleSourceStep =
  | { action: "create"; document: MigrationDocument }
  | {
      action: "fill";
      id: string;
      type: string;
      revision: string;
      fields: Record<string, unknown>;
    };
export type SingleSourcePlan = MigrationTarget & {
  migration: "single-source-2026-10";
  draftVisibility: "verified" | "unknown";
  steps: SingleSourceStep[];
  blocked: string[];
};

/** Durable receipts survive later Studio field unsets and document deletions. */
export const singleSourceCompletionId = "migration-single-source-2026-10";
export type MigrationCompletion = MigrationDocument &
  MigrationTarget & {
    migration: "single-source-2026-10";
    complete?: true;
    entries: Record<
      string,
      { id: string; created?: true; fields?: Record<string, true> }
    >;
  };
const completionKey = (id: string) =>
  `doc_${createHash("sha256").update(id).digest("hex")}`;
const fieldKey = (path: string) => path.replaceAll(".", "_");

/** Read and validate the isolated CMS receipt document, or an uncommitted initial value. */
export function readMigrationCompletion(
  documents: readonly MigrationDocument[],
  target: MigrationTarget,
): MigrationCompletion {
  const doc = documents.find((doc) => doc._id === singleSourceCompletionId);
  if (!doc)
    return {
      _id: singleSourceCompletionId,
      _type: "migrationCompletion",
      ...target,
      migration: "single-source-2026-10",
      entries: {},
    };
  if (
    (doc.complete !== undefined && doc.complete !== true) ||
    doc._type !== "migrationCompletion" ||
    doc.migration !== "single-source-2026-10" ||
    doc.projectId !== target.projectId ||
    doc.dataset !== target.dataset ||
    !doc._rev ||
    !doc.entries ||
    typeof doc.entries !== "object" ||
    Array.isArray(doc.entries)
  )
    throw new Error("Invalid single-source CMS completion ledger");
  for (const entry of Object.values(doc.entries)) {
    if (
      !entry ||
      typeof entry !== "object" ||
      typeof entry.id !== "string" ||
      (entry.created !== undefined && entry.created !== true) ||
      (entry.fields !== undefined &&
        (!entry.fields ||
          typeof entry.fields !== "object" ||
          Array.isArray(entry.fields) ||
          Object.values(entry.fields).some((value) => value !== true)))
    )
      throw new Error("Invalid single-source completion receipt");
  }
  return doc as MigrationCompletion;
}
/** Whether the migration already handed a create or field to editors. */
export function migrationCompleted(
  completion: MigrationCompletion,
  id: string,
  path?: string,
): boolean {
  const entry = completion.entries[completionKey(id)];
  return (
    completion.complete === true ||
    entry?.created === true ||
    (path !== undefined && entry?.fields?.[fieldKey(path)] === true)
  );
}
/** Proposed receipt; commit it atomically with the associated target mutation. */
export function completeMigrationStep(
  completion: MigrationCompletion,
  step: SingleSourceStep,
): MigrationCompletion {
  const next = structuredClone(completion);
  const id = step.action === "create" ? step.document._id : step.id;
  const key = completionKey(id);
  const previous = next.entries[key] ?? { id };
  next.entries[key] =
    step.action === "create"
      ? { ...previous, created: true }
      : {
          ...previous,
          fields: {
            ...previous.fields,
            ...Object.fromEntries(
              Object.keys(step.fields).map((path) => [
                fieldKey(path),
                true as const,
              ]),
            ),
          },
        };
  return next;
}

const reference = (id: string, key?: string) => ({
  _type: "reference",
  _ref: id,
  ...(key ? { _key: key } : {}),
});
const partnerOrder = [
  "openai",
  "google",
  "anthropic",
  "hudson-river-trading",
  "jetbrains",
  "unite",
  "spherecast",
  "dryft",
  "reply",
  "mutagent",
  "nvidia",
  "entire-io",
  "mckinsey-company",
  "jane-street",
  "bmw",
  "aws",
  "amd",
  "ibm",
];
const leaguePartners = [
  "reply",
  "google",
  "amd",
  "openai",
  "entire-io",
  "inria",
  "tacto",
  "bmw",
  "atira",
];
const matches = [
  ["munich-1", "Match 1", "XNCTBM8X9vP2N4tjVzg79c"],
  ["paris", "Match 2", "event-ehl-2026-paris"],
  ["munich-2", "Match 3", "event-ehl-2026-munich"],
  ["zurich", "Match 4", "event-ehl-2026-zurich"],
  ["finale", "Grand Finale", "event-ehl-2026-grand-finale"],
];
const voices = {
  founders: ["viktor-shen", "benedikt-wieser", "leonardo-benini"],
  investors: ["alexandra-reinert", "oliver-schoppe", "axel-taeubert"],
};

/** Requires an explicit non-production dataset at planning and apply boundaries. */
export function assertSingleSourceTarget(target: MigrationTarget): void {
  if (!/^[a-z0-9-]+$/.test(target.projectId))
    throw new Error("Invalid project id");
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(target.dataset)) {
    throw new Error("Name a valid target dataset explicitly");
  }
  if (target.dataset === "production")
    throw new Error("Refusing production dataset");
}

const isPublished = (id: string) =>
  !id.startsWith("drafts.") && !id.startsWith("versions.");
const valueAt = (doc: MigrationDocument, path: string): unknown =>
  path
    .split(".")
    .reduce<unknown>(
      (value, field) =>
        value && typeof value === "object"
          ? (value as Record<string, unknown>)[field]
          : undefined,
      doc,
    );

/**
 * Creates only missing historical gap documents; fills only the newly added fields.
 * Null, empty arrays and empty strings are editor values, never missing values.
 */
export function planSingleSourceMigration(
  documents: readonly MigrationDocument[],
  target: MigrationTarget,
  options: { draftVisibility?: "verified" | "unknown" } = {},
): SingleSourcePlan {
  assertSingleSourceTarget(target);
  const plan: SingleSourcePlan = {
    ...target,
    migration: "single-source-2026-10",
    draftVisibility: options.draftVisibility ?? "unknown",
    steps: [],
    blocked: [],
  };
  const completion = readMigrationCompletion(documents, target);
  if (completion.complete) return plan;
  const needsFill = (id: string, path: string) =>
    !migrationCompleted(completion, id, path) &&
    valueAt(byId.get(id) ?? { _id: id, _type: "" }, path) === undefined;
  const published = documents.filter(({ _id }) => isPublished(_id));
  const byId = new Map(published.map((doc) => [doc._id, doc]));
  const select = (type: string, key: string) => {
    const found = published.filter(
      (doc) => doc._type === type && doc.key === key,
    );
    if (found.length > 1) plan.blocked.push(`Ambiguous ${type} key ${key}`);
    return found.length === 1 ? found[0] : undefined;
  };
  const create = (document: MigrationDocument) => {
    if (migrationCompleted(completion, document._id)) return;
    const existing = byId.get(document._id);
    if (existing && existing._type !== document._type) {
      plan.blocked.push(
        `${document._id} has type ${existing._type}, expected ${document._type}`,
      );
    } else if (!existing) {
      if (documents.some((doc) => doc._id === `drafts.${document._id}`)) {
        plan.blocked.push(
          `${document._id} has an unpublished draft; publish or resolve it in Studio`,
        );
        return;
      }
      plan.steps.push({ action: "create", document });
      byId.set(document._id, document);
    }
  };
  const fill = (id: string, type: string, wanted: Record<string, unknown>) => {
    const doc = byId.get(id);
    if (!doc && migrationCompleted(completion, id)) return;
    if (!doc || doc._type !== type) {
      plan.blocked.push(`Required ${type} ${id} is absent or has another type`);
      return;
    }
    const fields = Object.fromEntries(
      Object.entries(wanted).filter(([path]) => needsFill(id, path)),
    );
    if (!Object.keys(fields).length) return;
    // A document created in this plan gets new fields atomically at creation.
    const pending = plan.steps.find(
      (step) => step.action === "create" && step.document._id === id,
    );
    if (pending?.action === "create") {
      Object.assign(pending.document, fields);
      return;
    }
    if (!doc._rev) {
      plan.blocked.push(`${id} lacks a revision`);
      return;
    }
    for (const path of Object.keys(fields)) {
      const parent = path.split(".").slice(0, -1).join(".");
      if (
        parent &&
        (!valueAt(doc, parent) || typeof valueAt(doc, parent) !== "object")
      ) {
        plan.blocked.push(
          `${id}.${parent} is absent or invalid; resolve it in Studio`,
        );
        return;
      }
    }
    plan.steps.push({ action: "fill", id, type, revision: doc._rev, fields });
  };
  create(structuredClone(hackathonsCopy));
  if (!select("organization", "atira")) {
    create({
      _id: "organization-atira",
      _type: "organization",
      key: "atira",
      name: "Atira",
      href: "https://atira.ai/",
      logoOnDark: {
        _type: "image",
        _localAsset: "/assets/events/hosts/atira.svg",
        alt: "Atira logo",
        aspectRatio: 44 / 18,
      },
    });
  }
  const orgRef = (key: string) => {
    const doc = select("organization", key) ?? byId.get(`organization-${key}`);
    if (!doc) plan.blocked.push(`Missing organization ${key}`);
    return reference(doc?._id ?? `organization-${key}`, key);
  };
  if (
    !migrationCompleted(completion, "logolist-ehl-partners") &&
    !published.some(
      (doc) => doc._type === "logoList" && doc.surface === "ehl-partners",
    )
  ) {
    create({
      _id: "logolist-ehl-partners",
      _type: "logoList",
      surface: "ehl-partners",
      organizations: leaguePartners.map(orgRef),
    });
  }
  if (needsFill("siteSettings", "hackathons")) {
    for (const [, , id] of matches) {
      if (byId.get(id)?._type !== "event")
        plan.blocked.push(`Missing league event ${id}`);
    }
  }
  fill("siteSettings", "siteSettings", {
    "organization.startedApplicationsPerBatch": 2100,
    hackathons: {
      makeathonUrl: "https://makeathon.tum-ai.com",
      league: {
        name: "European Hackathon League",
        url: "https://ehl.tum-ai.com",
        foundedYear: 2026,
        finaleTeams: 15,
        matches: matches.map(([key, label, id], index) => ({
          _type: "leagueMatch",
          _key: key,
          key,
          label,
          event: reference(id),
          ...(index === 0 ? { makeathon: true } : {}),
        })),
      },
    },
  });
  fill("partnersCopy", "partnersCopy", {
    "sections.hero.image": {
      _type: "image",
      _localAsset: "/assets/partners/hero.webp",
      alt: "A speaker presenting to a packed auditorium at a TUM.ai event",
    },
  });
  partnerOrder.forEach((key, index) => {
    const organization = select("organization", key);
    if (!organization) plan.blocked.push(`Missing ordered partner ${key}`);
    else
      fill(organization._id, "organization", {
        partnerOrder: (index + 1) * 10,
      });
  });
  const voiceRefs = Object.fromEntries(
    Object.entries(voices).map(([group, keys]) => [
      group,
      keys.map((key) => {
        const missingGroup = needsFill("eLabCopy", `voices.${group}`);
        const person = missingGroup
          ? (byId.get(`person-e-lab-testimonial-${key}`) ??
            select("person", key))
          : undefined;
        if (missingGroup && person?._type !== "person")
          plan.blocked.push(`Missing E-Lab person ${key}`);
        return reference(person?._id ?? `person-e-lab-testimonial-${key}`, key);
      }),
    ]),
  );
  fill(
    "eLabCopy",
    "eLabCopy",
    Object.fromEntries(
      Object.entries(voiceRefs).map(([group, refs]) => [
        `voices.${group}`,
        refs,
      ]),
    ),
  );
  const cases: Record<string, unknown> = {};
  for (const [field, key] of [
    ["voiceCaseStudy", "bmw"],
    ["outcomeCaseStudy", "osapiens"],
  ]) {
    const doc = byId.get(`casestudy-${key}`);
    if (needsFill("hackathonsCopy", field) && doc?._type !== "caseStudy") {
      plan.blocked.push(`Missing caseStudy casestudy-${key}`);
    }
    cases[field] = { ...reference(`casestudy-${key}`), _weak: true };
  }
  fill("hackathonsCopy", "hackathonsCopy", cases);
  return plan;
}

/** Safe fill fields for the only document types this historical migration edits. */
export const singleSourceFields: Record<string, readonly string[]> = {
  organization: ["partnerOrder"],
  siteSettings: ["hackathons", "organization.startedApplicationsPerBatch"],
  partnersCopy: ["sections.hero.image"],
  eLabCopy: ["voices.founders", "voices.investors"],
  hackathonsCopy: ["voiceCaseStudy", "outcomeCaseStudy"],
};
