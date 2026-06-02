import { createClient } from 'next-sanity';
import { unstable_cache } from 'next/cache';
import type { Research } from './types';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-03-01',
  useCdn: false,
});

export async function getSanityResearchProjects(): Promise<Research[]> {
  const query = `*[_type == "research"]{
    title,
    "description": desc,
    status,
    publication,
    keywords,
    "image": img.asset->url
  }`;

  return unstable_cache(
    async () => client.fetch(query),
    ["sanity-research-projects"],
    { revalidate: 900, tags: ["research-projects"] }
  )();
}