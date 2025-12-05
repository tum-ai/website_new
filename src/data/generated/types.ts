// Type definitions for generated Notion data
// These types are used by the Astro pages

export interface GeneratedEvent {
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

export interface GeneratedResearch {
  id: string;
  title: string;
  description: string;
  image: string;
  publication: string;
  status: string;
  keywords: string;
}

export interface GeneratedPartner {
  id: string;
  name: string;
  link: string;
  image: string;
}
