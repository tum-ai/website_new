/**
 * Single source for the site's navigation: the main pages, the social and
 * contact links, the legal pages, and how the header behaves on each route.
 * The header and footer read it, so adding a page to the menu or changing a
 * route's call to action is one edit here.
 */
import { contactEmails, socialLinks } from "./contact";
import { eLabApplicationCopy } from "./e-lab";
import { membershipConfig } from "./membership";

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

/** A header call to action: `href` is `null` while it has nowhere to go yet. */
export type HeaderCtaOption = { label: string; href: string | null };

/**
 * The calls to action the header can show, by variant. {@link headerCtaSetting}
 * picks one.
 */
export const headerCtas = {
  member: { label: "Become a Member", href: "/apply" },
  partner: { label: "Become a Partner", href: "/partners" },
  elab: { label: `Explore ${eLabApplicationCopy.cohortName}`, href: "/e-lab" },
  // TODO(content): notify target. There is no signup list for recruiting
  // news yet; until it has an href, `notify` cannot be selected.
  notify: { label: "Get Notified", href: null },
} as const satisfies Record<string, HeaderCtaOption>;

/** Every header CTA variant, including ones without a target yet. */
export type HeaderCtaVariant = keyof typeof headerCtas;

/** The variants that have an href: the only ones the setting accepts. */
type LinkedHeaderCtaVariant = {
  [Variant in HeaderCtaVariant]: (typeof headerCtas)[Variant]["href"] extends string
    ? Variant
    : never;
}[HeaderCtaVariant];

/** A table of CTA variants, for tests and future sources of the same shape. */
export type HeaderCtaTable = Readonly<
  Record<HeaderCtaVariant, HeaderCtaOption>
>;

/** The site's choice of header CTA (outside route overrides). */
export type HeaderCtaSetting = {
  /** What the header shows while membership applications are closed. */
  fallback: LinkedHeaderCtaVariant;
  /** Shows this variant regardless of the recruiting round. */
  override?: LinkedHeaderCtaVariant;
};

/**
 * The header CTA: `member` while membership applications are open
 * (`membershipConfig.applicationsOpen`), `fallback` otherwise. Change
 * `fallback` for a different call to action between recruiting rounds, or
 * set `override` to pin one.
 */
export const headerCtaSetting: HeaderCtaSetting = { fallback: "partner" };

/**
 * The plain input {@link selectHeaderCta} decides on. Kept free of config
 * imports so another source (such as dated campaign windows from the CMS)
 * can feed the same function later.
 */
export type HeaderCtaChoice = {
  /** Membership applications are open. */
  membershipOpen: boolean;
  /** Shown while membership applications are closed. */
  fallback: HeaderCtaVariant;
  /** Shown regardless of `membershipOpen` when set. */
  override?: HeaderCtaVariant;
};

/**
 * Which CTA variant the header shows: `override` if set, else `member` while
 * membership applications are open, else `fallback`. A variant without an
 * href in `ctas` is skipped in favour of `member`; `null` means neither has
 * one, so the header shows no CTA.
 */
export function selectHeaderCta(
  { membershipOpen, fallback, override }: HeaderCtaChoice,
  ctas: HeaderCtaTable = headerCtas,
): HeaderCtaVariant | null {
  const wanted = override ?? (membershipOpen ? "member" : fallback);
  for (const variant of [wanted, "member"] as const) {
    if (ctas[variant].href !== null) return variant;
  }
  return null;
}

/** The link for a CTA variant, or `null` for none or one without a target. */
export function headerCtaLink(
  variant: HeaderCtaVariant | null,
  ctas: HeaderCtaTable = headerCtas,
): NavLink | null {
  if (variant === null) return null;
  const { label, href } = ctas[variant];
  return href === null ? null : { label, href };
}

/** How the floating header looks and what it offers on a route. */
export type HeaderOptions = {
  /** Frosted from the start instead of only after the page scrolls. */
  solid: boolean;
  /**
   * The primary button at the end of the header, or `null` for none. An
   * in-page anchor (`#…`) stays visible on phones and has no arrow, because
   * it scrolls the current page instead of leaving it.
   */
  cta: NavLink | null;
  /** Hide the logo until the hero scrolls away (the hero shows it large). */
  hideLogoUntilScroll: boolean;
};

const defaultHeaderOptions: HeaderOptions = {
  solid: false,
  cta: headerCtaLink(
    selectHeaderCta({
      ...headerCtaSetting,
      membershipOpen: membershipConfig.applicationsOpen,
    }),
  ),
  hideLogoUntilScroll: false,
};

/** Per-route overrides, keyed by exact pathname. */
const routeHeaderOptions: Readonly<Record<string, Partial<HeaderOptions>>> = {
  "/": { hideLogoUntilScroll: true },
  // The partner page keeps the pill frosted and swaps the CTA for its
  // in-page contact anchor.
  "/partners": {
    solid: true,
    cta: { label: "Become a partner", href: "#partner-contact" },
  },
};

/**
 * The header options for `pathname`: the defaults plus the route's overrides.
 * Matching is exact, so `/partners/x` gets the defaults.
 */
export function getHeaderOptions(pathname: string): HeaderOptions {
  return { ...defaultHeaderOptions, ...routeHeaderOptions[pathname] };
}
