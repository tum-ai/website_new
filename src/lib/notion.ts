import "server-only";
import type { Event, Partner, Research } from "@/lib/types";
import {
  fetchEvents,
  fetchPartners,
  fetchResearchProjects,
} from "@tumai/notion-data";
import { unstable_cache } from "next/cache";

function getNotionCacheKey() {
  return [
    process.env.NOTION_DB_ID ?? "",
    process.env.NOTION_DB_PARTNERS_ID ?? "",
    process.env.NOTION_DB_RESEARCH_ID ?? "",
  ].join("|");
}

export async function getEvents(): Promise<Event[]> {
  return unstable_cache(
    async (): Promise<Event[]> => fetchEvents(),
    ["events", getNotionCacheKey()],
    { revalidate: 300, tags: ["events"] },
  )();
}

export async function getPartners(): Promise<Partner[]> {
  return unstable_cache(
    async (): Promise<Partner[]> => fetchPartners(),
    ["partners", getNotionCacheKey()],
    { revalidate: 900, tags: ["partners"] },
  )();
}

export async function getResearchProjects(): Promise<Research[]> {
  return unstable_cache(
    async (): Promise<Research[]> => fetchResearchProjects(),
    ["research-projects", getNotionCacheKey()],
    { revalidate: 900, tags: ["research-projects"] },
  )();
}
