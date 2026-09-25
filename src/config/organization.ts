/**
 * Single source for TUM.ai's headline figures. The landing, Apply and Partners
 * pages and the site JSON-LD read them, so a new count is one edit here.
 * Counts are lower bounds and render with a trailing "+". See "Updating site
 * facts" in docs/contributor-guide.md.
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
