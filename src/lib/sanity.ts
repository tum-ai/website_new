import { createClient } from "next-sanity";
import { unstable_cache } from "next/cache";
import type { Event, Partner, Research } from "./types";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "test-project-id",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-03-01",
  useCdn: false,
});

export async function getSanityResearchProjects(): Promise<Research[]> {
  const query = `*[_type == "research"]{
    title,
    "description": desc,
    status,
    publication,
    "keywords": array::join(keywords, ", "),
    "image": img.asset->url
  }`;

  return unstable_cache(
    async () =>
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ? client.fetch(query) : [],
    ["sanity-research-projects"],
    { revalidate: 900, tags: ["research-projects"] },
  )();
}

export async function getSanityEvents(): Promise<Event[]> {
  // Added "id" and "description" aliases so the payload matches the frontend types
  const query = `*[_type == "event"]{
    "id": _id,
    title,
    "description": desc,
    event_date,
    location,
    city,
    category,
    "poster": poster.asset->url,
    "images": select(defined(img.asset) => [img.asset->url], []),
    sign_up,
    detail
  }`;

  return unstable_cache(
    async () =>
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ? client.fetch(query) : [],
    ["sanity-events"],
    {
      revalidate: 300,
      tags: ["events"],
    },
  )();
}

export async function getSanityPartners(): Promise<Partner[]> {
  const query = `*[_type == "partner"]{
    "id": _id,
    name,
    link,
    "image": image.asset->url,
    category
  }`;

  return unstable_cache(
    async () =>
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ? client.fetch(query) : [],
    ["sanity-partners"],
    {
      revalidate: 900,
      tags: ["partners"],
    },
  )();
}
