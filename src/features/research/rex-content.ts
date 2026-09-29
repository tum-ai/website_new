import "server-only";

import type { BackfillDocument } from "@/lib/cms-backfill";
import {
  buildLogoListDocument,
  buildOrganizationDocument,
  getLogoLists,
} from "@/lib/organization-content";
import {
  type RexInstitution,
  rexInstitutionsOf,
  rexOrganizations,
} from "./data/rex";

/**
 * The REX slice on /research: the institutions' `organization` documents and
 * the `rex-institutions` logo list. Code fallback: `data/rex.ts`. The REX
 * copy (lead, process, origin) stays in code until `researchCopy` exists.
 *
 * Not exported through `@/features/research`: that index is reachable from a
 * homepage client island, and this module is server-only.
 */

/** The REX institutions, in order: the CMS list, or the code list. */
export async function getRexInstitutions(): Promise<RexInstitution[]> {
  const lists = await getLogoLists({
    lists: { "rex-institutions": rexOrganizations },
    label: "the REX institutions",
    mockDocuments: buildRexBackfill,
  });
  return rexInstitutionsOf(lists["rex-institutions"]);
}

/** The REX institutions and their list as documents for `pnpm sanity:backfill`. */
export function buildRexBackfill(): BackfillDocument[] {
  return [
    ...rexOrganizations.map(buildOrganizationDocument),
    buildLogoListDocument("rex-institutions", rexOrganizations),
  ];
}
