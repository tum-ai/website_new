/**
 * Notion Data Fetcher for Astro SSG
 *
 * This script runs at build time to:
 * 1. Fetch data from Notion databases (Events, Research, Partners)
 * 2. Download images to /public/cms/ with content-hashed filenames
 * 3. Generate JSON files in /src/data/generated/ for Astro pages
 *
 * Run with: npm run fetch-notion
 */

import { Client } from "@notionhq/client";
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const PUBLIC_CMS_DIR = path.join(ROOT_DIR, "public", "cms");
const GENERATED_DATA_DIR = path.join(ROOT_DIR, "src", "data", "generated");

// Ensure directories exist
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Generate a short hash from URL for filename
function hashUrl(url: string): string {
  return crypto.createHash("md5").update(url).digest("hex").slice(0, 12);
}

// Get file extension from URL or content-type
function getExtension(url: string): string {
  const urlPath = new URL(url).pathname;
  const ext = path.extname(urlPath);
  if (ext && [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(ext.toLowerCase())) {
    return ext;
  }
  // Default to .jpg for Notion images
  return ".jpg";
}

// Download image and return local path
async function downloadImage(
  url: string,
  category: string
): Promise<string | null> {
  if (!url) return null;

  try {
    const hash = hashUrl(url);
    const ext = getExtension(url);
    const filename = `${hash}${ext}`;
    const categoryDir = path.join(PUBLIC_CMS_DIR, category);
    ensureDir(categoryDir);

    const localPath = path.join(categoryDir, filename);
    const publicPath = `/cms/${category}/${filename}`;

    // Skip if already downloaded
    if (fs.existsSync(localPath)) {
      console.log(`  ✓ Already exists: ${filename}`);
      return publicPath;
    }

    console.log(`  ↓ Downloading: ${filename}`);
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`  ✗ Failed to download: ${url}`);
      return null;
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(localPath, Buffer.from(buffer));

    return publicPath;
  } catch (error) {
    console.error(`  ✗ Error downloading image: ${error}`);
    return null;
  }
}

// ============================================================================
// EVENTS FETCHER
// ============================================================================

interface NotionEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  city: string;
  category: string;
  image: string;
  poster: string;
  sign_up: string;
  detail: string;
}

async function fetchEvents(notion: Client, databaseId: string): Promise<NotionEvent[]> {
  console.log("\n📅 Fetching Events from Notion...");

  const response = await notion.databases.query({
    database_id: databaseId,
  });

  const events: NotionEvent[] = [];

  for (const page of response.results) {
    if (!("properties" in page)) continue;

    const props = page.properties as any;

    // Get image URL from Notion
    const notionImageUrl = props?.img?.files?.[0]?.file?.url ||
      props?.img?.files?.[0]?.external?.url || "";
    const notionPosterUrl = props?.poster?.files?.[0]?.file?.url ||
      props?.poster?.files?.[0]?.external?.url || "";

    // Download images
    const localImage = await downloadImage(notionImageUrl, "events");
    const localPoster = await downloadImage(notionPosterUrl, "events");

    events.push({
      id: page.id,
      title: props?.title?.title?.[0]?.plain_text || "Untitled",
      description: props?.desc?.rich_text?.[0]?.plain_text || "",
      event_date: props?.event_date?.date?.start || "",
      location: props?.location?.rich_text?.[0]?.plain_text || "",
      city: props?.city?.rich_text?.[0]?.plain_text || "",
      category: props?.category?.rich_text?.[0]?.plain_text || "",
      image: localImage || "",
      poster: localPoster || "",
      sign_up: props?.sign_up?.rich_text?.[0]?.plain_text || "",
      detail: props?.detail?.rich_text?.[0]?.plain_text || "",
    });
  }

  console.log(`  ✓ Fetched ${events.length} events`);
  return events;
}

// ============================================================================
// RESEARCH FETCHER
// ============================================================================

interface NotionResearch {
  id: string;
  title: string;
  description: string;
  image: string;
  publication: string;
  status: string;
  keywords: string;
}

async function fetchResearch(notion: Client, databaseId: string): Promise<NotionResearch[]> {
  console.log("\n🔬 Fetching Research from Notion...");

  const response = await notion.databases.query({
    database_id: databaseId,
  });

  const research: NotionResearch[] = [];

  for (const page of response.results) {
    if (!("properties" in page)) continue;

    const props = page.properties as any;

    // Get image URL from Notion
    const notionImageUrl = props?.img?.files?.[0]?.file?.url ||
      props?.img?.files?.[0]?.external?.url || "";

    // Download image
    const localImage = await downloadImage(notionImageUrl, "research");

    research.push({
      id: page.id,
      title: props?.title?.title?.[0]?.plain_text || "Untitled",
      description: props?.desc?.rich_text?.[0]?.plain_text || "",
      image: localImage || "",
      publication: props?.publication?.rich_text?.[0]?.plain_text || "",
      status: props?.status?.select?.name || "Unknown",
      keywords: props?.keywords?.rich_text?.[0]?.plain_text || "",
    });
  }

  console.log(`  ✓ Fetched ${research.length} research projects`);
  return research;
}

// ============================================================================
// PARTNERS FETCHER
// ============================================================================

interface NotionPartner {
  id: string;
  name: string;
  link: string;
  image: string;
}

async function fetchPartners(notion: Client, databaseId: string): Promise<NotionPartner[]> {
  console.log("\n🤝 Fetching Partners from Notion...");

  const response = await notion.databases.query({
    database_id: databaseId,
  });

  const partners: NotionPartner[] = [];

  for (const page of response.results) {
    if (!("properties" in page)) continue;

    const props = page.properties as any;

    // Get image URL from Notion
    const notionImageUrl = props?.image?.files?.[0]?.file?.url ||
      props?.image?.files?.[0]?.external?.url || "";

    // Download image
    const localImage = await downloadImage(notionImageUrl, "partners");

    partners.push({
      id: page.id,
      name: props?.name?.title?.[0]?.plain_text || "Untitled",
      link: props?.link?.rich_text?.[0]?.plain_text || "",
      image: localImage || "",
    });
  }

  console.log(`  ✓ Fetched ${partners.length} partners`);
  return partners;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("🚀 Starting Notion data fetch...\n");

  // Check for required environment variables
  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const NOTION_DB_ID = process.env.NOTION_DB_ID;
  const NOTION_TOKEN_RESEARCH = process.env.NOTION_TOKEN_RESEARCH;
  const NOTION_DB_RESEARCH_ID = process.env.NOTION_DB_RESEARCH_ID;
  const NOTION_TOKEN_PARTNERS = process.env.NOTION_TOKEN_PARTNERS;
  const NOTION_DB_PARTNERS_ID = process.env.NOTION_DB_PARTNERS_ID;

  // Ensure output directories exist
  ensureDir(PUBLIC_CMS_DIR);
  ensureDir(GENERATED_DATA_DIR);

  // Track what we successfully fetched
  const results: Record<string, unknown> = {};

  // Fetch Events
  if (NOTION_TOKEN && NOTION_DB_ID) {
    try {
      const notionEvents = new Client({ auth: NOTION_TOKEN });
      const events = await fetchEvents(notionEvents, NOTION_DB_ID);
      results.events = events;

      const eventsPath = path.join(GENERATED_DATA_DIR, "events.json");
      fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));
      console.log(`  💾 Saved to ${eventsPath}`);
    } catch (error) {
      console.error("  ✗ Failed to fetch events:", error);
    }
  } else {
    console.log("⚠️  Skipping Events: NOTION_TOKEN or NOTION_DB_ID not set");
    // Create empty file
    fs.writeFileSync(
      path.join(GENERATED_DATA_DIR, "events.json"),
      JSON.stringify([], null, 2)
    );
  }

  // Fetch Research
  if (NOTION_TOKEN_RESEARCH && NOTION_DB_RESEARCH_ID) {
    try {
      const notionResearch = new Client({ auth: NOTION_TOKEN_RESEARCH });
      const research = await fetchResearch(notionResearch, NOTION_DB_RESEARCH_ID);
      results.research = research;

      const researchPath = path.join(GENERATED_DATA_DIR, "research.json");
      fs.writeFileSync(researchPath, JSON.stringify(research, null, 2));
      console.log(`  💾 Saved to ${researchPath}`);
    } catch (error) {
      console.error("  ✗ Failed to fetch research:", error);
    }
  } else {
    console.log("⚠️  Skipping Research: NOTION_TOKEN_RESEARCH or NOTION_DB_RESEARCH_ID not set");
    fs.writeFileSync(
      path.join(GENERATED_DATA_DIR, "research.json"),
      JSON.stringify([], null, 2)
    );
  }

  // Fetch Partners
  if (NOTION_TOKEN_PARTNERS && NOTION_DB_PARTNERS_ID) {
    try {
      const notionPartners = new Client({ auth: NOTION_TOKEN_PARTNERS });
      const partners = await fetchPartners(notionPartners, NOTION_DB_PARTNERS_ID);
      results.partners = partners;

      const partnersPath = path.join(GENERATED_DATA_DIR, "partners.json");
      fs.writeFileSync(partnersPath, JSON.stringify(partners, null, 2));
      console.log(`  💾 Saved to ${partnersPath}`);
    } catch (error) {
      console.error("  ✗ Failed to fetch partners:", error);
    }
  } else {
    console.log("⚠️  Skipping Partners: NOTION_TOKEN_PARTNERS or NOTION_DB_PARTNERS_ID not set");
    fs.writeFileSync(
      path.join(GENERATED_DATA_DIR, "partners.json"),
      JSON.stringify([], null, 2)
    );
  }

  console.log("\n✅ Notion data fetch complete!");
  console.log(`   - Events: ${(results.events as any[])?.length || 0}`);
  console.log(`   - Research: ${(results.research as any[])?.length || 0}`);
  console.log(`   - Partners: ${(results.partners as any[])?.length || 0}`);
}

main().catch(console.error);
