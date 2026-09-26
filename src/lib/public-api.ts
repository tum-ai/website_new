import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";

/**
 * Shared response handling for the public API (`/api/getNotes`,
 * `/api/getPartners`, `/api/getResearch`).
 *
 * Successful responses may be cached by the CDN for five minutes and served
 * stale for up to a day while it refreshes; browsers always revalidate.
 * Failures are never cached, so the next request retries Sanity.
 */
export const publicApiCacheControl =
  "public, max-age=0, s-maxage=300, stale-while-revalidate=86400";

export async function publicApiResponse(
  /** Plural noun for the error body, e.g. "events": "Failed to fetch events". */
  resource: string,
  load: () => Promise<unknown[]>,
): Promise<Response> {
  try {
    const data = await load();
    return NextResponse.json(data, {
      headers: { "Cache-Control": publicApiCacheControl },
    });
  } catch (error) {
    unstable_rethrow(error);
    console.error(`[api] Could not load ${resource} from Sanity.`, error);
    return NextResponse.json(
      { error: `Failed to fetch ${resource}` },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
