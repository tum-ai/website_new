import { globSync } from "node:fs";
import { dirname, relative, sep } from "node:path";
import { describe, expect, test } from "vitest";
import { eLabConfig } from "@/config/e-lab";
import { membershipConfig } from "@/config/membership";
import {
  connectLinks,
  contributeLinks,
  getHeaderOptions,
  type HeaderCtaSetting,
  type HeaderCtaTable,
  headerConnectLinks,
  headerCtaLink,
  headerCtaSetting,
  headerCtas,
  legalLinks,
  mainNavigation,
  selectHeaderCta,
} from "@/config/navigation";

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

/** The CTA every route without an override shows. */
const defaultCta = headerCtaLink(
  selectHeaderCta({
    ...headerCtaSetting,
    membershipOpen: membershipConfig.applicationsOpen,
  }),
);

test("the header defaults to the configured CTA with a transparent pill", () => {
  expect(defaultCta).not.toBeNull();
  expect(getHeaderOptions("/events")).toStrictEqual({
    solid: false,
    cta: defaultCta,
    hideLogoUntilScroll: false,
  });
});

test("home shows the logo from the start, like every route", () => {
  expect(getHeaderOptions("/")).toStrictEqual({
    hideLogoUntilScroll: false,
    solid: false,
    cta: defaultCta,
  });
});

test("partners is solid and links to its own contact section", () => {
  expect(getHeaderOptions("/partners")).toStrictEqual({
    solid: true,
    cta: { label: "Become a partner", href: "#partner-contact" },
    hideLogoUntilScroll: false,
  });
  // Exact match only: sub-paths get the defaults.
  expect(getHeaderOptions("/partners/x").solid).toBe(false);
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
