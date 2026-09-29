import "server-only";

import { unstable_rethrow } from "next/navigation";
import { createClient } from "next-sanity";
import type { BackfillDocument } from "./cms-backfill";
import { mergeOverFallback } from "./cms-content-model";
import {
  isSanityConfigured,
  sanityApiVersion,
  sanityContentDataset,
  sanityProjectId,
} from "./sanity-config";

/**
 * The read path for page content that moves from code to the CMS (FAQs,
 * campaigns, logos, copy): the source gate, the content-dataset client and
 * the fetch-and-merge every content slice uses. Server only; client
 * components receive the result as props. Decision record:
 * docs/adr/0009-cms-content-source.md.
 *
 * Scope: published documents only. Draft mode, Presentation and
 * `<SanityLive>` cover the live dataset (`lib/sanity.ts`), not this one;
 * pages pick up content edits when they revalidate.
 */

/** Where page content comes from. */
export type ContentSource = "code" | "sanity";

/**
 * `CMS_CONTENT_SOURCE`: `code` (the default) renders the code fallbacks and
 * makes no request, exactly the site before the CMS; `sanity` reads the
 * content dataset and lays it over the fallbacks. Server-only and read at
 * render time, so it takes effect with the next build or revalidation.
 * Anything else throws, so a typo fails the build instead of silently
 * serving code.
 */
export function getContentSource(
  value: string | undefined = process.env.CMS_CONTENT_SOURCE,
): ContentSource {
  const source = value?.trim().toLowerCase() || "code";
  if (source === "code" || source === "sanity") return source;
  throw new Error(
    `CMS_CONTENT_SOURCE must be "code" or "sanity", got "${value}"`,
  );
}

/**
 * The content dataset's client (`NEXT_PUBLIC_SANITY_CONTENT_DATASET`, which
 * defaults to the live dataset): published perspective from the CDN, no
 * token, no stega.
 */
export const contentClient = createClient({
  projectId: sanityProjectId,
  dataset: sanityContentDataset,
  apiVersion: sanityApiVersion,
  useCdn: true,
  perspective: "published",
});

export type FetchContentOptions = {
  /** A `defineQuery` GROQ query, so TypeGen types its result. */
  query: string;
  params?: Record<string, unknown>;
  /** Next cache tags, for `revalidateTag` from a future webhook. */
  tags: string[];
  /** Seconds; leave it out to follow the route's `revalidate`. */
  revalidate?: number | false;
  /**
   * The documents the mock CMS queries: the slice's backfill builder. Only
   * called under `USE_MOCK_CMS=1`.
   */
  mockDocuments: () => readonly BackfillDocument[];
  /** What failed to load, for the log line. */
  label: string;
};

/**
 * One query against the content dataset, or `null` when there is nothing to
 * use: no project configured, or the request failed (logged; Next's own
 * control-flow errors are rethrown, as in `lib/sanity.ts`). Callers merge
 * the result over their code fallback, so an outage renders the code copy.
 *
 * Under the mock CMS (`USE_MOCK_CMS=1`, never on Vercel) the query runs with
 * groq-js over `mockDocuments()` instead; a failure there throws, because a
 * deterministic run should fail loudly.
 */
export async function fetchContent<T>({
  query,
  params = {},
  tags,
  revalidate,
  mockDocuments,
  label,
}: FetchContentOptions): Promise<T | null> {
  // Literal env reads, like `loadMockCms()` in lib/sanity.ts: next.config.ts
  // inlines USE_MOCK_CMS at build time, so a normal build drops this branch
  // and ships neither the mock module nor groq-js.
  if (process.env.USE_MOCK_CMS === "1" && !process.env.VERCEL) {
    const { evaluateMockQuery } = await import("./cms-content-mock");
    return evaluateMockQuery<T>(query, params, mockDocuments());
  }

  if (!isSanityConfigured) return null;

  try {
    const result = await contentClient.fetch<T>(query, params, {
      next: { tags, ...(revalidate === undefined ? {} : { revalidate }) },
    });
    return result ?? null;
  } catch (error) {
    unstable_rethrow(error);
    console.error(
      `[cms-content] Could not load ${label}; rendering the code fallback.`,
      error,
    );
    return null;
  }
}

export type LoadContentOptions<T, R> = FetchContentOptions & {
  /** What the page shows without the CMS: the source of truth for the shape. */
  fallback: T;
  /**
   * Shapes the query result like the fallback (drop `null`s, map images
   * with `toContentImage`, fill `{{placeholders}}`). Whatever it leaves
   * empty falls back to code, see `mergeOverFallback`.
   */
  select: (result: R) => unknown;
};

/**
 * The content a slice's `get<X>Content()` returns: `fallback` for the
 * `code` source; otherwise the query result, shaped by `select`, merged
 * over `fallback` (`mergeOverFallback` in `lib/cms-content-model.ts`).
 */
export async function loadContent<T, R>({
  fallback,
  select,
  ...fetchOptions
}: LoadContentOptions<T, R>): Promise<T> {
  if (getContentSource() === "code") return fallback;
  const result = await fetchContent<R>(fetchOptions);
  return mergeOverFallback(fallback, result === null ? null : select(result));
}
