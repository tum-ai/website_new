import { globSync } from "node:fs";
import { dirname, relative, sep } from "node:path";
import { expect, test } from "vitest";
import {
  connectLinks,
  contributeLinks,
  getHeaderOptions,
  headerConnectLinks,
  legalLinks,
  mainNavigation,
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

test("the header defaults to the membership CTA with a transparent pill", () => {
  expect(getHeaderOptions("/events")).toStrictEqual({
    solid: false,
    cta: { label: "Become a Member", href: "/apply" },
    hideLogoUntilScroll: false,
  });
});

test("home hides the logo until the hero scrolls away", () => {
  expect(getHeaderOptions("/")).toMatchObject({
    hideLogoUntilScroll: true,
    solid: false,
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
