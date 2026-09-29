/** A file in the co-host artwork folder. */
const host = (file: string) => `/assets/events/hosts/${file}`;

/** Artwork the partner pages already ship, reused rather than copied. */
const partner = (path: string) => `/assets/partners/${path}`;

/**
 * Official artwork of the events' co-hosts in its dark-background variant
 * (brand colours unchanged; sources in public/assets/events/hosts/SOURCES.md),
 * keyed by the name's letters and digits, lower-cased, with the artwork's
 * width over height. The hero sizes each logo to one optical area from it. A
 * co-host missing here is set as its name.
 */
const logos: Readonly<Record<string, { src: string; aspect: number }>> = {
  anthropic: { src: partner("marquee/anthropic.svg"), aspect: 8.906 },
  aws: { src: partner("marquee/aws.webp"), aspect: 1.672 },
  beyondpresence: { src: host("beyond-presence.svg"), aspect: 10.752 },
  bkw: { src: host("bkw.svg"), aspect: 4.162 },
  bmw: { src: partner("logos/bmw.svg"), aspect: 1 },
  cdtm: { src: host("cdtm.svg"), aspect: 1.32 },
  googlecloud: { src: host("google-cloud.svg"), aspect: 6.137 },
  huggingface: { src: host("hugging-face.svg"), aspect: 4.516 },
  lovable: { src: host("lovable.svg"), aspect: 5.495 },
  managemore: { src: host("manage-and-more.svg"), aspect: 4.299 },
  manageandmore: { src: host("manage-and-more.svg"), aspect: 4.299 },
  n8n: { src: host("n8n.svg"), aspect: 3.684 },
  nvidia: { src: partner("marquee/nvidia.webp"), aspect: 1.286 },
  projecta: { src: host("project-a.svg"), aspect: 4.017 },
  redbull: { src: host("red-bull.svg"), aspect: 224.189 / 36 },
  tacto: { src: host("tacto.svg"), aspect: 3.08 },
  yellow: { src: host("yellow.svg"), aspect: 3.435 },
};

/**
 * Co-hosts whose official artwork is an app icon only, with the name set
 * beside it as text, the way their own site composes its header.
 */
const icons: Readonly<Record<string, string>> = {
  mercura: host("mercura-icon.webp"),
};

const key = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

/** The co-host's dark-band logo, if the site has one. */
export function hostLogo(
  name: string,
): { src: string; aspect: number } | undefined {
  return logos[key(name)];
}

/** The co-host's app icon, for co-hosts without a wordmark file. */
export function hostIcon(name: string): string | undefined {
  return icons[key(name)];
}
