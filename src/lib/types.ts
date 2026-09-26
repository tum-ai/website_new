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

export type PartnerTier = "gold" | "silver" | "bronze" | "supporter";

export interface Partner {
  id: string;
  name: string;
  link?: string;
  image?: string;
  category?: string;
  tier?: PartnerTier;
  featured?: boolean;
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
