import "server-only";

import { createClient } from "next-sanity";
import { unstable_cache } from "next/cache";
import { EVENTS_QUERY, PARTNERS_QUERY, RESEARCH_QUERY } from "./sanity-queries";
import type { Event, Partner, Research } from "./types";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "test-project-id",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-03-01",
  useCdn: false,
});

export async function getSanityResearchProjects(): Promise<Research[]> {
  return unstable_cache(
    async () =>
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
        ? client.fetch(RESEARCH_QUERY)
        : [],
    ["sanity-research-projects"],
    { revalidate: 900, tags: ["research-projects"] },
  )();
}

export async function getSanityEvents(): Promise<Event[]> {
  return unstable_cache(
    async () =>
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
        ? client.fetch(EVENTS_QUERY)
        : [],
    ["sanity-events"],
    {
      revalidate: 300,
      tags: ["events"],
    },
  )();
}

export async function getSanityPartners(): Promise<Partner[]> {
  return unstable_cache(
    async () =>
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
        ? client.fetch(PARTNERS_QUERY)
        : [],
    ["sanity-partners"],
    {
      revalidate: 900,
      tags: ["partners"],
    },
  )();
}
