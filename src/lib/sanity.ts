import "server-only";

import { createClient } from "next-sanity";
import {
  type LivePerspective,
  defineLive,
  resolvePerspectiveFromCookies,
} from "next-sanity/live";
import { cookies, draftMode } from "next/headers";
import { EVENTS_QUERY, PARTNERS_QUERY, RESEARCH_QUERY } from "./sanity-queries";
import type { Event, Partner, Research } from "./types";

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "test-project-id";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = "2024-03-01";
const readToken = process.env.SANITY_API_READ_TOKEN;

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
  serverToken: readToken || false,
  browserToken: readToken || false,
});

async function getFetchOptions(): Promise<{
  perspective: LivePerspective;
  stega: boolean;
}> {
  const { isEnabled } = await draftMode();

  if (!isEnabled || !readToken) {
    return { perspective: "published", stega: false };
  }

  const perspective = await resolvePerspectiveFromCookies({
    cookies: await cookies(),
  });

  return {
    perspective: perspective ?? "drafts",
    stega: true,
  };
}

async function fetchSanityList<T>(query: string, tags: string[]): Promise<T[]> {
  if (!isSanityConfigured) {
    return [];
  }

  const { perspective, stega } = await getFetchOptions();
  const { data } = await sanityFetch({ query, perspective, stega, tags });

  return Array.isArray(data) ? (data as T[]) : [];
}

export async function getSanityResearchProjects(): Promise<Research[]> {
  return fetchSanityList<Research>(RESEARCH_QUERY, ["research-projects"]);
}

export async function getSanityEvents(): Promise<Event[]> {
  return fetchSanityList<Event>(EVENTS_QUERY, ["events"]);
}

export async function getSanityPartners(): Promise<Partner[]> {
  return fetchSanityList<Partner>(PARTNERS_QUERY, ["partners"]);
}
