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
} as const;

/** Everyone who has been an official member: active members plus alumni. */
export const officialMembers =
  organizationFacts.activeMembers + organizationFacts.alumni;

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
