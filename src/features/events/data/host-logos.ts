import type { Organization } from "@/lib/people-and-logos";

/** A co-host's dark-band logo and the drawn artwork's width over height. */
type HostLogo = { src: string; aspect: number };

/**
 * The co-host artwork the hero reads, by organisation key: wordmark logos,
 * and app icons for co-hosts whose official artwork is an icon only (the
 * name is set beside it as text, the way their own site composes its
 * header). A co-host without either is set as its name.
 */
export type HostArtwork = {
  logos: Readonly<Record<string, HostLogo>>;
  icons: Readonly<Record<string, string>>;
};

/**
 * The hero's artwork from the co-hosts' organisations: each one's logo for
 * dark backgrounds (`logoOnDark`, the official variant; sources in
 * docs/asset-sources/events-hosts.md) under its key, sized by its drawn
 * aspect ratio (else the file's). Symbol-only artwork is an icon.
 */
export function hostArtworkOf(
  organizations: readonly Organization[],
): HostArtwork {
  const logos: Record<string, HostLogo> = {};
  const icons: Record<string, string> = {};
  for (const { key, logoOnDark: artwork } of organizations) {
    if (!artwork) continue;
    if (artwork.symbolOnly) {
      icons[key] = artwork.src;
    } else {
      logos[key] = {
        src: artwork.src,
        aspect: artwork.aspectRatio ?? artwork.width / artwork.height,
      };
    }
  }
  return { logos, icons };
}
