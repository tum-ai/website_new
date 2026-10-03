import "server-only";
import { defineQuery } from "next-sanity";
import { loadContent } from "./cms-content";
import {
  CONTENT_IMAGE_PROJECTION,
  ContentError,
  optionalString,
  requireArray,
  requireBoolean,
  requireObject,
  requireString,
} from "./cms-content-model";
import type { PersonPlacement } from "./people-and-logos";
import type { PEOPLE_QUERY_RESULT } from "./sanity.types.generated";
/** People are CMS documents; placement and order select the display collection. */
export const PEOPLE_QUERY =
  defineQuery(`*[_type == "person" && placement == $placement] | order(order asc){
 key,name,role,context,quote,story,"portrait":portrait${CONTENT_IMAGE_PROJECTION},
 "organizationRef":organization._ref,
 "organization":organization->{key,name,shortName,"logo":logo${CONTENT_IMAGE_PROJECTION}},roleAtOrganization
}`);
/** One projected person. */
export type PersonResult = PEOPLE_QUERY_RESULT[number];
/** Stable historical person id used by migration tools. */
export function personId(placement: PersonPlacement, key: string): string {
  return `person-${placement}-${key}`;
}
/** Validate identity and attribution before a domain maps its required portrait or quote. */
export function readPerson(person: PersonResult, label: string): PersonResult {
  requireObject(person, label);
  requireString(person.key, label, "key");
  requireString(person.name, label, "name");
  requireString(person.role, label, "role");
  for (const field of ["context", "quote", "story"] as const)
    optionalString(person[field], label, field);
  if (person.roleAtOrganization != null)
    requireBoolean(person.roleAtOrganization, label, "roleAtOrganization");
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
    requireString(person.organization.key, label, "organization.key");
    requireString(person.organization.name, label, "organization.name");
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
