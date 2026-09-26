/**
 * Single source for the site's navigation: the main pages, the social and
 * contact links, the legal pages, and how the header behaves on each route.
 * The header and footer read it, so adding a page to the menu or changing a
 * route's call to action is one edit here.
 */
import { contactEmails, socialLinks } from "./contact";

export type NavLink = {
  label: string;
  /** A site path (`/events`), an in-page anchor (`#…`), `mailto:` or `https:`. */
  href: string;
};

/** The main pages, in menu order (header menu, footer "Explore"). */
export const mainNavigation = [
  { label: "Events", href: "/events" },
  { label: "Research", href: "/research" },
  { label: "Projects", href: "/projects" },
  { label: "Entrepreneurship", href: "/e-lab" },
  { label: "Community", href: "/community" },
  { label: "Partners", href: "/partners" },
  { label: "Q&A", href: "/qanda" },
] as const satisfies readonly NavLink[];

const linkedin = { label: "LinkedIn", href: socialLinks.linkedin };
const instagram = { label: "Instagram", href: socialLinks.instagram };
const slack = { label: "Slack", href: socialLinks.slack };
const email = { label: "Email", href: `mailto:${contactEmails.general}` };

/** Social and contact links (footer "Connect"). */
export const connectLinks = [
  linkedin,
  instagram,
  slack,
  email,
] as const satisfies readonly NavLink[];

/** The shorter set in the header menu's "Connect" row (no Slack invite). */
export const headerConnectLinks = [
  linkedin,
  instagram,
  email,
] as const satisfies readonly NavLink[];

/** The legal pages (footer "Legal", the legal pages' own navigation). */
export const legalLinks = [
  { label: "Imprint", href: "/imprint" },
  { label: "Data Privacy", href: "/data-privacy" },
  { label: "Disclaimer", href: "/disclaimer" },
] as const satisfies readonly NavLink[];

/** Footer "Contribute". */
export const contributeLinks = [
  { label: "GitHub", href: socialLinks.github },
] as const satisfies readonly NavLink[];

/** How the floating header looks and what it offers on a route. */
export type HeaderOptions = {
  /** Frosted from the start instead of only after the page scrolls. */
  solid: boolean;
  /** The primary button at the end of the header. */
  cta: NavLink;
  /** Hide the logo until the hero scrolls away (the hero shows it large). */
  hideLogoUntilScroll: boolean;
};

const defaultHeaderOptions: HeaderOptions = {
  solid: false,
  cta: { label: "Become a Member", href: "/apply" },
  hideLogoUntilScroll: false,
};

/** Per-route overrides, keyed by exact pathname. */
const routeHeaderOptions: Readonly<Record<string, Partial<HeaderOptions>>> = {
  "/": { hideLogoUntilScroll: true },
  // The partner page keeps the pill frosted and swaps the membership CTA for
  // its in-page contact anchor.
  "/partners": {
    solid: true,
    cta: { label: "Become a partner", href: "#partner-contact" },
  },
};

/**
 * The header options for `pathname`: the defaults plus the route's overrides.
 * Matching is exact, so `/partners/x` gets the defaults, as the header does
 * today.
 */
export function getHeaderOptions(pathname: string): HeaderOptions {
  return { ...defaultHeaderOptions, ...routeHeaderOptions[pathname] };
}
