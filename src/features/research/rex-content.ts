import "server-only";

import { buildOrganizationBackfill } from "@/features/partners/server";
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
  rexOwnOrganizations,
} from "./data/rex";

/**
 * The REX slice on /research: the institutions' `organization` documents and
 * the `rex-institutions` logo list. Code fallback: `data/rex.ts`; MIT, a
 * partner, is the partners' organisation slice's document. The REX
 * copy (lead, process, origin) is part of `researchCopy` (`content.ts`).
 * Other features read the getter through `../server.ts`.
 */

/** The REX institutions, in order: the CMS list, or the code list. */
export async function getRexInstitutions(): Promise<RexInstitution[]> {
  const lists = await getLogoLists({
    lists: { "rex-institutions": rexOrganizations },
    label: "the REX institutions",
    mockDocuments: () => [
      ...buildRexBackfill(),
      ...buildOrganizationBackfill(),
    ],
  });
  return rexInstitutionsOf(lists["rex-institutions"]);
}

/**
 * The REX-only institutions and the list as documents for
 * `pnpm sanity:backfill` (the list's MIT is the organisation slice's).
 */
export function buildRexBackfill(): BackfillDocument[] {
  return [
    ...rexOwnOrganizations.map(buildOrganizationDocument),
    buildLogoListDocument("rex-institutions", rexOrganizations),
  ];
}
