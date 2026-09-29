import { globSync } from "node:fs";
import { dirname, relative, sep } from "node:path";
import { describe, expect, test } from "vitest";
import { eLabConfig } from "@/config/e-lab";
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
