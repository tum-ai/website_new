/**
 * Single source for the site's navigation: the main pages, the social and
 * contact links, the legal pages, and how the header behaves on each route.
 * The header and footer read it, so adding a page to the menu or changing a
 * route's call to action is one edit here.
 */
import {
  type ClockWindow,
  clockWindowBoundaries,
  isClockWindowOpen,
} from "@/lib/clock-window";
import {
  type Campaign,
  type CampaignHeaderCta,
  campaignBoundaries,
  resolveActiveCampaigns,
  scheduleCampaigns,
} from "./campaigns";
import {
  type ContactEmails,
  contactEmails,
  type SocialLinks,
  socialLinks,
} from "./contact";
import { eLabApplicationCopy } from "./e-lab";
import { type MembershipConfig, membershipWindowClock } from "./membership";

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

/** The contact facts the link lists are built from (`getSiteFacts()` or the code constants). */
type LinkFacts = { socialLinks: SocialLinks; contactEmails: ContactEmails };

const codeLinkFacts: LinkFacts = { socialLinks, contactEmails };

function contactLinks({ socialLinks, contactEmails }: LinkFacts) {
  return {
    linkedin: { label: "LinkedIn", href: socialLinks.linkedin },
    instagram: { label: "Instagram", href: socialLinks.instagram },
    slack: { label: "Slack", href: socialLinks.slack },
    email: { label: "Email", href: `mailto:${contactEmails.general}` },
  };
}

/** Social and contact links (footer "Connect"). */
export function connectLinksFor(facts: LinkFacts): readonly NavLink[] {
  const { linkedin, instagram, slack, email } = contactLinks(facts);
  return [linkedin, instagram, slack, email];
}

/** The shorter set in the header menu's "Connect" row (no Slack invite). */
export function headerConnectLinksFor(facts: LinkFacts): readonly NavLink[] {
  const { linkedin, instagram, email } = contactLinks(facts);
  return [linkedin, instagram, email];
}

/** {@link connectLinksFor} the code facts. */
export const connectLinks = connectLinksFor(codeLinkFacts);

/** {@link headerConnectLinksFor} the code facts. */
export const headerConnectLinks = headerConnectLinksFor(codeLinkFacts);

/** The legal pages (footer "Legal", the legal pages' own navigation). */
export const legalLinks = [
  { label: "Imprint", href: "/imprint" },
  { label: "Data Privacy", href: "/data-privacy" },
  { label: "Disclaimer", href: "/disclaimer" },
] as const satisfies readonly NavLink[];

/** Footer "Contribute". */
export function contributeLinksFor({
  socialLinks,
}: Pick<LinkFacts, "socialLinks">): readonly NavLink[] {
  return [{ label: "GitHub", href: socialLinks.github }];
}

/** {@link contributeLinksFor} the code facts. */
export const contributeLinks = contributeLinksFor(codeLinkFacts);

/** A header call to action: `href` is `null` while it has nowhere to go yet. */
type HeaderCtaOption = { label: string; href: string | null };

/**
 * The calls to action the header can show, by variant, for the current
 * E-Lab cohort's name ("E-Lab 6.0"). {@link headerCtaSetting} picks one.
 */
function headerCtasFor(eLabCohortName: string) {
  return {
    member: { label: "Become a Member", href: "/apply" },
    partner: { label: "Become a Partner", href: "/partners" },
    elab: { label: `Explore ${eLabCohortName}`, href: "/e-lab" },
    // TODO(content): notify target. There is no signup list for recruiting
    // news yet; until it has an href, `notify` can only be selected by a
    // campaign that brings its own `notifyUrl`.
    notify: { label: "Get Notified", href: null },
  } as const satisfies Record<string, HeaderCtaOption>;
}

/** {@link headerCtasFor} the code cohort. */
export const headerCtas = headerCtasFor(eLabApplicationCopy.cohortName);

/** Every header CTA variant, including ones without a target yet. */
export type HeaderCtaVariant = keyof typeof headerCtas;

/** The variants that have an href: the only ones the setting accepts. */
export type LinkedHeaderCtaVariant = {
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
 * (`isMembershipApplicationOpen`, dated by the round), `fallback` otherwise. Change
 * `fallback` for a different call to action between recruiting rounds, or
 * set `override` to pin one.
 */
export const headerCtaSetting: HeaderCtaSetting = { fallback: "partner" };

/**
 * The plain input {@link selectHeaderCta} decides on. Kept free of config
 * imports; {@link headerCtaAt} feeds it from the dated schedule (the
 * membership window and the running campaign).
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
};

/**
 * Everything the header's call to action depends on, as plain data: the
 * layout resolves it on the server (from code or the CMS) and the header
 * re-evaluates it in the browser with {@link headerCtaAt}, so the CTA
 * changes on time at every boundary even on a cached page.
 */
export type HeaderCtaSchedule = {
  /** The membership application window (`member` shows while it is open). */
  membership: ClockWindow;
  /** Shown while membership applications are closed and no campaign says otherwise. */
  fallback: HeaderCtaVariant;
  /** Shown regardless of the round (code only: `headerCtaSetting.override`). */
  override?: HeaderCtaVariant;
  /** Labels and targets by variant. */
  ctas: HeaderCtaTable;
  /** Campaigns that set a header CTA, with their instants. */
  campaigns: readonly {
    startsAt: number | null;
    endsAt: number | null;
    cta: CampaignHeaderCta;
  }[];
};

/** Input for {@link headerCtaSchedule}: the values resolved for a render. */
export type HeaderCtaSources = {
  membership: MembershipConfig;
  /** `siteSettings.headerCtaFallback`, or `headerCtaSetting.fallback` in code. */
  fallback: LinkedHeaderCtaVariant;
  /** The current E-Lab cohort's name, for the `elab` label. */
  eLabCohortName: string;
  campaigns: readonly Campaign[];
};

/** The header CTA schedule for a render, from the resolved sources. */
export function headerCtaSchedule({
  membership,
  fallback,
  eLabCohortName,
  campaigns,
}: HeaderCtaSources): HeaderCtaSchedule {
  return {
    membership: membershipWindowClock(membership),
    fallback,
    ...(headerCtaSetting.override === undefined
      ? {}
      : { override: headerCtaSetting.override }),
    ctas: headerCtasFor(eLabCohortName),
    campaigns: scheduleCampaigns(campaigns).flatMap(
      ({ startsAt, endsAt, headerCta }) =>
        headerCta ? [{ startsAt, endsAt, cta: headerCta }] : [],
    ),
  };
}

/**
 * The site-wide header CTA at `now`, before route overrides:
 *
 * - no campaign running: `override`, else `member` while membership
 *   applications are open, else `fallback` ({@link selectHeaderCta});
 * - a campaign running (the latest started one that sets a CTA, see
 *   `resolveActiveCampaigns`): its variant replaces `fallback` when it
 *   yields to recruiting, and `override` otherwise; its label replaces the
 *   variant's, and its `notifyUrl` is the `notify` target.
 *
 * A variant without a target is skipped for `member`, as in
 * {@link selectHeaderCta}; `null` means no CTA.
 */
export function headerCtaAt(
  schedule: HeaderCtaSchedule,
  now: Date,
): NavLink | null {
  const membershipOpen = isClockWindowOpen(schedule.membership, now);
  const [campaign] = resolveActiveCampaigns(schedule.campaigns, now);
  if (!campaign) {
    const { fallback, override, ctas } = schedule;
    return headerCtaLink(
      selectHeaderCta({ membershipOpen, fallback, override }, ctas),
      ctas,
    );
  }
  const { variant, label, notifyUrl, yieldsToRecruiting } = campaign.cta;
  const base = schedule.ctas[variant];
  const ctas: HeaderCtaTable = {
    ...schedule.ctas,
    [variant]: {
      label: label ?? base.label,
      href: variant === "notify" ? (notifyUrl ?? null) : base.href,
    },
  };
  const choice: HeaderCtaChoice = yieldsToRecruiting
    ? { membershipOpen, fallback: variant, override: schedule.override }
    : { membershipOpen, fallback: schedule.fallback, override: variant };
  return headerCtaLink(selectHeaderCta(choice, ctas), ctas);
}

/** The instants at which {@link headerCtaAt} can change. */
export function headerCtaBoundaries(schedule: HeaderCtaSchedule): Date[] {
  return [
    ...clockWindowBoundaries(schedule.membership),
    ...campaignBoundaries(schedule.campaigns),
  ];
}

/** The site-wide header CTA in code for a membership state (no campaigns). */
function defaultHeaderCta(membershipOpen: boolean): NavLink | null {
  return headerCtaLink(
    selectHeaderCta({ ...headerCtaSetting, membershipOpen }),
  );
}

/** Per-route overrides, keyed by exact pathname. */
const routeHeaderOptions: Readonly<Record<string, Partial<HeaderOptions>>> = {
  // The partner page keeps the pill frosted and swaps the CTA for its
  // in-page contact anchor.
  "/partners": {
    solid: true,
    cta: { label: "Become a partner", href: "#partner-contact" },
  },
};

/**
 * The header options for `pathname`: the defaults plus the route's overrides.
 * Matching is exact, so `/partners/x` gets the defaults. The site-wide CTA is
 * either given (`cta`, from {@link headerCtaAt}, which the header keeps
 * current in the browser) or derived from the code setting for a membership
 * state (`membershipOpen`, the dated window from `isMembershipApplicationOpen`).
 */
export function getHeaderOptions(
  pathname: string,
  source: { membershipOpen: boolean } | { cta: NavLink | null },
): HeaderOptions {
  return {
    solid: false,
    cta: "cta" in source ? source.cta : defaultHeaderCta(source.membershipOpen),
    ...routeHeaderOptions[pathname],
  };
}
