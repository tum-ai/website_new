/**
 * The headline figures as the CMS `siteSettings` document holds them (see
 * `config/site-facts.ts`).
 */
export type OrganizationFacts = {
  readonly foundingYear: number;
  readonly activeMembers: number;
  readonly alumni: number;
  readonly majors: number;
  readonly universities: number;
  readonly nationalities: number;
  readonly acceptanceRate: number;
  readonly startedApplicationsPerBatch: number;
  readonly linkedinAudience: number;
};

/** Everyone who has been an official member: active members plus alumni. */
export function officialMembersOf(
  facts: Pick<OrganizationFacts, "activeMembers" | "alumni">,
): number {
  return facts.activeMembers + facts.alumni;
}

/**
 * The members one recruiting round admits: the started applications times
 * the acceptance rate, rounded to whole people (2100 at 2.3% is 48).
 */
export function admittedPerBatchOf(
  facts: Pick<
    OrganizationFacts,
    "startedApplicationsPerBatch" | "acceptanceRate"
  >,
): number {
  return Math.round(
    (facts.startedApplicationsPerBatch * facts.acceptanceRate) / 100,
  );
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
   */
  registerNumber: "VR 209059",
  /**
   * The court that keeps that register (the Imprint's "Registergericht"),
   * as North Data lists the entry ("Amtsgericht München VR 209059").
   */
  registerCourt: "Amtsgericht München",
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
  registerCourt: string;
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
