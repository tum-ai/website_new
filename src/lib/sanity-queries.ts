export const EVENTS_QUERY = `*[_type == "event"]{
  "id": _id,
  title,
  "description": coalesce(desc, ""),
  event_date,
  location,
  city,
  category,
  "poster": poster.asset->url,
  "images": array::compact([poster.asset->url, img.asset->url]),
  sign_up,
  detail
}`;

export const RESEARCH_QUERY = `*[_type == "research"]{
  "id": _id,
  title,
  "description": coalesce(desc, ""),
  status,
  publication,
  "keywords": array::join(keywords, ", "),
  "image": img.asset->url
}`;

export const PARTNERS_QUERY = `*[_type == "partner"]{
  "id": _id,
  name,
  link,
  "image": image.asset->url,
  category
}`;
