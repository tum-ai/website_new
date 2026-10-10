/**
 * The organisation-references migration's plan: which documents of a
 * dataset get references to `organization` documents in place of the names
 * they held, as pure functions over the documents.
 * `migrate-org-references.ts` prints the plan (a dry run over the published
 * documents) and `migrate-org-references-apply.ts` carries it out (drafts
 * included).
 *
 * - `research.institutions` from the names before the colon in the title;
 * - `event.coHosts` from `hosts`;
 * - `labSite.organizations` from the alias strings in `institutions`
 *   (which it then unsets);
 * - `person.organization` from a role's "@ Company" when the person has
 *   none, and the role reduced to the position (`roleAtOrganization`) where
 *   "@ Company" is its organisation;
 * - `taskForce.work.partner` from its name;
 * - the `event-hosts` logo list, which the site no longer reads, deleted
 *   while it still holds what the backfill wrote.
 *
 * Names find their organisation by `getPartnerKey` (letters and digits,
 * with its aliases) of the organisation's key, name or short name. A
 * document is only planned when every name it holds finds one (so the site
 * never shows fewer co-hosts or institutions than before) and only where
 * the new field is still empty, so an editor's value is never replaced;
 * names without an organisation are listed for a maintainer, never
 * invented. Only existing published CMS organisations may be referenced;
 * missing names are reported for a maintainer to resolve in Studio.
 *
 * Imports are relative and runtime-free: the Sanity CLI runs the apply
 * step without the `@/` alias.
 */
import { getPartnerKey } from "../../src/features/partners/partner-key";
import { splitResearchTitle } from "../../src/features/research/research-title";

/** A document as the dataset holds it. */
type StoredDocument = Record<string, unknown> & {
  _id: string;
  _type: string;
  _rev?: string;
};

/** An organisation as the plan reads it. */
type PlanOrganization = {
  _id: string;
  key: string;
  name: string;
  shortName?: string | null;
};

/** What the plan reads from the dataset. */
export type PlanDataset = {
  /** The published organisations (a reference can only point at those). */
  organizations: readonly PlanOrganization[];
  /** The documents to migrate, drafts included where the reader sees them. */
  documents: readonly StoredDocument[];
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

/** A document the plan deletes, at the revision it read. */
type PlannedDelete = { id: string; rev?: string; reason: string };

/** A document field left alone, and why. */
type Note = { id: string; path: string; detail: string };

export type Plan = {
  /** Organisations to create first (`createIfNotExists`). */
  create: StoredDocument[];
  patches: PlannedPatch[];
  deletes: PlannedDelete[];
  /** Names no organisation matches: a maintainer adds the organisation. */
  unmatched: Note[];
  /** References to organisations the dataset lacks and the plan can't create. */
  blocked: Note[];
  /** Fields left alone: an editor changed them, or they name another place. */
  skipped: Note[];
};

/** The `event-hosts` logo list's id; the site no longer reads the list. */
export const eventHostsListId = "logolist-event-hosts";

/**
 * The organisations the backfill wrote into the `event-hosts` list, in
 * order: the list is deleted only while it still holds exactly these.
 */
export const formerEventHostKeys: readonly string[] = [
  "anthropic",
  "aws",
  "beyond-presence",
  "bkw",
  "bmw",
  "cdtm",
  "google-cloud",
  "hugging-face",
  "lovable",
  "manage-and-more",
  "n8n",
  "nvidia",
  "project-a",
  "red-bull",
  "tacto",
  "yellow",
  "mercura",
];

/**
 * The GROQ query for every document the plan reads (`$listIds`: the
 * `event-hosts` list and its draft): the published organisations and the
 * documents to migrate, release versions left out.
 */
export const PLAN_QUERY = `{
  "organizations": *[_type == "organization" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))]{ _id, key, name, shortName },
  "documents": *[
    !(_id in path("versions.**")) &&
    (_type in ["research", "event", "labSite", "person", "taskForce"] || _id in $listIds)
  ]
}`;

/** `ids` with their draft ids, for {@link PLAN_QUERY}'s `$listIds`. */
export const withDraftIds = (ids: readonly string[]) =>
  ids.flatMap((id) => [id, `drafts.${id}`]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const strings = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

const isEmpty = (value: unknown) =>
  value === undefined ||
  value === null ||
  (Array.isArray(value) && value.length === 0);

/** "Co-Founder & CTO @Dryft" as its position and its place. */
const rolePattern = /^(.*\S)\s*@\s*(\S.*)$/;

/** The published id of a document (`drafts.x` is `x`). */
const publishedId = (id: string) => id.replace(/^drafts\./, "");

type Resolver = {
  /** The organisation key a name stands for, or undefined. */
  keyOf(name: string): string | undefined;
  /** Whether a reference to the organisation `key` can be made. */
  canReference(key: string): boolean;
  /**
   * The organisation's document id; for one the dataset lacks but the plan
   * may create, it queues the creation. Call after {@link canReference}.
   */
  idOf(key: string): string;
  /** The key of the published organisation with document id `id`. */
  keyOfId(id: string): string | undefined;
  /** The organisations the plan creates, in first-use order. */
  created: StoredDocument[];
};

function resolverFor(dataset: PlanDataset): Resolver {
  const byName = new Map<string, string>();
  const index = (organization: Omit<PlanOrganization, "_id">) => {
    for (const name of [
      organization.key,
      organization.name,
      organization.shortName,
    ]) {
      const id = name ? getPartnerKey(name) : "";
      if (id && !byName.has(id)) byName.set(id, organization.key);
    }
  };
  // The dataset's names first: an editor's organisation wins over code's.
  for (const organization of dataset.organizations) index(organization);

  const idByKey = new Map(
    dataset.organizations.map(({ key, _id }) => [key, _id]),
  );
  const keyById = new Map(
    dataset.organizations.map(({ key, _id }) => [_id, key]),
  );
  const created: StoredDocument[] = [];
  return {
    keyOf: (name) => byName.get(getPartnerKey(name)),
    canReference: (key) => idByKey.has(key),
    idOf: (key) => {
      const existing = idByKey.get(key);
      if (existing) return existing;
      throw new Error(`No CMS organisation "${key}" to reference`);
    },
    keyOfId: (id) => keyById.get(id),
    created,
  };
}

type Draft = { set: Record<string, unknown>; unset: string[] };

type Context = {
  resolve: Resolver;
  draft: Draft;
  changes: FieldChange[];
  plan: Plan;
  id: string;
};

/** A reference array item to the organisation `key` (whose id is `ref`). */
const referenceItem = (key: string, ref: string) => ({
  _key: key,
  _type: "reference",
  _ref: ref,
});

/**
 * The reference items for `names` (distinct organisations, in order), or
 * `null` after noting the names without an organisation and the
 * organisations the dataset lacks.
 */
function referencesFor(
  names: readonly string[],
  path: string,
  { resolve, plan, id }: Context,
) {
  const keys: string[] = [];
  const unmatched: string[] = [];
  for (const name of names) {
    const key = resolve.keyOf(name);
    if (!key) unmatched.push(name);
    else if (!keys.includes(key)) keys.push(key);
  }
  if (unmatched.length > 0) {
    plan.unmatched.push({ id, path, detail: unmatched.join(", ") });
    return null;
  }
  const missing = keys.filter((key) => !resolve.canReference(key));
  if (missing.length > 0) {
    plan.blocked.push({ id, path, detail: missing.join(", ") });
    return null;
  }
  return keys.map((key) => referenceItem(key, resolve.idOf(key)));
}

function set(context: Context, path: string, before: unknown, after: unknown) {
  context.draft.set[path] = after;
  context.changes.push({ path, before, after });
}

function planResearch(document: StoredDocument, context: Context) {
  if (!isEmpty(document.institutions)) return;
  const title = typeof document.title === "string" ? document.title : "";
  const { institutions } = splitResearchTitle(title);
  if (institutions.length === 0) return;
  const references = referencesFor(institutions, "institutions", context);
  if (references) set(context, "institutions", undefined, references);
}

function planEvent(document: StoredDocument, context: Context) {
  if (!isEmpty(document.coHosts)) return;
  const hosts = strings(document.hosts)
    .map((name) => name.trim())
    .filter(Boolean);
  if (hosts.length === 0) return;
  const references = referencesFor(hosts, "coHosts", context);
  if (references) set(context, "coHosts", undefined, references);
}

function planLabSite(document: StoredDocument, context: Context) {
  const aliases = strings(document.institutions);
  if (aliases.length === 0 || !isEmpty(document.organizations)) return;
  const references = referencesFor(aliases, "organizations", context);
  if (!references) return;
  set(context, "organizations", undefined, references);
  context.draft.unset.push("institutions");
  context.changes.push({
    path: "institutions",
    before: aliases,
    after: undefined,
  });
}

function planPerson(document: StoredDocument, context: Context) {
  const { resolve, plan, id } = context;
  const role = typeof document.role === "string" ? document.role : "";
  const match = rolePattern.exec(role.trim());
  const [, position, place] = match ?? [];
  if (!position || !place) return;
  const placeKey = resolve.keyOf(place);

  const current = isRecord(document.organization)
    ? document.organization._ref
    : undefined;
  let organizationKey =
    typeof current === "string" ? resolve.keyOfId(current) : undefined;
  if (current === undefined && placeKey) {
    if (!resolve.canReference(placeKey)) {
      plan.blocked.push({ id, path: "organization", detail: placeKey });
      return;
    }
    set(context, "organization", undefined, {
      _type: "reference",
      _ref: resolve.idOf(placeKey),
    });
    organizationKey = placeKey;
  }

  if (!organizationKey || document.roleAtOrganization !== undefined) return;
  if (placeKey !== organizationKey) {
    plan.skipped.push({
      id,
      path: "role",
      detail: `names another place than its organisation (${organizationKey}): ${JSON.stringify(role)}`,
    });
    return;
  }
  set(context, "role", role, position);
  set(context, "roleAtOrganization", undefined, true);
}

function planTaskForce(document: StoredDocument, context: Context) {
  const work = isRecord(document.work) ? document.work : undefined;
  const partner = work?.partner;
  if (typeof partner !== "string" || !partner.trim()) return;
  const references = referencesFor([partner.trim()], "work.partner", context);
  const [reference] = references ?? [];
  if (!reference) return;
  set(context, "work.partner", partner, {
    _type: "reference",
    _ref: reference._ref,
  });
}

function planEventHostsList(document: StoredDocument, plan: Plan) {
  const refs = (
    Array.isArray(document.organizations) ? document.organizations : []
  ).map((item) => (isRecord(item) ? item._ref : undefined));
  const expected = formerEventHostKeys.map((key) => `organization-${key}`);
  if (JSON.stringify(refs) === JSON.stringify(expected)) {
    plan.deletes.push({
      id: document._id,
      ...(document._rev ? { rev: document._rev } : {}),
      reason:
        "the events hero reads each co-host organisation's dark logo; nothing reads this list",
    });
  } else {
    plan.skipped.push({
      id: document._id,
      path: "organizations",
      detail:
        "no longer the list the backfill wrote; nothing reads it, so delete it by hand",
    });
  }
}

/**
 * The plan that gives `dataset`'s documents (published and drafts alike,
 * each planned on its own) their organisation references. Documents it
 * doesn't know are ignored.
 */
export function planOrgReferences(dataset: PlanDataset): Plan {
  const plan: Plan = {
    create: [],
    patches: [],
    deletes: [],
    unmatched: [],
    blocked: [],
    skipped: [],
  };
  const resolve = resolverFor(dataset);
  for (const document of dataset.documents) {
    if (publishedId(document._id) === eventHostsListId) {
      planEventHostsList(document, plan);
      continue;
    }
    const context: Context = {
      resolve,
      draft: { set: {}, unset: [] },
      changes: [],
      plan,
      id: document._id,
    };
    if (document._type === "research") planResearch(document, context);
    else if (document._type === "event") planEvent(document, context);
    else if (document._type === "labSite") planLabSite(document, context);
    else if (document._type === "person") planPerson(document, context);
    else if (document._type === "taskForce") planTaskForce(document, context);
    if (context.changes.length > 0) {
      plan.patches.push({
        id: document._id,
        ...(document._rev ? { rev: document._rev } : {}),
        ...context.draft,
        changes: context.changes,
      });
    }
  }
  plan.create = resolve.created;
  return plan;
}

const show = (value: unknown) =>
  value === undefined ? "(unset)" : JSON.stringify(value);

/** A reference list as its organisation keys, for the printed plan. */
const brief = (value: unknown) =>
  Array.isArray(value) && value.every((item) => isRecord(item) && item._ref)
    ? `[${value.map((item) => (item as { _key?: string })._key).join(", ")}]`
    : show(value);

/** The plan as the scripts print it: each change as before → after. */
export function formatPlan({
  create,
  patches,
  deletes,
  unmatched,
  blocked,
  skipped,
}: Plan): string {
  const lines: string[] = [];
  const section = (title: string, notes: readonly Note[]) => {
    if (notes.length === 0) return;
    lines.push(
      title,
      ...notes.map(({ id, path, detail }) => `  ${id} ${path}: ${detail}`),
    );
  };
  if (create.length > 0) {
    lines.push(
      "Create organisations:",
      ...create.map(
        (document) => `  ${document._id} (${JSON.stringify(document.name)})`,
      ),
    );
  }
  for (const { id, changes } of patches) {
    lines.push(
      id,
      ...changes.map(
        ({ path, before, after }) =>
          `  ${path}\n    before: ${brief(before)}\n    after:  ${brief(after)}`,
      ),
    );
  }
  if (deletes.length > 0) {
    lines.push(
      "Delete:",
      ...deletes.map(({ id, reason }) => `  ${id}: ${reason}`),
    );
  }
  section(
    "No organisation matches these names (add the organisation, then run again; nothing was invented):",
    unmatched,
  );
  section(
    "Organisations the dataset lacks (run pnpm sanity:migrate-partners --apply or the backfill first):",
    blocked,
  );
  section("Left alone:", skipped);
  const changes = patches.reduce((sum, { changes }) => sum + changes.length, 0);
  lines.push(
    `${create.length} organisation(s) to create, ${changes} change(s) in ${patches.length} document(s), ${deletes.length} to delete; ${unmatched.length} unmatched, ${blocked.length} blocked, ${skipped.length} left alone.`,
  );
  return lines.join("\n");
}
