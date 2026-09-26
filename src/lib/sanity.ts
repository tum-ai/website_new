import "server-only";

import { cookies, draftMode } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { createClient } from "next-sanity";
import {
  defineLive,
  type LivePerspective,
  resolvePerspectiveFromCookies,
} from "next-sanity/live";
import { getMockCmsNow } from "./mock-cms-env";
import { omitNulls } from "./omit-nulls";
import type {
  EVENTS_QUERY_RESULT,
  PARTNERS_QUERY_RESULT,
  RESEARCH_PARTNERS_QUERY_RESULT,
  RESEARCH_QUERY_RESULT,
} from "./sanity.types.generated";
import {
  EVENTS_QUERY,
  PARTNERS_QUERY,
  PUBLIC_EVENTS_QUERY,
  PUBLIC_PARTNERS_QUERY,
  PUBLIC_RESEARCH_QUERY,
  RESEARCH_PARTNERS_QUERY,
  RESEARCH_QUERY,
} from "./sanity-queries";
import type {
  Event,
  Partner,
  PublicEvent,
  PublicPartner,
  PublicResearch,
  ResearchProject,
} from "./types";

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "test-project-id";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = "2024-03-01";

/**
 * Server-side read token (Viewer rights): fetches drafts in draft mode and
 * validates the Presentation tool's preview secret. Never sent to the
 * browser. Without it, draft mode is unavailable and pages show published
 * content only.
 */
export function getSanityReadToken(): string | undefined {
  return process.env.SANITY_API_READ_TOKEN || undefined;
}

/**
 * Optional, separate Viewer token that `<SanityLive>` hands to the browser for
 * live draft updates outside the Presentation tool. Unset (the default), no
 * token reaches the browser: Presentation still previews drafts, and pages
 * outside it refresh on published changes only.
 */
const browserToken = process.env.SANITY_API_BROWSER_TOKEN || false;

export const isSanityConfigured = Boolean(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
);

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  stega: {
    studioUrl: "/studio",
  },
});

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: getSanityReadToken() ?? false,
  browserToken,
});

type FetchOptions = { perspective: LivePerspective; stega: boolean };

const published: FetchOptions = { perspective: "published", stega: false };

/** Drafts (with stega for click-to-edit) in draft mode, published otherwise. */
async function getPageFetchOptions(): Promise<FetchOptions> {
  const { isEnabled } = await draftMode();

  if (!isEnabled || !getSanityReadToken()) {
    return published;
  }

  const perspective = await resolvePerspectiveFromCookies({
    cookies: await cookies(),
  });

  return {
    perspective: perspective ?? "drafts",
    stega: true,
  };
}

/** Runs a list query. Throws when the request fails. */
async function querySanityList<T>(
  query: string,
  tags: string[],
  options: FetchOptions,
): Promise<T[]> {
  const { data } = await sanityFetch({ query, tags, ...options });
  return Array.isArray(data) ? (data as T[]) : [];
}

/**
 * A list for a page. The error policy for every CMS-backed page: a CMS
 * failure is logged and yields `[]`, so the page renders its empty state
 * instead of an error page (and a build still succeeds during an outage).
 * Next's own control-flow errors (dynamic rendering bail-outs, redirects,
 * not-found) are rethrown untouched.
 *
 * Without a Sanity project ID there is nothing to fetch, so this returns `[]`
 * without a request.
 */
async function fetchSanityList<T>(
  query: string,
  tags: string[],
  label: string,
): Promise<T[]> {
  if (!isSanityConfigured) {
    return [];
  }

  try {
    return await querySanityList<T>(query, tags, await getPageFetchOptions());
  } catch (error) {
    unstable_rethrow(error);
    console.error(
      `[sanity] Could not load ${label}; rendering the page without them.`,
      error,
    );
    return [];
  }
}

/**
 * Local fixtures instead of Sanity: opt-in with `USE_MOCK_CMS=1`, never on
 * Vercel. The fixtures load on demand, so a normal request never evaluates
 * them.
 *
 * The condition reads `process.env.USE_MOCK_CMS` directly (not through a
 * helper) so a build-time replacement can fold it: with
 * `compiler.defineServer` setting it in next.config.ts, a build without
 * `USE_MOCK_CMS=1` drops the branch and emits no fixture chunk at all.
 */
function loadMockCms() {
  if (process.env.USE_MOCK_CMS === "1" && !process.env.VERCEL) {
    return import("./mock-cms");
  }
  return null;
}

export async function getSanityEvents(): Promise<Event[]> {
  const mock = await loadMockCms();
  if (mock) return mock.getMockEvents(getMockCmsNow(process.env));

  const events = await fetchSanityList<EVENTS_QUERY_RESULT[number]>(
    EVENTS_QUERY,
    ["events"],
    "events",
  );
  return events.map(omitNulls);
}

export async function getSanityResearchProjects(): Promise<ResearchProject[]> {
  const mock = await loadMockCms();
  if (mock) return mock.getMockResearchProjects();

  const projects = await fetchSanityList<RESEARCH_QUERY_RESULT[number]>(
    RESEARCH_QUERY,
    ["research-projects"],
    "research projects",
  );
  return projects.map(omitNulls);
}

export async function getSanityPartners(): Promise<Partner[]> {
  const mock = await loadMockCms();
  if (mock) return mock.getMockPartners();

  const partners = await fetchSanityList<PARTNERS_QUERY_RESULT[number]>(
    PARTNERS_QUERY,
    ["partners"],
    "partners",
  );
  return partners.map(omitNulls);
}

/** Partners in the "Research Partners" category, for /research. */
export async function getSanityResearchPartners(): Promise<Partner[]> {
  const mock = await loadMockCms();
  if (mock) return mock.getMockResearchPartners();

  const partners = await fetchSanityList<
    RESEARCH_PARTNERS_QUERY_RESULT[number]
  >(RESEARCH_PARTNERS_QUERY, ["partners"], "research partners");
  return partners.map(omitNulls);
}

/**
 * Published content for the public API routes. Unlike the page fetchers,
 * these ignore draft mode (a Studio draft cookie never leaks drafts into the
 * API), ignore the mock CMS, keep `null` fields as the frozen response shape
 * has them, and throw on failure so the route answers 500 instead of caching
 * an empty list.
 */
async function fetchPublishedList<T>(
  query: string,
  tags: string[],
): Promise<T[]> {
  if (!isSanityConfigured) {
    return [];
  }
  return querySanityList<T>(query, tags, published);
}

export function getPublishedEvents(): Promise<PublicEvent[]> {
  return fetchPublishedList<PublicEvent>(PUBLIC_EVENTS_QUERY, ["events"]);
}

export function getPublishedPartners(): Promise<PublicPartner[]> {
  return fetchPublishedList<PublicPartner>(PUBLIC_PARTNERS_QUERY, ["partners"]);
}

export function getPublishedResearch(): Promise<PublicResearch[]> {
  return fetchPublishedList<PublicResearch>(PUBLIC_RESEARCH_QUERY, [
    "research-projects",
  ]);
}
