import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Turns draft mode off (`previewMode.disable` in the Presentation tool) and
 * redirects to `?redirect=<path>`, or to the homepage. Only same-origin
 * paths are followed, so the route cannot be used as an open redirect.
 */
export async function GET(request: Request): Promise<Response> {
  (await draftMode()).disable();

  return NextResponse.redirect(redirectTarget(request));
}

function redirectTarget(request: Request): URL {
  const requestUrl = new URL(request.url);
  const path = requestUrl.searchParams.get("redirect");

  if (path?.startsWith("/")) {
    const target = new URL(path, requestUrl);
    if (target.origin === requestUrl.origin) return target;
  }

  return new URL("/", requestUrl);
}
