import { isExcerptOf } from "../../src/lib/quote-excerpt";

/** Isolated migration receipt, retained after editors remove quotes or homepage documents. */
export const homeQuotesCompletionId = "migration-home-quotes-2026-10";
export type HomeQuotesTarget = { projectId: string; dataset: string };
type Reference = { _type: "reference"; _ref: string };
export type HomeQuoteDocument = Record<string, unknown> & {
  _id: string;
  _type: string;
  _rev?: string;
  join?: { quote?: unknown; quotes?: unknown };
};
/** Published people supply identity and story; no repository editorial payload is consulted. */
export type PlanInput = {
  documents: HomeQuoteDocument[];
  people: {
    _id: string;
    key?: unknown;
    name?: unknown;
    placement?: unknown;
    story?: unknown;
  }[];
  completion?: Record<string, unknown> | null;
};
export type HomeQuotesCompletion = HomeQuotesTarget & {
  _id: string;
  _type: "migrationCompletion";
  _rev?: string;
  migration: "home-quotes-2026-10";
  completed: string[];
  complete?: true;
};
export type QuotesPatch = {
  id: string;
  rev: string;
  quote: {
    _key: string;
    _type: "memberQuote";
    person: Reference;
    excerpt: string;
  };
};
export type HomeQuotesPlan = HomeQuotesTarget & {
  migration: "home-quotes-2026-10";
  draftVisibility: "verified" | "unknown";
  patches: QuotesPatch[];
  blocked: string[];
  lines: string[];
};

const object = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));
const text = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

/** Require an explicit safe target; the old site's production dataset is never writable. */
export function assertHomeQuotesTarget(target: HomeQuotesTarget): void {
  if (!/^[a-z0-9-]+$/.test(target.projectId))
    throw new Error("Invalid project id");
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(target.dataset))
    throw new Error("Name a valid target dataset explicitly");
  if (target.dataset === "production")
    throw new Error("Refusing production dataset");
}

/** Validate the independent durable receipt, or prepare its uncommitted initial value. */
export function readHomeQuotesCompletion(
  input: PlanInput,
  target: HomeQuotesTarget,
): HomeQuotesCompletion {
  assertHomeQuotesTarget(target);
  const doc = input.completion;
  if (doc == null)
    return {
      ...target,
      _id: homeQuotesCompletionId,
      _type: "migrationCompletion",
      migration: "home-quotes-2026-10",
      completed: [],
    };
  if (
    doc._id !== homeQuotesCompletionId ||
    doc._type !== "migrationCompletion" ||
    doc.migration !== "home-quotes-2026-10" ||
    doc.projectId !== target.projectId ||
    doc.dataset !== target.dataset ||
    !text(doc._rev) ||
    (doc.complete !== undefined && doc.complete !== true) ||
    !Array.isArray(doc.completed) ||
    doc.completed.some((id) => id !== "homeCopy" && id !== "drafts.homeCopy") ||
    new Set(doc.completed).size !== doc.completed.length
  )
    throw new Error("Invalid home quote migration completion record");
  return doc as HomeQuotesCompletion;
}

/** Build the same input from published documents for a readiness-only in-memory projection. */
export function homeQuotesInput(
  documents: readonly HomeQuoteDocument[],
): PlanInput {
  return {
    documents: documents.filter(
      ({ _id }) => _id === "homeCopy" || _id === "drafts.homeCopy",
    ),
    people: documents.filter(
      ({ _id, _type }) =>
        _type === "person" &&
        !_id.startsWith("drafts.") &&
        !_id.startsWith("versions."),
    ),
    completion: documents.find(({ _id }) => _id === homeQuotesCompletionId),
  };
}

/** Legacy CMS quote becomes exactly one item; editor-set arrays, null and completion stay intact. */
export function planHomeQuotes(
  input: PlanInput,
  target: HomeQuotesTarget,
  options: { draftVisibility?: "verified" | "unknown" } = {},
): HomeQuotesPlan {
  const completion = readHomeQuotesCompletion(input, target);
  const plan: HomeQuotesPlan = {
    ...target,
    migration: "home-quotes-2026-10",
    draftVisibility: options.draftVisibility ?? "unknown",
    patches: [],
    blocked: [],
    lines: [],
  };
  if (completion.complete) {
    plan.lines.push(
      "Home quote migration already completed; editor content left alone",
    );
    return plan;
  }
  if (!input.documents.some(({ _id }) => _id === "homeCopy"))
    plan.blocked.push(
      "homeCopy is absent; restore or author required homepage content in Studio",
    );
  for (const doc of input.documents) {
    if (doc._id !== "homeCopy" && doc._id !== "drafts.homeCopy")
      throw new Error("Unexpected home quote migration document");
    if (completion.completed.includes(doc._id)) {
      plan.lines.push(`${doc._id}: completed migration, left alone`);
      continue;
    }
    if (doc._type !== "homeCopy" || !text(doc._rev) || !object(doc.join)) {
      plan.blocked.push(
        `${doc._id}: missing homeCopy type, revision or join object`,
      );
      continue;
    }
    if (doc.join.quotes !== undefined) {
      plan.lines.push(`${doc._id}: editor-set join.quotes left alone`);
      continue;
    }
    const legacy = doc.join.quote;
    if (
      !object(legacy) ||
      !object(legacy.person) ||
      legacy.person._type !== "reference" ||
      !text(legacy.person._ref) ||
      !text(legacy.excerpt)
    ) {
      plan.blocked.push(
        doc._id +
          ": no complete legacy join.quote; author join.quotes in Studio",
      );
      continue;
    }
    const personId = legacy.person._ref;
    const people = input.people.filter(
      ({ _id }) =>
        _id === personId &&
        !_id.startsWith("drafts.") &&
        !_id.startsWith("versions."),
    );
    const person = people.length === 1 ? people[0] : undefined;
    if (
      person?.placement !== "member-story" ||
      !text(person.key) ||
      !text(person.name) ||
      !text(person.story) ||
      !isExcerptOf(legacy.excerpt, person.story)
    ) {
      plan.blocked.push(
        doc._id +
          ": legacy quote must reference one published member-story with identity and matching excerpt",
      );
      continue;
    }
    plan.patches.push({
      id: doc._id,
      rev: doc._rev,
      quote: {
        _key: "legacy-member-quote",
        _type: "memberQuote",
        person: structuredClone(legacy.person) as Reference,
        excerpt: legacy.excerpt,
      },
    });
    plan.lines.push(
      `${doc._id}: preserve existing legacy quote as one join.quotes item`,
    );
  }
  return plan;
}

/** Audit-only overlay; never mutates its input or produces a live completion receipt. */
export function projectHomeQuotes(
  plan: HomeQuotesPlan,
  documents: readonly HomeQuoteDocument[],
): HomeQuoteDocument[] {
  assertHomeQuotesTarget(plan);
  if (plan.blocked.length) throw new Error(plan.blocked.join("; "));
  const projected = structuredClone([...documents]);
  for (const patch of plan.patches) {
    const doc = projected.find(({ _id }) => _id === patch.id);
    if (
      !doc ||
      doc._rev !== patch.rev ||
      !object(doc.join) ||
      doc.join.quotes !== undefined
    )
      throw new Error(`Stale home quote projection for ${patch.id}`);
    doc.join.quotes = [structuredClone(patch.quote)];
    delete doc.join.quote;
  }
  return projected;
}

/** Raw reads only certify draft preflight when authenticated; published public reads cannot. */
export function homeQuotesPreflightRequest(
  target: HomeQuotesTarget,
  token?: string,
) {
  assertHomeQuotesTarget(target);
  const url = new URL(
    "https://" +
      target.projectId +
      ".api.sanity.io/v2025-02-19/data/query/" +
      target.dataset,
  );
  url.searchParams.set("perspective", token ? "raw" : "published");
  url.searchParams.set("query", PLAN_QUERY);
  return {
    url,
    draftVisibility: token ? ("verified" as const) : ("unknown" as const),
    init: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  };
}

/** Keep legacy CMS source and people together; versions and draft people are excluded. */
export const PLAN_QUERY = `{
  "documents": *[_id in ["homeCopy", "drafts.homeCopy"]]{ _id, _type, _rev, join },
  "people": *[_type == "person" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))]{ _id, key, name, placement, story },
  "completion": *[_id == "migration-home-quotes-2026-10"][0]
}`;
