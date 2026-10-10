import "server-only";

import { defineQuery } from "next-sanity";
import { cache } from "react";
import { getContentTokens } from "@/config/content-tokens";
import { loadContent } from "@/lib/cms-content";
import {
  contentObject,
  contentString,
  parseContent,
} from "@/lib/cms-content-model";
import { fillCmsCopy } from "@/lib/content-copy";
import type { EVENTS_COPY_QUERY_RESULT } from "@/lib/sanity.types.generated";
import { type EventsCopy, eventsPageTokens } from "./copy-model";

/**
 * The /events content slice: the `eventsCopy` singleton (the hero's empty
 * lead, section titles and leads, the closing). The events come from `lib/sanity.ts`.
 */

export const EVENTS_COPY_QUERY = defineQuery(`*[_id == "eventsCopy"][0]{
  hero{ emptyLead },
  upcoming{ title, empty },
  past{ title, lead },
  posters{ title, lead },
  closing{ title, lead, studentsReader, nextUp, membership }
}`);

const eventsCopyParser = contentObject({
  hero: contentObject({ emptyLead: contentString }),
  upcoming: contentObject({ title: contentString, empty: contentString }),
  past: contentObject({ title: contentString, lead: contentString }),
  posters: contentObject({ title: contentString, lead: contentString }),
  closing: contentObject({
    title: contentString,
    lead: contentString,
    studentsReader: contentString,
    nextUp: contentString,
    membership: contentString,
  }),
});

/**
 * The /events copy: the published CMS `eventsCopy`, site facts
 * filled, the page tokens left for the sections. Cached per render: the
 * sections each read it (`events-page.tsx` passes no copy down).
 */
export const getEventsCopy = cache(async (): Promise<EventsCopy> => {
  const tokens = await getContentTokens();
  return loadContent<EventsCopy, EVENTS_COPY_QUERY_RESULT>({
    query: EVENTS_COPY_QUERY,
    tags: ["content:eventsCopy"],
    label: "the /events copy",
    select: (result) =>
      parseContent(
        fillCmsCopy(result, tokens, "the /events copy", eventsPageTokens),
        eventsCopyParser,
        "the /events copy",
      ),
  });
});
