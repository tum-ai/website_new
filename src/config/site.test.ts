import { expect, test } from "vitest";
import { absoluteUrl, siteConfig, siteTitle } from "@/config/site";

test("the canonical origin has a scheme and no trailing slash", () => {
  expect(siteConfig.url).toMatch(/^https:\/\/[^/]+$/);
});

test("absoluteUrl joins site paths onto the canonical origin", () => {
  expect(absoluteUrl("/events")).toBe(`${siteConfig.url}/events`);
  expect(absoluteUrl("/partners#contact")).toBe(
    `${siteConfig.url}/partners#contact`,
  );
  expect(absoluteUrl("/")).toBe(siteConfig.url);
  expect(absoluteUrl()).toBe(siteConfig.url);
});

test.each(["events", "https://example.com/x", "//example.com/x", ""])(
  "absoluteUrl rejects %j",
  (path) => {
    expect(() => absoluteUrl(path)).toThrow(/site-relative/);
  },
);

test("the default title is the name plus the canonical tagline", () => {
  expect(siteTitle).toBe(`${siteConfig.name} - ${siteConfig.tagline}`);
});
