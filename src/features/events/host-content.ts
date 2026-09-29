import "server-only";

import { buildOrganizationBackfill } from "@/features/partners";
import type { BackfillDocument } from "@/lib/cms-backfill";
import {
  buildLogoListDocument,
  getLogoLists,
} from "@/lib/organization-content";
import {
  eventHostLists,
  type HostArtwork,
  hostArtworkOf,
} from "./data/host-logos";

/**
 * The /events co-host slice: the `event-hosts` logo list, whose
 * organisations' dark logos the hero's reel shows. Code fallback:
 * `data/host-logos.ts`; the organisations are the partners' organisation
 * slice.
 */

/** The hero's co-host artwork: the CMS list, or the code list. */
export async function getHostArtwork(): Promise<HostArtwork> {
  const lists = await getLogoLists({
    lists: eventHostLists,
    label: "the events co-host logos",
    mockDocuments: () => [
      ...buildEventHostBackfill(),
      ...buildOrganizationBackfill(),
    ],
  });
  return hostArtworkOf(lists["event-hosts"]);
}

/** The co-host logo list as a document for `pnpm sanity:backfill`. */
export function buildEventHostBackfill(): BackfillDocument[] {
  return [buildLogoListDocument("event-hosts", eventHostLists["event-hosts"])];
}
