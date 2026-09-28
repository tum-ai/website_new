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
export type LinkedHeaderCtaVariant = {
  [Variant in HeaderCtaVariant]: (typeof headerCtas)[Variant]["href"] extends string
    ? Variant
    : never;
}[HeaderCtaVariant];

/** Which call to action the header shows (outside route overrides). */
export type HeaderCtaSetting<Variant extends string = LinkedHeaderCtaVariant> =
  {
    /**
     * A fixed variant, or `"auto"`: `member` while membership applications
     * are open (`membershipConfig.applicationsOpen`), `fallback` otherwise.
     */
    variant: Variant | "auto";
    /** What `"auto"` shows while membership applications are closed. */
    fallback: Variant;
  };

/**
 * The header CTA. Change `fallback` to show a different call to action
 * between recruiting rounds, or pin `variant` to override the automatic rule.
 */
export const headerCtaSetting: HeaderCtaSetting = {
  variant: "auto",
  fallback: "partner",
};

/**
 * The CTA for `setting`: the wanted variant, falling back to `member` when
 * the wanted one has no href. Returns `null` only if neither has one.
 */
export function selectHeaderCta(
  setting: HeaderCtaSetting<HeaderCtaVariant>,
  membershipOpen: boolean,
  ctas: Readonly<Record<HeaderCtaVariant, HeaderCtaOption>> = headerCtas,
): NavLink | null {
  const wanted =
    setting.variant !== "auto"
      ? setting.variant
      : membershipOpen
        ? "member"
        : setting.fallback;
  for (const variant of [wanted, "member"] as const) {
    const { label, href } = ctas[variant];
    if (href !== null) return { label, href };
  }
  return null;
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
  cta: selectHeaderCta(headerCtaSetting, membershipConfig.applicationsOpen),
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
