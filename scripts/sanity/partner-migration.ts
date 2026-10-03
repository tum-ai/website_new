/** CMS-only legacy partner migration; never reads a local content catalog. */

import { isPartnerCategory, isPartnerTier } from "@/lib/people-and-logos";
import { isHttpsUrl } from "@/lib/security";
import type { BackfillDocument } from "./asset-ledger";

/** A published `partner` document as the migration reads it. */
export type DatasetPartner = {
  _id: string;
  name?: unknown;
  link?: unknown;
  category?: unknown;
  tier?: unknown;
  featured?: unknown;
  image?: unknown;
};

/** A published `organization` document as the migration reads it. */
export type DatasetOrganization = {
  _id: string;
  key?: unknown;
  name?: unknown;
  shortName?: unknown;
  href?: unknown;
  logo?: unknown;
  partnerTier?: unknown;
  partnerCategory?: unknown;
  partnerFeatured?: unknown;
  legacyPartnerId?: unknown;
};

/** The fields the migration may set on an organisation. */
const migratedFields = [
  "partnerTier",
  "partnerCategory",
  "partnerFeatured",
  "legacyPartnerId",
  "href",
  "logo",
] as const;

type MigratedField = (typeof migratedFields)[number];

/** What the migration does to one organisation. */
export type MigrationStep =
  | {
      action: "create";
      id: string;
      key: string;
      name: string;
      /** Where the document comes from. */
      source: "partner";
      /** The partner document it replaces, if any. */
      partnerId: string | null;
      document: BackfillDocument;
    }
  | {
      action: "update";
      id: string;
      key: string;
      name: string;
      partnerId: string | null;
      /** Set with `setIfMissing`: only fields the organisation lacks. */
      set: Partial<Record<MigratedField, unknown>>;
    };

export type PartnerMigrationPlan = {
  steps: MigrationStep[];
  /** Organisations that already have everything (or were migrated before). */
  unchanged: { id: string; key: string; partnerId: string | null }[];
  /** Partner documents folded into another one's organisation. */
  merged: {
    partnerId: string;
    name: string;
    category: string | null;
    key: string;
    keptPartnerId: string;
  }[];
  /** Partner documents the migration cannot place. */
  skipped: { partnerId: string; reason: string }[];
};

const text = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

// Null and empty text may be deliberate editor clears; only absent fields are filled.
const isMissing = (value: unknown) => value === undefined;

/** Lowercase words joined by hyphens, as the organisation `key` must be. */
export function keyFromName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The partner document's logo as an organisation logo: the same uploaded
 * asset (no upload), with its hotspot and crop, and alt text.
 */
function logoFromPartner(
  image: unknown,
  name: string,
): Record<string, unknown> | undefined {
  if (!image || typeof image !== "object") return undefined;
  const { asset, hotspot, crop } = image as Record<string, unknown>;
  const ref = (asset as { _ref?: unknown } | undefined)?._ref;
  if (typeof ref !== "string") return undefined;
  return {
    _type: "image",
    asset: { _type: "reference", _ref: ref },
    ...(hotspot ? { hotspot } : {}),
    ...(crop ? { crop } : {}),
    alt: `${name} logo`,
  };
}

/**
 * The plan for `partners` (the dataset's published partner documents) and
 * `organizations` (its published organisations). Names, aliases, logos and
 * partnership values come exclusively from those CMS documents. `companyKey` is
 * `getPartnerKey` (passed in, so this module stays free of feature code).
 */
export function planPartnerMigration({
  partners,
  organizations,
  companyKey,
  organizationId,
}: {
  partners: readonly DatasetPartner[];
  organizations: readonly DatasetOrganization[];
  companyKey: (name: string) => string;
  /** The `_id` a new organisation gets from its key. */
  organizationId: (key: string) => string;
}): PartnerMigrationPlan {
  const plan: PartnerMigrationPlan = {
    steps: [],
    unchanged: [],
    merged: [],
    skipped: [],
  };

  const datasetByCompany = new Map<string, DatasetOrganization>();
  for (const organization of organizations) {
    for (const value of [
      organization.key,
      organization.name,
      organization.shortName,
    ]) {
      const alias = text(value);
      if (alias && !datasetByCompany.has(companyKey(alias))) {
        datasetByCompany.set(companyKey(alias), organization);
      }
    }
  }
  const datasetIds = new Set(organizations.map(({ _id }) => _id));

  const partnersByCompany = new Map<string, DatasetPartner[]>();
  for (const partner of [...partners].sort((a, b) =>
    a._id.localeCompare(b._id),
  )) {
    const name = text(partner.name);
    if (partner._id.includes(".")) {
      plan.skipped.push({
        partnerId: partner._id,
        reason: "not a published document",
      });
    } else if (!name) {
      plan.skipped.push({ partnerId: partner._id, reason: "it has no name" });
    } else {
      const alias = companyKey(name);
      const organization = datasetByCompany.get(alias);
      // Different CMS aliases of one organization must form one migration group.
      const company = organization ? `organization:${organization._id}` : alias;
      if (organization) datasetByCompany.set(company, organization);
      partnersByCompany.set(company, [
        ...(partnersByCompany.get(company) ?? []),
        partner,
      ]);
    }
  }

  const companies = new Set(partnersByCompany.keys());

  for (const company of [...companies].sort()) {
    const existing = datasetByCompany.get(company);
    const group = partnersByCompany.get(company) ?? [];
    const primary =
      group.find(({ _id }) => _id === existing?.legacyPartnerId) ??
      group.find(({ category }) => category === existing?.partnerCategory) ??
      group[0];
    for (const other of group) {
      if (other === primary || !primary) continue;
      plan.merged.push({
        partnerId: other._id,
        name: text(other.name) ?? "",
        category: text(other.category) ?? null,
        key: text(existing?.key) ?? company,
        keptPartnerId: primary._id,
      });
    }

    const name = text(existing?.name) ?? text(primary?.name) ?? "";
    const link = text(primary?.link);
    const wanted: Partial<Record<MigratedField, unknown>> = {
      partnerTier:
        (isPartnerTier(primary?.tier) ? primary.tier : undefined) ??
        "supporter",
      partnerCategory: isPartnerCategory(primary?.category)
        ? primary.category
        : undefined,
      partnerFeatured: primary?.featured === true ? true : undefined,
      legacyPartnerId: primary?._id,
      href: link && isHttpsUrl(link) ? link : undefined,
      logo: logoFromPartner(primary?.image, name),
    };
    const defined = (fields: Partial<Record<MigratedField, unknown>>) =>
      Object.fromEntries(
        Object.entries(fields).filter(([, value]) => value !== undefined),
      ) as Partial<Record<MigratedField, unknown>>;
    const partnerId = primary?._id ?? null;

    if (existing) {
      const key = text(existing.key) ?? company;
      const migratedBefore = !isMissing(existing.legacyPartnerId);
      const set = defined(
        Object.fromEntries(
          migratedFields
            .filter(
              (field) =>
                isMissing(existing[field]) &&
                !(
                  migratedBefore &&
                  (field === "partnerTier" ||
                    field === "partnerCategory" ||
                    field === "partnerFeatured")
                ),
            )
            .map((field) => [field, wanted[field]]),
        ),
      );
      if (Object.keys(set).length === 0) {
        plan.unchanged.push({ id: existing._id, key, partnerId });
      } else {
        plan.steps.push({
          action: "update",
          id: existing._id,
          key,
          name,
          partnerId,
          set,
        });
      }
      continue;
    }

    const key = keyFromName(name);
    const id = organizationId(key);
    if (!key || !name) {
      plan.skipped.push({
        partnerId: partnerId ?? company,
        reason: "no name to make an organisation key from",
      });
      continue;
    }
    if (datasetIds.has(id)) {
      plan.skipped.push({
        partnerId: partnerId ?? key,
        reason: `the organisation ${id} exists with another key; set its key to "${key}" or merge them by hand`,
      });
      continue;
    }
    const base: BackfillDocument = {
      _id: id,
      _type: "organization",
      key,
      name,
    };
    plan.steps.push({
      action: "create",
      id,
      key,
      name,
      source: "partner",
      partnerId,
      document: { ...base, ...defined(wanted) },
    });
  }
  return plan;
}

const describeValue = (field: string, value: unknown): string => {
  if (value && typeof value === "object") {
    const asset = (value as { _sanityAsset?: unknown })._sanityAsset;
    if (typeof asset === "string") {
      return `${field}: upload ${asset.replace(/^image@file:\/\/.*?\/public\//, "public/")}`;
    }
    const ref = (value as { asset?: { _ref?: unknown } }).asset?._ref;
    if (typeof ref === "string") return `${field}: the partner's ${ref}`;
  }
  return `${field}=${String(value)}`;
};

/** The plan as the dry run prints it. */
export function describePlan(plan: PartnerMigrationPlan): string {
  const creates = plan.steps.filter((step) => step.action === "create");
  const updates = plan.steps.filter((step) => step.action === "update");
  const partnerOf = (partnerId: string | null) =>
    partnerId ? `partner ${partnerId}` : "no partner document";
  const lines = [
    `Create ${creates.length} organisation(s):`,
    ...creates.map(
      (step) =>
        `  + ${step.id}  ${step.name}  (from ${step.source}; ${partnerOf(step.partnerId)}): ${migratedFields
          .filter((field) => step.document[field] !== undefined)
          .map((field) => describeValue(field, step.document[field]))
          .join(", ")}`,
    ),
    `Update ${updates.length} organisation(s), setting only fields they lack:`,
    ...updates.map(
      (step) =>
        `  ~ ${step.id}  ${step.name}  (${partnerOf(step.partnerId)}): ${Object.entries(
          step.set,
        )
          .map(([field, value]) => describeValue(field, value))
          .join(", ")}`,
    ),
    `Unchanged: ${plan.unchanged.length} organisation(s) already have every field.`,
  ];
  if (plan.merged.length > 0) {
    lines.push(
      `Merged: ${plan.merged.length} partner document(s) for a company that already has one (their category and id are not kept):`,
      ...plan.merged.map(
        (entry) =>
          `  = ${entry.partnerId} "${entry.name}" (${entry.category ?? "no category"}) into ${entry.key}, which keeps ${entry.keptPartnerId}`,
      ),
    );
  }
  if (plan.skipped.length > 0) {
    lines.push(
      `Skipped: ${plan.skipped.length} partner document(s):`,
      ...plan.skipped.map((entry) => `  ! ${entry.partnerId}: ${entry.reason}`),
    );
  }
  return lines.join("\n");
}
