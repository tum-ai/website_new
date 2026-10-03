import { globSync } from "node:fs";
import { dirname, relative, sep } from "node:path";
import { describe, expect, test } from "vitest";
import type { Campaign } from "@/config/campaigns";

import { eLabApplicationCopyOf } from "@/config/e-lab";
import type { MembershipConfig } from "@/config/membership";
import {
  connectLinksFor,
  contributeLinksFor,
  getHeaderOptions as getHeaderOptionsFrom,
  type HeaderCtaSetting,
  type HeaderCtaTable,
  headerConnectLinksFor,
  headerCtaAt,
  headerCtaBoundaries,
  headerCtaLink as headerCtaLinkFrom,
  headerCtaSchedule,
  headerCtasFor,
  legalLinks,
  mainNavigation,
  selectHeaderCta as selectHeaderCtaFrom,
} from "@/config/navigation";
import {
  settingsFixtureELabWindow,
  settingsFixtureFacts,
} from "@/lib/cms-fixtures/settings";

const { contactEmails, socialLinks } = settingsFixtureFacts;
const eLabConfig = {
  ...settingsFixtureFacts.eLab,
  ...settingsFixtureELabWindow,
};
const eLabApplicationCopy = eLabApplicationCopyOf(
  eLabConfig.currentIteration,
  settingsFixtureELabWindow,
);
const connectLinks = connectLinksFor(settingsFixtureFacts),
  contributeLinks = contributeLinksFor(settingsFixtureFacts),
  headerConnectLinks = headerConnectLinksFor(settingsFixtureFacts);
const headerCtaSetting: HeaderCtaSetting = {
  fallback: settingsFixtureFacts.headerCtaFallback,
};
const headerCtas = headerCtasFor(eLabApplicationCopy.cohortName);
const selectHeaderCta = (
  choice: Parameters<typeof selectHeaderCtaFrom>[0],
  ctas: HeaderCtaTable = headerCtas,
) => selectHeaderCtaFrom(choice, ctas);
const headerCtaLink = (
  variant: Parameters<typeof headerCtaLinkFrom>[0],
  ctas: HeaderCtaTable = headerCtas,
) => headerCtaLinkFrom(variant, ctas);
const getHeaderOptions = (
  path: string,
  source:
    | { membershipOpen: boolean }
    | { cta: Parameters<typeof getHeaderOptionsFrom>[1]["cta"] },
) =>
  getHeaderOptionsFrom(path, {
    cta:
      "cta" in source
        ? source.cta
        : headerCtaLink(
            selectHeaderCta({
              ...headerCtaSetting,
              membershipOpen: source.membershipOpen,
            }),
          ),
  });
const siteDir = new URL("../app/(site)/", import.meta.url).pathname;

/** URL paths served by `(site)` pages, e.g. `/events`. */
const sitePaths = new Set(
  globSync(`${siteDir}**/page.tsx`).map((file) => {
    const path = relative(siteDir, dirname(file)).split(sep).join("/");
    return `/${path}`.replace(/\/$/, "") || "/";
  }),
);

test("every internal navigation link points at an existing page", () => {
  const internal = [...mainNavigation, ...legalLinks].map((link) => link.href);
  expect(internal.filter((href) => !sitePaths.has(href))).toStrictEqual([]);
});

test("external links are https or mailto", () => {
  for (const link of [
    ...connectLinks,
    ...headerConnectLinks,
    ...contributeLinks,
  ]) {
    expect(link.href, link.label).toMatch(/^(https:\/\/|mailto:)/);
  }
});

test("the header's connect row is a subset of the footer's", () => {
  for (const link of headerConnectLinks) {
    expect(connectLinks).toContainEqual(link);
  }
});

/** The CTA every route without an override shows, by membership state. */
const defaultCta = (membershipOpen: boolean) =>
  headerCtaLink(selectHeaderCta({ ...headerCtaSetting, membershipOpen }));

test.each([true, false])(
  "the header defaults to the configured CTA with a transparent pill (membership open: %s)",
  (membershipOpen) => {
    expect(defaultCta(membershipOpen)).not.toBeNull();
    expect(getHeaderOptions("/events", { membershipOpen })).toStrictEqual({
      solid: false,
      cta: defaultCta(membershipOpen),
    });
  },
);

test("the default CTA follows the membership window", () => {
  const open = getHeaderOptions("/", { membershipOpen: true }).cta;
  const closed = getHeaderOptions("/", { membershipOpen: false }).cta;
  if (headerCtaSetting.override === undefined) {
    expect(open).toStrictEqual(headerCtaLink("member"));
    expect(closed).toStrictEqual(headerCtaLink(headerCtaSetting.fallback));
  } else {
    expect(open).toStrictEqual(closed);
  }
});

test("partners is solid and links to its own contact section", () => {
  for (const membershipOpen of [true, false]) {
    expect(getHeaderOptions("/partners", { membershipOpen })).toStrictEqual({
      solid: true,
      cta: { label: "Become a partner", href: "#partner-contact" },
    });
  }
  // Exact match only: sub-paths get the defaults.
  expect(getHeaderOptions("/partners/x", { membershipOpen: true }).solid).toBe(
    false,
  );
});

describe("header CTA selection", () => {
  test("shows member while membership applications are open", () => {
    expect(selectHeaderCta({ membershipOpen: true, fallback: "partner" })).toBe(
      "member",
    );
  });

  test("shows the fallback while membership applications are closed", () => {
    for (const fallback of ["member", "partner", "elab"] as const) {
      expect(selectHeaderCta({ membershipOpen: false, fallback })).toBe(
        fallback,
      );
    }
  });

  test("an override wins over the recruiting round", () => {
    for (const membershipOpen of [true, false]) {
      expect(
        selectHeaderCta({
          membershipOpen,
          fallback: "partner",
          override: "elab",
        }),
      ).toBe("elab");
    }
  });

  test("a variant without an href falls back to member", () => {
    expect(headerCtas.notify.href).toBeNull();
    expect(selectHeaderCta({ membershipOpen: false, fallback: "notify" })).toBe(
      "member",
    );
    expect(
      selectHeaderCta({
        membershipOpen: false,
        fallback: "partner",
        override: "notify",
      }),
    ).toBe("member");
    // The same holds for a table that drops a target later: no dead button.
    const ctas: HeaderCtaTable = {
      ...headerCtas,
      partner: { label: "Partner", href: null },
    };
    expect(
      selectHeaderCta({ membershipOpen: false, fallback: "partner" }, ctas),
    ).toBe("member");
  });

  test("the site setting accepts only variants with an href", () => {
    // @ts-expect-error: `notify` has no target yet.
    const setting: HeaderCtaSetting = { fallback: "notify" };
    expect(setting.fallback).toBe("notify");
  });

  test("no CTA when neither the wanted variant nor member has an href", () => {
    const ctas: HeaderCtaTable = {
      ...headerCtas,
      member: { label: "Member", href: null },
      partner: { label: "Partner", href: null },
    };
    const variant = selectHeaderCta(
      { membershipOpen: false, fallback: "partner" },
      ctas,
    );
    expect(variant).toBeNull();
    expect(headerCtaLink(variant, ctas)).toBeNull();
  });

  test("the link carries the variant's label and target", () => {
    expect(headerCtaLink("partner")).toStrictEqual({
      label: headerCtas.partner.label,
      href: headerCtas.partner.href,
    });
    expect(headerCtaLink("notify")).toBeNull();
  });

  test("every CTA with a target points at an existing page", () => {
    for (const [variant, cta] of Object.entries(headerCtas)) {
      if (cta.href !== null) {
        expect(sitePaths.has(cta.href), variant).toBe(true);
      }
    }
  });

  test("the E-Lab CTA names the current cohort", () => {
    expect(headerCtas.elab.label).toContain(eLabConfig.currentIteration);
  });
});

test("link lists follow the facts they are given", () => {
  const facts = {
    socialLinks: {
      linkedin: "https://example.com/linkedin",
      instagram: "https://example.com/instagram",
      github: "https://example.com/github",
      x: "https://example.com/x",
      youtube: "https://example.com/youtube",
      facebook: "https://example.com/facebook",
      tiktok: "https://example.com/tiktok",
      slack: "https://example.com/slack",
    },
    contactEmails: {
      general: "hello@example.com",
      partners: "partners@example.com",
      venture: "venture@example.com",
      recruitment: "join@example.com",
    },
  };
  expect(connectLinksFor(facts).map(({ href }) => href)).toStrictEqual([
    "https://example.com/linkedin",
    "https://example.com/instagram",
    "https://example.com/slack",
    "mailto:hello@example.com",
  ]);
  expect(headerConnectLinksFor(facts)).toHaveLength(3);
  expect(contributeLinksFor(facts)).toStrictEqual([
    { label: "GitHub", href: "https://example.com/github" },
  ]);
  expect(connectLinks).toStrictEqual(
    connectLinksFor({ socialLinks, contactEmails }),
  );
});

describe("the dated header CTA schedule", () => {
  /** An injected round: open from 28.09. to 27.10.2026, 23:59 Munich. */
  const membership: MembershipConfig = {
    applicationsOpen: true,
    applicationUrl: "https://example.com/form",
    round: {
      name: "Test round",
      opens: "28.09.2026",
      deadlineDate: "27.10.2026",
      deadlineTime: "23:59",
      interviews: { from: "02.11.2026", to: "08.11.2026" },
      onboarding: { from: "14.11.2026", to: "16.11.2026" },
    },
  };
  const during = new Date("2026-10-01T12:00:00Z");
  const between = new Date("2026-12-01T12:00:00Z");
  const scheduleWith = (...campaigns: Campaign[]) =>
    headerCtaSchedule({
      membership,
      fallback: "partner",
      eLabCohortName: eLabApplicationCopy.cohortName,
      campaigns,
    });
  const campaign = (
    headerCta: Campaign["headerCta"],
    overrides: Partial<Campaign> = {},
  ): Campaign => ({
    id: "c",
    name: "Test campaign",
    startDate: "01.09.2026",
    endDate: "31.12.2026",
    headerCta,
    ...overrides,
  });

  test("without campaigns it matches the code setting for the membership state", () => {
    const schedule = scheduleWith();
    expect(headerCtaAt(schedule, during)).toStrictEqual(
      getHeaderOptions("/", { membershipOpen: true }).cta,
    );
    expect(headerCtaAt(schedule, between)).toStrictEqual(
      getHeaderOptions("/", { membershipOpen: false }).cta,
    );
  });

  test("a campaign that yields to recruiting replaces only the fallback", () => {
    const schedule = scheduleWith(
      campaign({ variant: "elab", yieldsToRecruiting: true }),
    );
    expect(headerCtaAt(schedule, during)).toStrictEqual(
      headerCtaLink("member"),
    );
    expect(headerCtaAt(schedule, between)).toStrictEqual({
      label: `Explore ${eLabApplicationCopy.cohortName}`,
      href: "/e-lab",
    });
  });

  test("a yielding member campaign keeps its label off the recruiting CTA", () => {
    const schedule = scheduleWith(
      campaign({
        variant: "member",
        label: "Next round soon",
        yieldsToRecruiting: true,
      }),
    );
    expect(headerCtaAt(schedule, during)).toStrictEqual(
      headerCtaLink("member"),
    );
    expect(headerCtaAt(schedule, between)).toStrictEqual({
      label: "Next round soon",
      href: headerCtas.member.href,
    });
  });

  test("a campaign that does not yield shows for its whole run, with its label", () => {
    const schedule = scheduleWith(
      campaign({
        variant: "partner",
        label: "Meet us",
        yieldsToRecruiting: false,
      }),
    );
    expect(headerCtaAt(schedule, during)).toStrictEqual({
      label: "Meet us",
      href: "/partners",
    });
  });

  test("notify needs the campaign's link, else member stands in", () => {
    const withLink = scheduleWith(
      campaign({
        variant: "notify",
        notifyUrl: "https://example.com/signup",
        yieldsToRecruiting: true,
      }),
    );
    expect(headerCtaAt(withLink, between)).toStrictEqual({
      label: headerCtas.notify.label,
      href: "https://example.com/signup",
    });
    const withoutLink = scheduleWith(
      campaign({ variant: "notify", yieldsToRecruiting: true }),
    );
    expect(headerCtaAt(withoutLink, between)).toStrictEqual(
      headerCtaLink("member"),
    );
  });

  test("campaigns without a header CTA and malformed ones are left out", () => {
    const schedule = scheduleWith(
      campaign(undefined, { featuredEventId: "event-1" }),
      campaign(
        { variant: "elab", yieldsToRecruiting: false },
        { id: "bad", startDate: "2026-09-01" },
      ),
    );
    expect(schedule.campaigns).toStrictEqual([]);
  });

  test("the boundaries are the window's and each campaign's instants", () => {
    const schedule = scheduleWith(
      campaign({ variant: "elab", yieldsToRecruiting: true }),
    );
    expect(
      headerCtaBoundaries(schedule).map((instant) => instant.toISOString()),
    ).toStrictEqual([
      "2026-09-27T22:00:00.000Z",
      "2026-10-27T22:59:00.000Z",
      "2026-08-31T22:00:00.000Z",
      "2026-12-31T23:00:00.000Z",
    ]);
  });
});
