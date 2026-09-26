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
 *
 * TODO(content): confirm the registered-office spelling. Config says
 * "Arcisstr. 21"; the Privacy page spells it "Arcistrasse".
 */
export const legalEntity = {
  legalName: "TUM.ai e.V.",
  alternateNames: ["TUM.ai Student Initiative"],
  foundingLocation: "Munich, Germany",
  /** The association's registered seat (the Imprint's address row). */
  registeredOffice: {
    streetAddress: "Arcisstr. 21",
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
   * Board members authorised to represent the association (Imprint
   * "Vertreter"), as the Imprint lists them.
   *
   * TODO(content): confirm this is the current board.
   */
  representatives: [
    "Sami Haddouti",
    "Julian Sikora",
    "William Homburg",
    "Luca Fink",
  ],
} as const satisfies {
  legalName: string;
  alternateNames: readonly string[];
  foundingLocation: string;
  registeredOffice: PostalAddress;
  headquarters: PostalAddress;
  representatives: readonly string[];
};

/**
 * TODO(content): the register number is UNCONFIRMED. The Imprint prints
 * "VR209059" and the JSON-LD has always said "VR 210726"; at most one is
 * right. This module deliberately does not pick one: each consumer keeps the
 * value it showed before. Once Justin confirms the number, replace this with a
 * single `legalEntity.registerNumber`, point the Imprint and JSON-LD at it,
 * and drop the Imprint's allowlist entry in test/content-facts.test.ts.
 */
export const unconfirmedRegisterNumbers = {
  imprint: "VR209059",
  jsonLd: "VR 210726",
} as const;
