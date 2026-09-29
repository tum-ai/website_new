/**
 * Official artwork of the events' co-hosts in its dark-background variant
 * (brand colours unchanged; sources in public/assets/events/hosts/SOURCES.md),
 * keyed by the name's letters and digits, lower-cased, with the artwork's
 * width over height. The hero sizes each logo to one optical area from it. A
 * co-host missing here is set as its name.
 */
const logos: Readonly<Record<string, { file: string; aspect: number }>> = {
  anthropic: { file: "anthropic.svg", aspect: 8.906 },
  aws: { file: "aws.webp", aspect: 1.672 },
  beyondpresence: { file: "beyond-presence.svg", aspect: 10.752 },
  bkw: { file: "bkw.svg", aspect: 4.162 },
  bmw: { file: "bmw.svg", aspect: 1 },
  cdtm: { file: "cdtm.svg", aspect: 1.32 },
  googlecloud: { file: "google-cloud.svg", aspect: 6.137 },
  huggingface: { file: "hugging-face.svg", aspect: 4.516 },
  lovable: { file: "lovable.svg", aspect: 5.495 },
  managemore: { file: "manage-and-more.svg", aspect: 4.299 },
  manageandmore: { file: "manage-and-more.svg", aspect: 4.299 },
  n8n: { file: "n8n.svg", aspect: 3.684 },
  nvidia: { file: "nvidia.webp", aspect: 1.286 },
  projecta: { file: "project-a.svg", aspect: 4.017 },
  redbull: { file: "red-bull.svg", aspect: 224.189 / 36 },
  tacto: { file: "tacto.svg", aspect: 3.08 },
  yellow: { file: "yellow.svg", aspect: 3.435 },
};

/**
 * Co-hosts whose official artwork is an app icon only, with the name set
 * beside it as text, the way their own site composes its header.
 */
const icons: Readonly<Record<string, string>> = {
  mercura: "mercura-icon.webp",
};

const key = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
const asset = (file: string) => `/assets/events/hosts/${file}`;

/** The co-host's dark-band logo, if the site has one. */
export function hostLogo(
  name: string,
): { src: string; aspect: number } | undefined {
  const logo = logos[key(name)];
  return logo ? { src: asset(logo.file), aspect: logo.aspect } : undefined;
}

/** The co-host's app icon, for co-hosts without a wordmark file. */
export function hostIcon(name: string): string | undefined {
  const icon = icons[key(name)];
  return icon ? asset(icon) : undefined;
}
