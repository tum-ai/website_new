import { Client } from '@notionhq/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const notion = new Client({ auth: process.env.NOTION_TOKEN_PARTNERS });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DB_PARTNERS_ID!,
    });

    res.status(200).json(response.results);
  } catch (err) {
    console.error("Notion API error:", err);
    res.status(500).json({ error: "Failed to fetch Notion data" });
  }
}