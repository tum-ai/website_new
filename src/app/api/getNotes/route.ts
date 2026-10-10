import { publicApiResponse } from "@/lib/public-api";
import { getPublishedEvents } from "@/lib/sanity";

/**
 * Public API: every published event as a JSON array of `PublicEvent`
 * (`PUBLIC_EVENTS_QUERY` in lib/sanity-queries.ts).
 *
 * The name is legacy (it returns events, not notes) and stays for existing
 * consumers, as does the response shape. Always the published perspective,
 * even for a browser with a draft-mode cookie. On a CMS error it answers 500
 * with `{ "error": "Failed to fetch events" }`.
 */
export function GET(): Promise<Response> {
  return publicApiResponse("events", getPublishedEvents);
}
