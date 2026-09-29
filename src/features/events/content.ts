import "server-only";

import { defineQuery } from "next-sanity";
import { cache } from "react";
import { getContentTokens } from "@/config/content-tokens";
import type { BackfillDocument } from "@/lib/cms-backfill";
import { loadContent } from "@/lib/cms-content";
import { fillCmsCopy, fillCodeCopy } from "@/lib/content-copy";
import type { EVENTS_COPY_QUERY_RESULT } from "@/lib/sanity.types.generated";
import {
  type EventsCopy,
  eventsCopyTemplate,
  eventsPageTokens,
} from "./data/copy";

/**
 * The /events content slice: the `eventsCopy` singleton (the hero's empty
 * lead, section titles and leads, the closing). The events come from the live dataset; the code
 * fallback is `data/copy.ts`.
 */

export const EVENTS_COPY_QUERY = defineQuery(`*[_id == "eventsCopy"][0]{
  hero{ emptyLead },
  upcoming{ title, empty },
  past{ title, lead },
  posters{ title, lead },
  closing{ title, lead, studentsReader, nextUp, membership }
}`);

/**
 * The /events copy: the CMS `eventsCopy` over the code copy, site facts
 * filled, the page tokens left for the sections. Cached per render: the
 * sections each read it (`events-page.tsx` passes no copy down).
 */
export const getEventsCopy = cache(async (): Promise<EventsCopy> => {
  const tokens = await getContentTokens();
  return loadContent<EventsCopy, EVENTS_COPY_QUERY_RESULT>({
    fallback: fillCodeCopy(eventsCopyTemplate, tokens, eventsPageTokens),
    query: EVENTS_COPY_QUERY,
    tags: ["content:eventsCopy"],
    label: "the /events copy",
    mockDocuments: buildEventsBackfill,
    select: (result) =>
      fillCmsCopy(result, tokens, "the /events copy", eventsPageTokens),
  });
});

/** The /events copy as a document for `pnpm sanity:backfill`. */
export function buildEventsBackfill(): BackfillDocument[] {
  return [{ _id: "eventsCopy", _type: "eventsCopy", ...eventsCopyTemplate }];
}
