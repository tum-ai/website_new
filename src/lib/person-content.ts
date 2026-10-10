import "server-only";
import { defineQuery } from "next-sanity";
import { loadContent } from "./cms-content";
import {
  CONTENT_IMAGE_PROJECTION,
  ContentError,
  contentBoolean,
  contentString,
  optionalString,
  requireArray,
  requireObject,
} from "./cms-content-model";
import type { PersonPlacement } from "./people-and-logos";
import type { PEOPLE_QUERY_RESULT } from "./sanity.types.generated";

/** People are CMS documents; placement and order select the display collection. */
const PEOPLE_QUERY =
  defineQuery(`*[_type == "person" && placement == $placement] | order(order asc){
 key,name,role,context,quote,story,"portrait":portrait${CONTENT_IMAGE_PROJECTION},
 "organizationRef":organization._ref,
 "organization":organization->{key,name,shortName,"logo":logo${CONTENT_IMAGE_PROJECTION}},roleAtOrganization
}`);
/** One projected person. */
export type PersonResult = PEOPLE_QUERY_RESULT[number];
/** Validate identity and attribution before a domain maps its required portrait or quote. */
function readPerson(person: PersonResult, label: string): PersonResult {
  requireObject(person, label);
  contentString(person.key, label, "key");
  contentString(person.name, label, "name");
  contentString(person.role, label, "role");
  for (const field of ["context", "quote", "story"] as const)
    optionalString(person[field], label, field);
  if (person.roleAtOrganization != null)
    contentBoolean(person.roleAtOrganization, label, "roleAtOrganization");
  const ref = (person as PersonResult & { organizationRef?: string | null })
    .organizationRef;
  if (ref && !person.organization)
    throw new ContentError(
      label,
      "organization",
      "unresolved organization reference",
    );
  if (person.roleAtOrganization && !person.organization)
    throw new ContentError(
      label,
      "roleAtOrganization",
      "requires a resolved organization",
    );
  if (person.organization) {
    contentString(person.organization.key, label, "organization.key");
    contentString(person.organization.name, label, "organization.name");
  }
  return person;
}
/** Empty collections stay empty; invalid present records are never replaced by local people. */
export function getPeople<T>({
  placement,
  label,
  select,
}: {
  placement: PersonPlacement;
  label: string;
  select: (person: PersonResult) => T;
}): Promise<T[]> {
  return loadContent<T[], PersonResult[]>({
    query: PEOPLE_QUERY,
    params: { placement },
    tags: ["content:person", "content:organization"],
    label,
    select: (result) => {
      requireArray(result, label);
      return result.map((person) => select(readPerson(person, label)));
    },
  });
}
