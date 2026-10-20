import { publicApiResponse } from "@/lib/public-api";
import { getPublishedResearch } from "@/lib/sanity";

/**
 * Public API: every published research project as a JSON array of
 * `PublicResearch` (`PUBLIC_RESEARCH_QUERY` in lib/sanity-queries.ts);
 * `keywords` is one ", "-joined string.
 *
 * The response shape is stable for existing consumers. Always the published
 * perspective, even for a browser with a draft-mode cookie. On a CMS error it
 * answers 500 with `{ "error": "Failed to fetch research" }`.
 */
export function GET(): Promise<Response> {
  return publicApiResponse("research", getPublishedResearch);
}
