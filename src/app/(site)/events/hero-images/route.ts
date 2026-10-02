import { getHeroImagePreloads } from "@/features/events/events-page";

/**
 * The /events hero reel's images as JSON (`ImagePreload[]`), for the site
 * layout's `RouteImagePreload` to load ahead on other pages. Internal, not a
 * public API: the shape follows the hero. Cached like the page (ISR every 5
 * minutes, and the events' cache tags on publish).
 */
export const dynamic = "force-static";
export const revalidate = 300;

export async function GET(): Promise<Response> {
  return Response.json(await getHeroImagePreloads());
}
