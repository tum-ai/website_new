/**
 * Single source for the site's identity on the web: the canonical origin, the
 * name and the tagline. Metadata, canonical links, Open Graph and JSON-LD read
 * them, so moving the domain is one edit here. See "Updating site facts" in
 * docs/contributor-guide.md.
 */
export const siteConfig = {
  /** Canonical origin, no trailing slash. Every absolute URL starts here. */
  url: "https://www.tum-ai.com",
  name: "TUM.ai",
  /** Canonical tagline: the default `<title>` and the Open Graph fallback. */
  tagline: "Germany's Leading AI Student Initiative",
  /** One-line summary: the layout's fallback meta description. */
  summary:
    "TUM.ai is Germany's leading AI student initiative, connecting students, research, and industry.",
  /** The long description: the Organization JSON-LD `description`. */
  description:
    "TUM.ai is Germany's leading student initiative focused on AI. We empower the next generation of AI innovators by creating a community of students who innovate, research, and build at the forefront of AI, fostering both groundbreaking research and entrepreneurial ventures across diverse industries.",
  /** Shared Open Graph and Twitter image, relative to `url`. */
  socialImagePath: "/assets/logo_new_white_standard.png",
  locale: "en_US",
} as const;

/** "TUM.ai - Germany's Leading AI Student Initiative". */
export const siteTitle = `${siteConfig.name} - ${siteConfig.tagline}`;

/**
 * An absolute URL on the canonical origin: `absoluteUrl("/events")` is
 * `https://www.tum-ai.com/events`, and `absoluteUrl("/")` or `absoluteUrl()`
 * is the bare origin (no trailing slash, matching the canonical homepage).
 * Paths must be site-relative (start with `/`); anything else throws, so a
 * full URL or a typo cannot silently produce a foreign or broken link.
 */
export function absoluteUrl(path = "/"): string {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error(
      `absoluteUrl expects a site-relative path starting with "/", got "${path}"`,
    );
  }
  return path === "/" ? siteConfig.url : `${siteConfig.url}${path}`;
}
