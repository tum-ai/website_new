export interface Event {
  id: string
  title: string
  description: string
  date: string
  imageUrl?: string
  location?: string
  city?: string
  category?: string
  url?: string
}

export interface EventFilters {
  category: string
  city: string
}

export interface NotionPage {
  id: string
  properties: {
    Title?: {
      title?: [{ plain_text?: string }]
    }
    Description?: {
      rich_text?: [{ plain_text?: string }]
    }
    Date?: {
      date?: { start?: string }
    }
    Image?: {
      files?: [{ file?: { url?: string }; external?: { url?: string } }]
    }
    Location?: {
      rich_text?: [{ plain_text?: string }]
    }
    City?: {
      select?: { name?: string }
    }
    Category?: {
      select?: { name?: string }
    }
    URL?: {
      url?: string
    }
  }
}
