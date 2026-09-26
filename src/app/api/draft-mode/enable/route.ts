import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client, getSanityReadToken } from "@/lib/sanity";

/**
 * Turns on draft mode for the Studio's Presentation tool
 * (`previewMode.enable` in src/sanity/sanity.config.ts). next-sanity checks
 * the preview secret against Sanity with the server read token, then sets
 * the draft-mode cookies and redirects to the previewed page.
 *
 * Without `SANITY_API_READ_TOKEN` the secret cannot be checked and drafts
 * cannot be read, so the route answers 503 with a short explanation instead
 * of failing inside next-sanity.
 */
export async function GET(request: Request): Promise<Response> {
  const token = getSanityReadToken();

  if (!token) {
    return new Response(
      "Draft mode is not available: SANITY_API_READ_TOKEN is not set on this deployment.",
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "text/plain; charset=utf-8",
        },
      },
    );
  }

  const { GET: enableDraftMode } = defineEnableDraftMode({
    client: client.withConfig({ token }),
  });
  return enableDraftMode(request);
}
