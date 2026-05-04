export type { Event, Partner, Research } from "@tumai/notion-data";

export interface EventFilters {
  category: string;
  city: string;
}

export interface NotionPage {
  id: string;
  properties: {
    Title?: {
      title?: [{ plain_text?: string }];
    };
    Description?: {
      rich_text?: [{ plain_text?: string }];
    };
    Date?: {
      date?: { start?: string };
    };
    Poster?: {
      files?: [{ file?: { url?: string }; external?: { url?: string } }];
    };
    Images?: {
      files?: [{ file?: { url?: string }; external?: { url?: string } }];
    };
    Location?: {
      rich_text?: [{ plain_text?: string }];
    };
    City?: {
      select?: { name?: string };
    };
    Category?: {
      select?: { name?: string };
    };
    URL?: {
      url?: string;
    };
  };
  Keywords?: {
    // <-- string property
    rich_text?: [{ plain_text?: string }];
  };
}
