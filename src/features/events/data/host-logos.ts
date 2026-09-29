import { organizationByKey } from "@/features/partners";
import type { LogoLists, Organization } from "@/lib/people-and-logos";

/** A co-host's dark-band logo and the drawn artwork's width over height. */
export type HostLogo = { src: string; aspect: number };

/**
 * The co-host artwork the hero reads, by host key (the name's letters and
 * digits, lower-cased): wordmark logos, and app icons for co-hosts whose
 * official artwork is an icon only (the name is set beside it as text, the
 * way their own site composes its header).
 */
export type HostArtwork = {
  logos: Readonly<Record<string, HostLogo>>;
  icons: Readonly<Record<string, string>>;
};

/**
 * The events co-hosts with official artwork for the hero's dark band, from
 * the organisation table (brand colours unchanged; sources in
 * public/assets/events/hosts/SOURCES.md): the code source of the
 * `event-hosts` logo list (`features/events/host-content.ts`). A co-host
 * missing here is set as its name.
 */
export const eventHostLists: LogoLists<"event-hosts"> = {
  "event-hosts": [
    "anthropic",
    "aws",
    "beyond-presence",
    "bkw",
    "bmw",
    "cdtm",
    "google-cloud",
    "hugging-face",
    "lovable",
    "manage-and-more",
    "n8n",
    "nvidia",
    "project-a",
    "red-bull",
    "tacto",
    "yellow",
    "mercura",
  ].map(organizationByKey),
};

const key = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * The hero's artwork from a list: each organisation's dark logo under its
 * key and its name ("manage-and-more" and "Manage & More" both match), sized
 * by its drawn aspect ratio (else the file's). Symbol-only artwork is an
 * icon.
 */
export function hostArtworkOf(list: readonly Organization[]): HostArtwork {
  const logos: Record<string, HostLogo> = {};
  const icons: Record<string, string> = {};
  for (const organization of list) {
    const artwork = organization.logoOnDark;
    if (!artwork) continue;
    for (const hostKey of new Set([
      key(organization.key),
      key(organization.name),
    ])) {
      if (artwork.symbolOnly) {
        icons[hostKey] = artwork.src;
      } else {
        logos[hostKey] = {
          src: artwork.src,
          aspect: artwork.aspectRatio ?? artwork.width / artwork.height,
        };
      }
    }
  }
  return { logos, icons };
}

const codeArtwork = hostArtworkOf(eventHostLists["event-hosts"]);

/** The co-host's dark-band logo, if the site has one. */
export function hostLogo(
  name: string,
  artwork: HostArtwork = codeArtwork,
): HostLogo | undefined {
  return artwork.logos[key(name)];
}

/** The co-host's app icon, for co-hosts without a wordmark file. */
export function hostIcon(
  name: string,
  artwork: HostArtwork = codeArtwork,
): string | undefined {
  return artwork.icons[key(name)];
}
