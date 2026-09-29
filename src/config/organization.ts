/**
 * Single source for who TUM.ai is: the headline figures and the legal
 * identity (name, registered office, register entry, representatives). The
 * landing, Apply, Partners and Imprint pages and the site JSON-LD read them,
 * so a new count or a new board is one edit here. Counts are lower bounds and
 * render with a trailing "+". See "Updating site facts" in
 * docs/contributor-guide.md.
 */
export const organizationFacts = {
  foundingYear: 2020,
  activeMembers: 150,
  alumni: 850,
  majors: 20,
  universities: 30,
  nationalities: 35,
  /**
   * Share of applicants a recruiting round accepts, in percent with one
   * decimal. /partners shows it as a figure ("2.3%") and, rounded to a
   * whole percent ({@link acceptanceRateRoundedOf}), in its "cracked …%"
   * headings.
   */
  acceptanceRate: 2.3,
  /**
   * TUM.ai's LinkedIn audience, a lower bound. /partners shows it in
   * thousands ({@link linkedinAudienceLabelOf}): "20k+".
   */
  linkedinAudience: 20000,
} as const;

/**
 * The mission as the 2026 brand guide states it (slide "Brand Story &
 * Mission"). /apply quotes it as the call's scope and /qanda opens on it.
 */
export const brandMission =
  "To bridge the gap between theory and practice by empowering students to build the future of AI. We combine academic rigor with a “make-it-happen” mindset to solve real-world challenges.";

/**
 * The headline figures as the CMS `siteSettings` document holds them (see
 * `config/site-facts.ts`); `organizationFacts` is the code fallback.
 */
export type OrganizationFacts = {
  readonly [Key in keyof typeof organizationFacts]: number;
};

/** Everyone who has been an official member: active members plus alumni. */
export function officialMembersOf(
  facts: Pick<OrganizationFacts, "activeMembers" | "alumni">,
): number {
  return facts.activeMembers + facts.alumni;
}

/**
 * The acceptance rate as a whole percent, for copy that rounds it ("the
 * cracked 2%" for 2.3).
 */
export function acceptanceRateRoundedOf(acceptanceRate: number): number {
  return Math.round(acceptanceRate);
}

/**
 * The LinkedIn audience in thousands, rounded down because it is shown as a
 * lower bound with "+": "20k" for 20000 and for 20999. Below a thousand, the
 * count itself.
 */
export function linkedinAudienceLabelOf(audience: number): string {
  return audience >= 1000
    ? `${Math.floor(audience / 1000)}k`
    : String(audience);
}

/** {@link officialMembersOf} the code facts; per render, derive it from `getSiteFacts()`. */
export const officialMembers = officialMembersOf(organizationFacts);

type PostalAddress = {
  streetAddress: string;
  postalCode: string;
  addressLocality: string;
  addressCountry: string;
};

/**
 * TUM.ai e.V., the registered association behind the site (Imprint, JSON-LD).
 */
export const legalEntity = {
  legalName: "TUM.ai e.V.",
  alternateNames: ["TUM.ai Student Initiative"],
  foundingLocation: "Munich, Germany",
  /** The association's registered seat (the Imprint's address row). */
  registeredOffice: {
    streetAddress: "Arcisstraße 21",
    postalCode: "80333",
    addressLocality: "Munich",
    addressCountry: "Germany",
  },
  /** Where the team works day to day (JSON-LD only). */
  headquarters: {
    streetAddress: "Rosenheimer Str. 116A",
    postalCode: "81669",
    addressLocality: "Munich",
    addressCountry: "Germany",
  },
  /**
   * Entry in the register of associations (Vereinsregister): the Imprint's
   * "Vereinsregisternummer" and the JSON-LD identifier. Confirmed by Justin
   * on 2026-09-28; it replaces the different number the JSON-LD used to carry.
   *
   * TODO(content): the register court (Registergericht) is not named
   * anywhere. Add it here once confirmed, and show it on the Imprint.
   */
  registerNumber: "VR 209059",
  /**
   * The association's mailbox for legal and data-protection requests: the
   * controller contact and the objection address on the Privacy page.
   */
  invoiceEmail: "invoice@tum-ai.com",
  /**
   * Board members authorised to represent the association (Imprint
   * "Vertreter"), as the Imprint lists them.
   */
  representatives: ["Julius Riel", "Elena Rostomashvili", "Nico Kirchner"],
} as const satisfies {
  legalName: string;
  alternateNames: readonly string[];
  foundingLocation: string;
  registeredOffice: PostalAddress;
  headquarters: PostalAddress;
  registerNumber: string;
  invoiceEmail: string;
  representatives: readonly string[];
};

/**
 * The registered office in German postal form, one entry per line
 * ("Arcisstraße 21", "80333 München"), for the German legal pages. The
 * JSON-LD keeps the English `legalEntity.registeredOffice`.
 */
export const registeredOfficeLinesDe = [
  legalEntity.registeredOffice.streetAddress,
  `${legalEntity.registeredOffice.postalCode} München`,
] as const;
