import type { ContentImage } from "./cms-content-model";

/**
 * The shapes and option lists shared by the `organization`, `logoList` and
 * `person` content types (docs/cms-content-inventory.md, phase 3):
 * isomorphic, so the Studio schemas, the code fallbacks in features and the
 * server-only slices (`lib/organization-content.ts`,
 * `lib/person-content.ts`) agree on one vocabulary.
 */

/**
 * A logo file as pages receive it: a {@link ContentImage} (intrinsic size of
 * the file, alt text) plus how to set it.
 */
export type LogoArtwork = ContentImage & {
  /**
   * The artwork is a symbol without the name (an app icon, a monogram):
   * pages set the name beside it. Only present when true.
   */
  symbolOnly?: true;
  /**
   * Width over height of the drawn artwork when it differs from the file's
   * size (an SVG `viewBox` with fractional or padded bounds). Pages that
   * size logos to one optical area read it; without it they use
   * `width / height`.
   */
  aspectRatio?: number;
};

/**
 * The partner tiers, highest first: the /partners directory's rows (Gold,
 * Silver and Bronze, then the supporter board) and the order it sorts by.
 * Gold, Silver and Bronze partners are the highlighted ones (homepage, the
 * /partners hero).
 */
export const partnerTiers = [
  { value: "gold", title: "Gold" },
  { value: "silver", title: "Silver" },
  { value: "bronze", title: "Bronze" },
  { value: "supporter", title: "Supporter" },
] as const;

export type PartnerTier = (typeof partnerTiers)[number]["value"];

/**
 * The old site's partner categories. /research shows the research partners,
 * and `/api/getPartners` returns the category, so the values stay exactly
 * the old `partner` documents' strings.
 */
export const partnerCategories = [
  { value: "Industry Partners", title: "Industry partner" },
  { value: "Technical Partners", title: "Technical partner" },
  { value: "Research Partners", title: "Research partner" },
  { value: "Venture Capital", title: "Venture capital" },
  { value: "Initiatives", title: "Initiative" },
] as const;

export type PartnerCategory = (typeof partnerCategories)[number]["value"];

/**
 * An organisation's partnership with TUM.ai. An organisation is a partner
 * exactly when it has one (the CMS: when `partnerTier` is set).
 */
export type Partnership = {
  tier: PartnerTier;
  category?: PartnerCategory;
  /** Leads its tier. Only present when true. */
  featured?: true;
};

const tierValues: ReadonlySet<string> = new Set(
  partnerTiers.map(({ value }) => value),
);
const categoryValues: ReadonlySet<string> = new Set(
  partnerCategories.map(({ value }) => value),
);

/** Whether `value` is one of {@link partnerTiers}. */
export function isPartnerTier(value: unknown): value is PartnerTier {
  return typeof value === "string" && tierValues.has(value);
}

/** Whether `value` is one of {@link partnerCategories}. */
export function isPartnerCategory(value: unknown): value is PartnerCategory {
  return typeof value === "string" && categoryValues.has(value);
}

/**
 * One company, lab or institution the site shows a logo for: the code
 * fallback and the CMS `organization` document share this shape. Optional
 * fields are left out, not `undefined`, so code and CMS values compare equal.
 */
export type Organization = {
  /**
   * Stable id, kebab-case (`hudson-river-trading`). References and code
   * lists name organisations by it; pages that match names (the partner
   * marquee, research titles) compare its letters and digits, so it spells
   * the name.
   */
  key: string;
  name: string;
  /** How running text names it ("Harvard" for Harvard University). */
  shortName?: string;
  href?: string;
  /** For light backgrounds. */
  logo?: LogoArtwork;
  /** Official artwork for dark bands (partner marquee, events hero). */
  logoOnDark?: LogoArtwork;
  /** Set when the organisation is a TUM.ai partner. */
  partnership?: Partnership;
};

/**
 * The page sections that show an ordered list of logos, one `logoList`
 * document each (its `_id` is fixed per section, see
 * `logoListId` in `lib/organization-content.ts`).
 */
export const logoListSurfaces = [
  {
    value: "alumni-destinations",
    title: "Partners: where alumni go (/partners)",
  },
  {
    value: "partner-marquee",
    title: "Partners: marquee artwork on dark (/partners hero)",
  },
  { value: "e-lab-ventures", title: "E-Lab: alumni ventures (/e-lab)" },
  {
    value: "rex-institutions",
    title: "Research: REX institutions (/research)",
  },
] as const;

export type LogoListSurface = (typeof logoListSurfaces)[number]["value"];

/**
 * The fixed `_id` of a section's `logoList` document. The Studio pins these
 * documents and the backfill creates them; pages query them by id.
 */
export function logoListDocumentId(surface: LogoListSurface): string {
  return `logolist-${surface}`;
}

/** A logo section's organisations, in the order the page shows them. */
export type LogoLists<S extends LogoListSurface = LogoListSurface> = Record<
  S,
  Organization[]
>;

/**
 * Where a `person` document appears. One document per appearance: the same
 * person on two pages (a member who is also a partner profile) has two
 * documents, because role and portrait differ per page.
 */
export const personPlacements = [
  { value: "member-story", title: "Member story (/community)" },
  { value: "partner-profile", title: "Partner profile (/partners)" },
  {
    value: "e-lab-testimonial",
    title: "E-Lab testimonial (/e-lab, homepage)",
  },
] as const;

export type PersonPlacement = (typeof personPlacements)[number]["value"];
