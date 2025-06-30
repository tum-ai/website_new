import { Client } from "@notionhq/client";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const notion = new Client({ auth: process.env.NOTION_TOKEN_PARTNERS });

let cache: any[] | null = null;
let lastFetch = 0;
const CACHE_TTL = 1000 * 60 * 5;

export default async function handler(_: VercelRequest, res: VercelResponse) {
  const now = Date.now();

  if (cache && now - lastFetch < CACHE_TTL) {
    return res.status(200).json(cache);
  }

  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DB_PARTNERS_ID!,
    });

    const data = response.results.map((page: any) => ({
      id: page.id,
      name: page.properties?.name?.title?.[0]?.plain_text || "Untitled",
      link: page.properties?.link?.rich_text?.[0]?.plain_text || "",
      image: page.properties?.image?.files?.[0]?.file?.url || "",
    }));

    cache = data;
    lastFetch = now;

    res.status(200).json(data);
  } catch (error) {
    console.error("Notion API error:", error);
    res.status(500).json({ error: "Failed to fetch Notion data" });
  }
}
