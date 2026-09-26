import { expect, test } from "vitest";
import {
  buildMetadata,
  getJsonLd,
  rootMetadata,
  type SEOPageKey,
} from "@/config/seo";
import { absoluteUrl, siteConfig, siteTitle } from "@/config/site";

const keys: SEOPageKey[] = [
  "home",
  "events",
  "research",
  "projects",
  "entrepreneurship",
  "community",
  "partners",
  "apply",
  "qanda",
  "imprint",
  "data-privacy",
  "disclaimer",
];

/** Every string value in a JSON-LD tree that looks like a URL. */
function urlsIn(value: unknown): string[] {
  if (typeof value === "string")
    return /^https?:\/\//.test(value) ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(urlsIn);
  if (value && typeof value === "object")
    return Object.values(value).flatMap(urlsIn);
  return [];
}

test.each(keys)("%s: canonical and Open Graph URL agree", (key) => {
  const metadata = buildMetadata(key);
  const canonical = metadata.alternates?.canonical;
  expect(new URL(String(canonical)).origin).toBe(siteConfig.url);
  expect(metadata.openGraph).toMatchObject({
    url: canonical,
    siteName: siteConfig.name,
  });
});

test("the homepage canonical is the bare origin", () => {
  expect(buildMetadata("home").alternates?.canonical).toBe(absoluteUrl());
  expect(buildMetadata("entrepreneurship").alternates?.canonical).toBe(
    absoluteUrl("/e-lab"),
  );
});

test.each(keys)(
  "%s: JSON-LD starts with the Organization and names the page URL",
  (key) => {
    const [organization, page] = getJsonLd(key) as Record<string, unknown>[];
    expect(organization["@type"]).toBe("Organization");
    expect(page.url).toBe(buildMetadata(key).alternates?.canonical);
    // Every URL on the site's own domain uses the canonical origin.
    const { hostname } = new URL(siteConfig.url);
    const siteDomain = hostname.replace(/^www\./, "");
    for (const url of urlsIn(page)) {
      const host = new URL(url).hostname;
      if (host === siteDomain || host.endsWith(`.${siteDomain}`)) {
        expect(new URL(url).origin).toBe(siteConfig.url);
      }
    }
  },
);

test("the root layout defaults come from the site config", () => {
  expect(rootMetadata.metadataBase.href).toBe(`${siteConfig.url}/`);
  expect(rootMetadata.title).toStrictEqual({
    default: siteTitle,
    template: `%s | ${siteConfig.name}`,
  });
});
