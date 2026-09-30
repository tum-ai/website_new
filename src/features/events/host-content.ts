import "server-only";

import { organizationsWithKeys } from "@/features/partners";
import { buildOrganizationBackfill } from "@/features/partners/server";
import { getOrganizationsByKey } from "@/lib/organization-content";
import { type HostArtwork, hostArtworkOf } from "./data/host-logos";

/**
 * The /events co-host artwork: the dark logos of the organisations the
 * events reference as co-hosts (`event.coHosts`). The organisations are the
 * partners' organisation slice; the hero orders the co-hosts itself (most
 * events first), so no list decides which or in what order.
 */

/** The artwork of the co-hosts with `keys`: the CMS organisations, or the code's. */
export async function getHostArtwork(
  keys: readonly string[],
): Promise<HostArtwork> {
  if (keys.length === 0) return { logos: {}, icons: {} };
  const organizations = await getOrganizationsByKey({
    keys,
    fallback: organizationsWithKeys(keys),
    label: "the events co-host logos",
    mockDocuments: buildOrganizationBackfill,
  });
  return hostArtworkOf(organizations);
}
