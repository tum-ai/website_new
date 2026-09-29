/**
 * Placeholders for site facts inside editable copy.
 *
 * Some copy states a fact that lives in `src/config` (the recruiting dates,
 * the E-Lab deadline, a role email). When that copy moves to the CMS, the
 * fact must stay derived, or the next config edit leaves the CMS text stale.
 * So the copy keeps a placeholder, `{{eLab.deadline}}`, and the page fills
 * it from the config when it renders:
 *
 * - the names live here, so the Studio (schemas import `lib`) can list and
 *   validate them, and TypeScript checks that every name has a value;
 * - the values live in `src/config/content-tokens.ts`, built from the facts;
 * - code fallbacks use the same templates, so the code and the CMS render
 *   the same sentence (the parity tests compare them).
 *
 * Add a name here and its value in `config/content-tokens.ts` together.
 * Never rename a name that the CMS may already use.
 */

/** Every placeholder name editors may use, as `{{name}}`. */
export const contentTokenNames = [
  "recruiting.application",
  "recruiting.interview",
  "recruiting.onboarding",
  "contact.recruitmentEmail",
  "eLab.programWeeks",
  "eLab.deadline",
  "eLab.programSummary",
  "eLab.completedCohorts",
  "eLab.ventureFundingMillions",
  "org.foundingYear",
  "org.activeMembers",
  "org.alumni",
  "org.officialMembers",
  "org.majors",
  "org.universities",
  "org.nationalities",
  "impact.publications",
  "impact.publicationVenues",
  "impact.hackathonParticipants",
  "community.makeathonSize",
  "community.startedApplications",
  "community.acceptanceRate",
] as const;

type ContentTokenName = (typeof contentTokenNames)[number];

/** The value of every placeholder, from the site config. */
export type ContentTokens = Readonly<Record<ContentTokenName, string>>;

const placeholder = /\{\{\s*([\w.-]+)\s*\}\}/g;

const isTokenName = (name: string): name is ContentTokenName =>
  (contentTokenNames as readonly string[]).includes(name);

/** The placeholder names a template uses, in order, known or not. */
export function templateTokenNames(template: string): string[] {
  return [...template.matchAll(placeholder)].map((match) => match[1]);
}

/** The placeholder names in `template` that {@link contentTokenNames} lacks. */
export function unknownTokenNames(template: string): string[] {
  return templateTokenNames(template).filter((name) => !isTokenName(name));
}

/**
 * `template` with every `{{name}}` replaced by its value, or `null` when it
 * uses an unknown name. Use it for CMS text, where a typo must not reach the
 * page as a raw placeholder: the caller drops or replaces that text.
 */
export function fillTemplate(
  template: string,
  tokens: ContentTokens,
): string | null {
  if (unknownTokenNames(template).length > 0) return null;
  return template.replace(
    placeholder,
    (_, name: ContentTokenName) => tokens[name],
  );
}

/**
 * {@link fillTemplate} for templates in code, which a developer controls:
 * an unknown name throws, so the mistake fails the tests and the build.
 */
export function fillCodeTemplate(
  template: string,
  tokens: ContentTokens,
): string {
  const filled = fillTemplate(template, tokens);
  if (filled === null) {
    throw new Error(
      `Unknown content token(s) ${unknownTokenNames(template).join(", ")} in "${template}"; add them to lib/content-tokens.ts`,
    );
  }
  return filled;
}
