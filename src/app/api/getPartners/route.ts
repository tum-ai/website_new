import { publicApiResponse } from "@/lib/public-api";
import { getPublishedPartners } from "@/lib/sanity";

/**
 * Public API: every published partner as a JSON array of `PublicPartner`
 * (`PUBLIC_PARTNERS_QUERY` in lib/sanity-queries.ts).
 *
 * The response shape is stable for existing consumers. Always the published
 * perspective, even for a browser with a draft-mode cookie. On a CMS error it
 * answers 500 with `{ "error": "Failed to fetch partners" }`.
 */
export function GET(): Promise<Response> {
  return publicApiResponse("partners", getPublishedPartners);
}
