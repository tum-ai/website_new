import "server-only";

import type { ImagePreload } from "@/lib/image-preload";
import { getSanityEvents } from "@/lib/sanity";
import { indexHosts } from "./events";
import { getHostArtwork } from "./host-content";
import { reelImagePreloads } from "./reel-images";

/**
 * The images of the /events hero reel, for other pages to load ahead: the
 * co-host artwork of every published event, as `EventsHero` fetches it
 * (none while the hero has no reel, under two co-hosts).
 */
export async function getHeroImagePreloads(): Promise<ImagePreload[]> {
  const hosts = indexHosts(await getSanityEvents());
  if (hosts.length < 2) return [];
  return reelImagePreloads(
    await getHostArtwork(hosts.flatMap(({ key }) => (key ? [key] : []))),
  );
}
