import { Client } from "@notionhq/client";

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location?: string;
  city?: string;
  category?: string;
  poster?: string;
  images?: string[];
  sign_up?: string;
  detail?: string;
}

export interface Partner {
  id: string;
  name: string;
  link?: string;
  image?: string;
}

export interface Research {
  id: string;
  title: string;
  description: string;
  image?: string;
  publication?: string;
  status?: string;
  keywords?: string;
}

type EnvShape = Partial<Record<string, string | undefined>>;

type NotionFile = {
  external?: { url?: string };
  file?: { url?: string };
};

export type NotionProperty = {
  date?: { start?: string };
  files?: NotionFile[];
  rich_text?: Array<{ plain_text?: string }>;
  select?: { name?: string };
  title?: Array<{ plain_text?: string }>;
  url?: string;
};

export type NotionPage = {
  id: string;
  properties: Record<string, NotionProperty>;
};

function getProperty(
  properties: Record<string, NotionProperty>,
  keys: string[],
) {
  for (const key of keys) {
    if (properties[key]) {
      return properties[key];
    }
  }

  return undefined;
}

function readText(
  properties: Record<string, NotionProperty>,
  keys: string[],
  fallback = "",
) {
  const property = getProperty(properties, keys);

  if (!property) {
    return fallback;
  }

  if (property.title?.length) {
    return property.title.map((value) => value.plain_text ?? "").join("");
  }

  if (property.rich_text?.length) {
    return property.rich_text.map((value) => value.plain_text ?? "").join("");
  }

  if (property.select?.name) {
    return property.select.name;
  }

  if (property.url) {
    return property.url;
  }

  return fallback;
}

function readDate(properties: Record<string, NotionProperty>, keys: string[]) {
  return getProperty(properties, keys)?.date?.start ?? "";
}

function readFiles(
  properties: Record<string, NotionProperty>,
  keys: string[],
): string[] {
  const property = getProperty(properties, keys);

  return (
    property?.files
      ?.map((file) => file.file?.url ?? file.external?.url ?? "")
      .filter(Boolean) ?? []
  );
}

export function mapEventPage(page: NotionPage): Event {
  const posterFiles = readFiles(page.properties, ["Poster", "poster", "img"]);
  const imageFiles = readFiles(page.properties, ["Images", "images", "img"]);

  return {
    id: page.id,
    title: readText(page.properties, ["Title", "title"], "Untitled"),
    description: readText(page.properties, ["Description", "desc"]),
    event_date: readDate(page.properties, ["Date", "event_date"]),
    location: readText(page.properties, ["Location", "location"]),
    city: readText(page.properties, ["City", "city"]),
    category: readText(page.properties, ["Category", "category"]),
    poster: posterFiles[0] ?? imageFiles[0] ?? "",
    images: imageFiles,
    sign_up: readText(page.properties, ["URL", "url", "sign_up"]),
    detail: readText(page.properties, ["Detail", "detail"]),
  };
}

export function mapPartnerPage(page: NotionPage): Partner {
  return {
    id: page.id,
    name: readText(page.properties, ["Name", "name"], "Untitled"),
    link: readText(page.properties, ["Link", "link", "URL", "url"]),
    image:
      readFiles(page.properties, ["Image", "image", "img", "logo"])[0] ?? "",
  };
}

export function mapResearchPage(page: NotionPage): Research {
  return {
    id: page.id,
    title: readText(page.properties, ["Title", "title"], "Untitled"),
    description: readText(page.properties, ["Description", "desc"]),
    image: readFiles(page.properties, ["Image", "image", "img"])[0] ?? "",
    publication: readText(page.properties, ["Publication", "publication"]),
    status: readText(page.properties, ["Status", "status"], "Unknown"),
    keywords: readText(page.properties, ["Keywords", "keywords"]),
  };
}

async function queryDatabase(
  auth: string | undefined,
  databaseId: string | undefined,
) {
  if (!auth || !databaseId) {
    return [];
  }

  const notion = new Client({ auth });
  const response = await notion.databases.query({ database_id: databaseId });

  return response.results as NotionPage[];
}

export async function fetchEvents(
  env: EnvShape = process.env,
): Promise<Event[]> {
  const results = await queryDatabase(env.NOTION_TOKEN, env.NOTION_DB_ID);

  return results.map(mapEventPage);
}

export async function fetchPartners(
  env: EnvShape = process.env,
): Promise<Partner[]> {
  const results = await queryDatabase(
    env.NOTION_TOKEN_PARTNERS,
    env.NOTION_DB_PARTNERS_ID,
  );

  return results.map(mapPartnerPage);
}

export async function fetchResearchProjects(
  env: EnvShape = process.env,
): Promise<Research[]> {
  const results = await queryDatabase(
    env.NOTION_TOKEN_RESEARCH,
    env.NOTION_DB_RESEARCH_ID,
  );

  return results.map(mapResearchPage);
}
