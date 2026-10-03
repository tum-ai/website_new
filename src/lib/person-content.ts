import "server-only";

import { defineQuery } from "next-sanity";
import {
  type BackfillDocument,
  backfillId,
  backfillImage,
} from "./cms-backfill";
import { loadContent } from "./cms-content";
import { CONTENT_IMAGE_PROJECTION } from "./cms-content-model";
import { organizationReference } from "./organization-content";
import type { PersonPlacement } from "./people-and-logos";
import type { PEOPLE_QUERY_RESULT } from "./sanity.types.generated";

/**
 * The `person` content type, shared by the pages that quote or profile
 * people: member stories (/community, also quoted on /apply and the
 * homepage), partner profiles (/partners) and E-Lab testimonials (/e-lab and
 * the homepage). A document belongs to one `placement`; its `key` is the id
 * code uses to pick it (`leon-hergert`), stable across copy edits.
 *
 * Each feature keeps its code list and its own shape, and maps a
 * {@link PersonResult} into that shape; this module holds the query and the
 * backfill builder they share.
 */

export const PEOPLE_QUERY =
  defineQuery(`*[_type == "person" && placement == $placement] | order(order asc){
  key,
  name,
  role,
  context,
  quote,
  story,
  "portrait": portrait${CONTENT_IMAGE_PROJECTION},
  "organization": organization->{
    key,
    name,
    shortName,
    "logo": logo${CONTENT_IMAGE_PROJECTION}
  },
  roleAtOrganization
}`);

/** One person as {@link PEOPLE_QUERY} returns it. */
export type PersonResult = PEOPLE_QUERY_RESULT[number];

/** A person as code writes it for the backfill. */
export type PersonTemplate = {
  /** The id code picks the person by; kebab-case. */
  key: string;
  name: string;
  role: string;
  context?: string;
  quote?: string;
  story?: string;
  /** A shipped `/assets/...` file; `objectPosition` becomes the hotspot. */
  portrait: { src: string; alt?: string; objectPosition?: string };
  /** The key of the organisation the person speaks for or works at. */
  organization?: string;
  /** The role is held at `organization`: pages show "role @ organisation". */
  roleAtOrganization?: true;
};

/** The backfill `_id` of a person: placement and key. */
export function personId(placement: PersonPlacement, key: string): string {
  return backfillId("person", placement, key);
}

/**
 * A kebab-case key from a name. Code lists carry explicit keys; this seeds
 * one, and names test fixtures.
 */
export function personKey(name: string): string {
  return backfillId("person", name).slice("person-".length);
}

/** The documents that recreate a placement's code list, in order. */
export function buildPersonBackfill(
  placement: PersonPlacement,
  people: readonly PersonTemplate[],
): BackfillDocument[] {
  return people.map((person, index) => ({
    _id: personId(placement, person.key),
    _type: "person",
    placement,
    key: person.key,
    order: (index + 1) * 10,
    name: person.name,
    role: person.role,
    ...(person.context ? { context: person.context } : {}),
    ...(person.quote ? { quote: person.quote } : {}),
    ...(person.story ? { story: person.story } : {}),
    portrait: backfillImage(person.portrait.src, {
      alt: person.portrait.alt,
      objectPosition: person.portrait.objectPosition,
    }),
    ...(person.organization
      ? { organization: organizationReference(person.organization) }
      : {}),
    ...(person.roleAtOrganization ? { roleAtOrganization: true } : {}),
  }));
}

/**
 * The people of a placement in the page's shape: the CMS documents in their
 * `order` when the source is `sanity` and the placement has any (each mapped
 * by `select`, which returns `null` for one the page cannot show), otherwise
 * the code list.
 */
export function getPeople<T>({
  placement,
  fallback,
  label,
  mockDocuments,
  select,
}: {
  placement: PersonPlacement;
  fallback: T[];
  label: string;
  mockDocuments: () => readonly BackfillDocument[];
  select: (person: PersonResult) => T | null;
}): Promise<T[]> {
  return loadContent<T[], PEOPLE_QUERY_RESULT>({
    fallback,
    query: PEOPLE_QUERY,
    params: { placement },
    tags: ["content:person", "content:organization"],
    label,
    mockDocuments,
    select: (result) => result.flatMap((person) => select(person) ?? []),
  });
}
