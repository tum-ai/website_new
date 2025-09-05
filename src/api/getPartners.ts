import { Client } from "@notionhq/client";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { kv } from "@vercel/kv";

const notion = new Client({ auth: process.env.NOTION_TOKEN_PARTNERS });
const CACHE_KEY = "notion-partners";
const CACHE_TTL_SECONDS = 60 * 5; // 5 minutes

export default async function handler(_: VercelRequest, res: VercelResponse) {
  try {
    const cachedData = await kv.get(CACHE_KEY);

    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const response = await notion.databases.query({
      database_id: process.env.NOTION_DB_PARTNERS_ID!,
    });

    const data = response.results.map((page: any) => {
      const imageUrl = page.properties?.image?.files?.[0]?.file?.url || "";
      const optimizedImageUrl = imageUrl
        ? `/_vercel/image?url=${encodeURIComponent(
            imageUrl,
          )}&w=256&q=75`
        : "";

      return {
        id: page.id,
        name: page.properties?.name?.title?.[0]?.plain_text || "Untitled",
        link: page.properties?.link?.rich_text?.[0]?.plain_text || "",
        image: optimizedImageUrl,
      };
    });

    await kv.set(CACHE_KEY, data, { ex: CACHE_TTL_SECONDS });

    res.status(200).json(data);
  } catch (error) {
    console.error("Notion API error:", error);
    res.status(500).json({ error: "Failed to fetch Notion data" });
  }
}
