import "server-only";

import { getLogoLists } from "@/lib/organization-content";
import { type RexInstitution, rexInstitutionsOf } from "./data/rex";

/** The published REX logo list in editorial order; a removed list stays empty. */
export async function getRexInstitutions(): Promise<RexInstitution[]> {
  const lists = await getLogoLists({
    surfaces: ["rex-institutions"],
    label: "the REX institutions",
  });
  return rexInstitutionsOf(lists["rex-institutions"] ?? []);
}
