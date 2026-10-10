/**
 * The Research Exchange (REX) institutions on /research. The band's copy is
 * part of the page copy (`research-copy.ts`, `researchCopy.rex`).
 */
import type { LogoItem } from "@tum.ai/ui-kit";
import type { Organization } from "@/lib/people-and-logos";

/**
 * A REX institution: its logo, the short name prose uses ("Harvard") and
 * its organisation's key (the /research globe places it by that).
 */
export type RexInstitution = LogoItem & { key: string; shortName: string };

/** The REX institutions as logo items with the name prose uses. */
export function rexInstitutionsOf(
  list: readonly Organization[],
): RexInstitution[] {
  return list.map(({ key, name, shortName, logo }) => ({
    key,
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
