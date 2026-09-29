/**
 * The Research Exchange (REX) institutions on /research. The band's copy is
 * part of the page copy (`research-copy.ts`, `researchCopy.rex`).
 */
import type { LogoItem } from "@/components/ds";
import type { Organization } from "@/lib/people-and-logos";

/** A REX institution: its logo, and the short name prose uses ("Harvard"). */
export type RexInstitution = LogoItem & { shortName: string };

/**
 * The institutions REX offers come from, as the lead's examples, with their
 * official logos: the code source of the REX `organization` documents and
 * the `rex-institutions` logo list (`features/research/rex-content.ts`).
 * Aspect ratios come from each SVG's viewBox; sizes are the files' as Sanity
 * reports them. The homepage names them by `shortName`.
 *
 * They live here, not in the partners' organisation table, which holds the
 * partners' logo lists; the lead in the page copy names them.
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
