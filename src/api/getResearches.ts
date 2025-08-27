import { Client } from "@notionhq/client";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const notion = new Client({ auth: process.env.NOTION_TOKEN_RESEARCH });

let cache: any[] | null = null;
let lastFetch = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export default async function handler(_: VercelRequest, res: VercelResponse) {
  const now = Date.now();

  if (cache && now - lastFetch < CACHE_TTL) {
    return res.status(200).json(cache);
  }

  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DB_RESEARCH_ID!,
    });

    const data = response.results.map((page: any) => ({
      id: page.id,
      title: page.properties?.title?.title?.[0]?.plain_text || 'Untitled',
      description: page.properties?.desc?.rich_text?.[0]?.plain_text || '',
      image: page.properties?.img?.files?.[0]?.file?.url || '',
      publication: page.properties?.publication?.rich_text?.[0]?.plain_text || '',
      status: page.properties?.status?.select?.name || 'Unknown',
      keywords: page.properties?.keywords?.rich_text?.[0]?.plain_text || '', // <-- add this
    }));


    cache = data;
    lastFetch = now;

    res.status(200).json(data);
  } catch (error) {
    console.error("Notion API error:", error);
    res.status(500).json({ error: "Failed to fetch Notion data" });
  }
}
