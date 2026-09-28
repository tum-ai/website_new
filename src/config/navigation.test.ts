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
  type HeaderCtaVariant,
  headerConnectLinks,
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
const defaultCta = selectHeaderCta(
  headerCtaSetting,
  membershipConfig.applicationsOpen,
);

test("the header defaults to the configured CTA with a transparent pill", () => {
  expect(defaultCta).not.toBeNull();
  expect(getHeaderOptions("/events")).toStrictEqual({
    solid: false,
    cta: defaultCta,
    hideLogoUntilScroll: false,
  });
});

test("home hides the logo until the hero scrolls away", () => {
  expect(getHeaderOptions("/")).toStrictEqual({
    hideLogoUntilScroll: true,
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
  const link = (variant: HeaderCtaVariant) => {
    const { label, href } = headerCtas[variant];
    return { label, href };
  };

  test("auto shows member while membership applications are open", () => {
    expect(
      selectHeaderCta({ variant: "auto", fallback: "partner" }, true),
    ).toStrictEqual(link("member"));
  });

  test("auto shows the fallback while membership applications are closed", () => {
    for (const fallback of ["member", "partner", "elab"] as const) {
      expect(
        selectHeaderCta({ variant: "auto", fallback }, false),
        fallback,
      ).toStrictEqual(link(fallback));
    }
  });

  test("a pinned variant wins over the recruiting round", () => {
    for (const open of [true, false]) {
      expect(
        selectHeaderCta({ variant: "elab", fallback: "partner" }, open),
      ).toStrictEqual(link("elab"));
    }
  });

  test("a variant without an href falls back to member", () => {
    const notify: HeaderCtaSetting = {
      // @ts-expect-error: the setting only accepts variants with an href.
      variant: "notify",
      fallback: "partner",
    };
    expect(selectHeaderCta(notify, false)).toStrictEqual(link("member"));
    // The same holds for a table that drops a target later: no dead button.
    const ctas = { ...headerCtas, partner: { label: "Partner", href: null } };
    expect(
      selectHeaderCta({ variant: "auto", fallback: "partner" }, false, ctas),
    ).toStrictEqual(link("member"));
  });

  test("no CTA when neither the wanted variant nor member has an href", () => {
    const ctas = {
      ...headerCtas,
      member: { label: "Member", href: null },
      partner: { label: "Partner", href: null },
    };
    expect(
      selectHeaderCta({ variant: "auto", fallback: "partner" }, false, ctas),
    ).toBeNull();
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
