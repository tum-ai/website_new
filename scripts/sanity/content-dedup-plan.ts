/**
 * The content-dedup migration's plan: which fields of a dataset's documents
 * change so they match the content model after the dedup changes (#287),
 * as pure functions over the documents. `migrate-content-dedup.ts` prints
 * the plan (a dry run over the published documents) and
 * `migrate-content-dedup-apply.ts` commits it (drafts included).
 *
 * A field is only planned when it still holds the value the backfill wrote
 * (or, for a new field, nothing), so an editor's change is never
 * overwritten: such a field is listed as skipped for a person to convert.
 *
 * Imports are relative and runtime-free: the Sanity CLI runs the apply step
 * without the `@/` alias.
 */

/** A document as the dataset holds it. */
export type StoredDocument = Record<string, unknown> & {
  _id: string;
  _type: string;
  _rev?: string;
};

/** One field's change, for the printed plan. */
type FieldChange = { path: string; before: unknown; after: unknown };

/** The patch for one document: `set` and `unset` by Sanity patch path. */
type PlannedPatch = {
  id: string;
  /** The revision the plan read; the apply step patches only that one. */
  rev?: string;
  set: Record<string, unknown>;
  unset: string[];
  changes: FieldChange[];
};

/** A field the plan leaves alone because it no longer holds the old value. */
type SkippedField = { id: string; path: string; value: unknown };

export type Plan = { patches: PlannedPatch[]; skipped: SkippedField[] };

/**
 * B: the E-Lab phases' durations, from the text the backfill wrote to an
 * amount and a unit (`lib/program-duration.ts`).
 */
const phaseDurations: Readonly<
  Record<string, { amount: number; unit: "days" | "weeks" }>
> = {
  "3 days": { amount: 3, unit: "days" },
  "4 weeks": { amount: 4, unit: "weeks" },
  "6 weeks": { amount: 6, unit: "weeks" },
};

/**
 * E: the new `siteSettings.organization` facts, set only where the field is
 * empty (the values of `organizationFacts` in `config/organization.ts`).
 */
const organizationFacts = {
  acceptanceRate: 2.3,
  linkedinAudience: 20000,
} as const;

/** E: the /partners copy that typed the facts, and its placeholder version. */
export const partnersCopyTexts = {
  talentTitle: {
    before: "Hire the cracked 2%.",
    after: "Hire the cracked {{org.acceptanceRateRounded}}%.",
  },
  networkDescription: {
    before:
      "Your brand in front of a 20k+ LinkedIn audience, our newsletter and the major events we run. Consistent visibility across the community where Europe's next AI companies are being built.",
    after:
      "Your brand in front of a {{org.linkedinAudience}}+ LinkedIn audience, our newsletter and the major events we run. Consistent visibility across the community where Europe's next AI companies are being built.",
  },
  acceptanceStat: { before: "2.3%", after: "{{org.acceptanceRate}}%" },
  brandRecommendation: {
    before:
      "Put your brand in front of the community where Europe's next AI companies are being built. What you can pack into it: visibility across our 20k+ LinkedIn audience and newsletter, a networking event invitation, and a custom mail to the community.",
    after:
      "Put your brand in front of the community where Europe's next AI companies are being built. What you can pack into it: visibility across our {{org.linkedinAudience}}+ LinkedIn audience and newsletter, a networking event invitation, and a custom mail to the community.",
  },
  peopleTitle: {
    before: "The cracked 2%.",
    after: "The cracked {{org.acceptanceRateRounded}}%.",
  },
} as const;

/**
 * F: the member-journey answer's points as the backfill wrote them; the
 * page now lists the journey's tracks itself, so they are removed.
 */
export const memberJourneyPoints: readonly string[] = [
  "In the initiative track you will join one of our core departments and become a driving force behind everything that makes TUM.ai stand out.",
  "In the research track you will join a team on an Impact Project applying AI to real-world challenges. Contribute to research and write academic publications.",
];

/** The ids of the singletons the plan reads (published; drafts are `drafts.<id>`). */
export const singletonIds = ["eLabCopy", "siteSettings", "partnersCopy"];

/**
 * The GROQ filter for every document the plan may patch: the singletons,
 * the Q&A member-journey entry and the campaigns (drafts included where
 * the reader can see them).
 */
export const PLAN_QUERY = `*[
  _id in $ids ||
  _type == "campaign" ||
  (_type == "faq" && collection == "qanda" && anchor == "member-journey")
]`;

/** `ids` with their draft ids, for {@link PLAN_QUERY}'s `$ids`. */
export const withDraftIds = (ids: readonly string[]) =>
  ids.flatMap((id) => [id, `drafts.${id}`]);

type Draft = {
  set: Record<string, unknown>;
  unset: string[];
  changes: FieldChange[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const keyed = (value: unknown) =>
  (Array.isArray(value) ? value : []).filter(
    (item): item is Record<string, unknown> & { _key: string } =>
      isRecord(item) && typeof item._key === "string",
  );

const sameJson = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

/**
 * Plans `path` from `before` to `after` when it holds exactly `before`;
 * records a skip when it holds something else (not when it is unset or
 * already `after`).
 */
function replace(
  draft: Draft,
  skipped: SkippedField[],
  id: string,
  path: string,
  current: unknown,
  { before, after }: { before: unknown; after: unknown },
) {
  if (sameJson(current, before)) {
    draft.set[path] = after;
    draft.changes.push({ path, before, after });
  } else if (current !== undefined && !sameJson(current, after)) {
    skipped.push({ id, path, value: current });
  }
}

function planELabCopy(
  document: StoredDocument,
  draft: Draft,
  skipped: SkippedField[],
) {
  const gates = isRecord(document.gates) ? document.gates : {};
  for (const stage of keyed(gates.stages)) {
    if (stage._type !== "phaseStage" || isRecord(stage.duration)) continue;
    const path = `gates.stages[_key=="${stage._key}"].duration`;
    const after =
      typeof stage.duration === "string"
        ? phaseDurations[stage.duration]
        : undefined;
    if (after) {
      draft.set[path] = after;
      draft.changes.push({ path, before: stage.duration, after });
    } else {
      skipped.push({ id: document._id, path, value: stage.duration });
    }
  }
}

function planSiteSettings(document: StoredDocument, draft: Draft) {
  const organization = isRecord(document.organization)
    ? document.organization
    : null;
  if (!organization) return;
  for (const [field, value] of Object.entries(organizationFacts)) {
    if (organization[field] !== undefined) continue;
    const path = `organization.${field}`;
    draft.set[path] = value;
    draft.changes.push({ path, before: undefined, after: value });
  }
}

function planPartnersCopy(
  document: StoredDocument,
  draft: Draft,
  skipped: SkippedField[],
) {
  const id = document._id;
  const texts = partnersCopyTexts;
  for (const reason of keyed(document.reasons)) {
    const at = `reasons[_key=="${reason._key}"]`;
    if (reason.title === texts.talentTitle.before) {
      replace(
        draft,
        skipped,
        id,
        `${at}.title`,
        reason.title,
        texts.talentTitle,
      );
    }
    if (reason.description === texts.networkDescription.before) {
      replace(
        draft,
        skipped,
        id,
        `${at}.description`,
        reason.description,
        texts.networkDescription,
      );
    }
  }
  for (const stat of keyed(document.stats)) {
    if (stat.value === texts.acceptanceStat.before) {
      replace(
        draft,
        skipped,
        id,
        `stats[_key=="${stat._key}"].value`,
        stat.value,
        texts.acceptanceStat,
      );
    }
  }
  const recommendations = isRecord(document.recommendations)
    ? document.recommendations
    : {};
  const brand = isRecord(recommendations.brand) ? recommendations.brand : {};
  replace(
    draft,
    skipped,
    id,
    "recommendations.brand.description",
    brand.description,
    texts.brandRecommendation,
  );
  const sections = isRecord(document.sections) ? document.sections : {};
  const people = isRecord(sections.people) ? sections.people : {};
  replace(
    draft,
    skipped,
    id,
    "sections.people.title",
    people.title,
    texts.peopleTitle,
  );
}

function planMemberJourneyFaq(
  document: StoredDocument,
  draft: Draft,
  skipped: SkippedField[],
) {
  if (document.points === undefined) return;
  if (sameJson(document.points, memberJourneyPoints)) {
    draft.unset.push("points");
    draft.changes.push({
      path: "points",
      before: document.points,
      after: undefined,
    });
  } else {
    skipped.push({ id: document._id, path: "points", value: document.points });
  }
}

function planCampaign(document: StoredDocument, draft: Draft) {
  const { featuredEventId, featuredEvent } = document;
  if (typeof featuredEventId !== "string") return;
  const ref = featuredEventId.trim();
  if (ref && featuredEvent === undefined) {
    const after = { _type: "reference", _ref: ref, _weak: true };
    draft.set.featuredEvent = after;
    draft.changes.push({ path: "featuredEvent", before: undefined, after });
  }
  draft.unset.push("featuredEventId");
  draft.changes.push({
    path: "featuredEventId",
    before: featuredEventId,
    after: undefined,
  });
}

/** The published id of a document (`drafts.x` is `x`). */
const publishedId = (id: string) => id.replace(/^drafts\./, "");

/**
 * The patches that bring `documents` (published and drafts alike, each
 * planned on its own) to the deduplicated model, and the fields left alone
 * because an editor changed them. Documents it doesn't know are ignored.
 */
export function planContentDedup(documents: readonly StoredDocument[]): Plan {
  const patches: PlannedPatch[] = [];
  const skipped: SkippedField[] = [];
  for (const document of documents) {
    const draft: Draft = { set: {}, unset: [], changes: [] };
    const id = publishedId(document._id);
    if (id === "eLabCopy") planELabCopy(document, draft, skipped);
    else if (id === "siteSettings") planSiteSettings(document, draft);
    else if (id === "partnersCopy") planPartnersCopy(document, draft, skipped);
    else if (document._type === "faq" && document.anchor === "member-journey") {
      planMemberJourneyFaq(document, draft, skipped);
    } else if (document._type === "campaign") planCampaign(document, draft);
    if (draft.changes.length > 0) {
      patches.push({
        id: document._id,
        ...(document._rev ? { rev: document._rev } : {}),
        ...draft,
      });
    }
  }
  return { patches, skipped };
}

const show = (value: unknown) =>
  value === undefined ? "(unset)" : JSON.stringify(value);

/** The plan as the scripts print it: each change as before → after. */
export function formatPlan({ patches, skipped }: Plan): string {
  const lines = patches.flatMap(({ id, changes }) => [
    id,
    ...changes.map(
      ({ path, before, after }) =>
        `  ${path}\n    before: ${show(before)}\n    after:  ${show(after)}`,
    ),
  ]);
  if (skipped.length > 0) {
    lines.push(
      "Left alone (no longer the value the backfill wrote; convert by hand if needed):",
      ...skipped.map(
        ({ id, path, value }) => `  ${id} ${path}: ${show(value)}`,
      ),
    );
  }
  const changes = patches.reduce((sum, { changes }) => sum + changes.length, 0);
  lines.push(
    `${changes} change(s) in ${patches.length} document(s), ${skipped.length} left alone.`,
  );
  return lines.join("\n");
}
