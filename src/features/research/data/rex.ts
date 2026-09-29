/** Copy for the Research Exchange (REX) band on /research. */
import type { LogoItem } from "@/components/ds";
import type { Organization } from "@/lib/people-and-logos";

/** The REX lead. It names the institutions `rexInstitutions` repeats. */
export const rexLead =
  "Our Research Exchange (REX) Program gives TUM.ai members the chance to do research abroad. Offers range from final theses to research internships with leading labs.";

/** A REX institution: its logo, and the short name prose uses ("Harvard"). */
export type RexInstitution = LogoItem & { shortName: string };

/**
 * The institutions REX offers come from, as the lead's examples, with their
 * official logos: the code source of the REX `organization` documents and
 * the `rex-institutions` logo list (`features/research/rex-content.ts`).
 * Aspect ratios come from each SVG's viewBox; sizes are the files' as Sanity
 * reports them. The homepage names them by `shortName`.
 *
 * They live here, not in the partners' organisation table: this module is
 * reachable from a homepage client island (through `@/features/research`),
 * so it must not import the partners index, which exports server-only
 * getters.
 *
 * TODO(content): confirm we may show these four logos (Harvard, MIT and Inria
 * from Wikimedia Commons, the University of Cambridge from Wikipedia).
 */
export const rexOrganizations: Organization[] = [
  {
    key: "harvard-university",
    name: "Harvard University",
    shortName: "Harvard",
    logo: {
      src: "/assets/research/rex/harvard.svg",
      width: 600,
      height: 165,
      alt: "Harvard University logo",
      aspectRatio: 600 / 165,
    },
  },
  {
    key: "mit",
    name: "MIT",
    shortName: "MIT",
    logo: {
      src: "/assets/research/rex/mit.svg",
      width: 449,
      height: 252,
      alt: "MIT logo",
      aspectRatio: 1473.281 / 829.367,
    },
  },
  {
    key: "university-of-cambridge",
    name: "University of Cambridge",
    shortName: "Cambridge",
    logo: {
      src: "/assets/research/rex/cambridge.svg",
      width: 249,
      height: 53,
      alt: "University of Cambridge logo",
      aspectRatio: 65.974 / 13.978,
    },
  },
  {
    key: "inria",
    name: "Inria",
    shortName: "Inria",
    logo: {
      src: "/assets/research/rex/inria.svg",
      width: 283,
      height: 83,
      alt: "Inria logo",
      aspectRatio: 283.46 / 82.75,
    },
  },
];

/** The REX institutions as logo items with the name prose uses. */
export function rexInstitutionsOf(
  list: readonly Organization[],
): RexInstitution[] {
  return list.map(({ name, shortName, logo }) => ({
    name,
    shortName: shortName ?? name,
    ...(logo
      ? {
          src: logo.src,
          aspectRatio: logo.aspectRatio ?? logo.width / logo.height,
        }
      : {}),
  }));
}

export const rexInstitutions = rexInstitutionsOf(rexOrganizations);

/**
 * One sentence of the REX copy ("We …"), split at its commas into the steps
 * of the process. The clauses stay lower case: they continue the "We".
 */
export const rexProcess = [
  "collect project proposals from our partners,",
  "inform members about the requirements and usual processes,",
  "preselect applicants based on prior relevant (research) experience,",
  "recommend them to our partner labs,",
  "and eventually support their journey abroad with alumni experience in visa processes, housing, etc.",
];

/** Why REX exists, in the program's own words. */
export const rexOrigin =
  "REX started because members were already doing research abroad and recommending others to follow. It works because researchers in our network trust TUM.ai to send them curious minds, and introduce our members to their fields.";
