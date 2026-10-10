import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { cacheTagsForType } from "@/lib/cache-tags";

/**
 * On-demand revalidation for a Sanity GROQ webhook (sanity.io/manage, API,
 * Webhooks; one on the site's dataset, projection `{_type}`, the secret in
 * `SANITY_REVALIDATE_SECRET`). A published change expires the cache tags of
 * its document type (`lib/cache-tags.ts`): every page whose render fetched
 * that type regenerates on its next request, static routes included (Next
 * records a fetch's `next.tags` on the prerendered route).
 *
 * `parseBody` checks the `sanity-webhook-signature` header against the
 * secret and then waits about 3 seconds for the API CDN to serve the change,
 * so the regenerated pages read it.
 *
 * - 503: `SANITY_REVALIDATE_SECRET` is not set on this deployment.
 * - 401: the signature is missing or does not match.
 * - 400: the body is not JSON or names no document type.
 * - 200: `{ revalidated: true, tags }` (an unknown type expires only its
 *   own, unused `content:<type>` tag).
 */
export async function POST(request: NextRequest): Promise<Response> {
  const secret = process.env.SANITY_REVALIDATE_SECRET?.trim();
  if (!secret) {
    return json(
      {
        message:
          "Revalidation is not available: SANITY_REVALIDATE_SECRET is not set on this deployment.",
      },
      503,
    );
  }

  let parsed: Awaited<ReturnType<typeof parseBody<{ _type?: unknown }>>>;
  try {
    parsed = await parseBody<{ _type?: unknown }>(request, secret);
  } catch {
    return json({ message: "The body is not JSON." }, 400);
  }
  if (parsed.isValidSignature !== true) {
    return json({ message: "Invalid signature." }, 401);
  }

  const tags = cacheTagsForType(parsed.body?._type);
  if (tags.length === 0) {
    return json({ message: "The body names no document type." }, 400);
  }
  for (const tag of tags) {
    // Expire now rather than serving stale: the edit should show on the
    // next request (the pattern Next documents for webhooks).
    revalidateTag(tag, { expire: 0 });
  }
  return json({ revalidated: true, tags }, 200);
}

function json(body: unknown, status: number): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
