import { expect, test } from "vitest";
import {
  getCalBooking,
  getSafeExternalUrl,
  serializeJsonLd,
} from "@/lib/security";

test("getSafeExternalUrl allows http and https", () => {
  expect(getSafeExternalUrl("https://www.tum-ai.com/apply")).toBe(
    "https://www.tum-ai.com/apply",
  );
  expect(getSafeExternalUrl("http://localhost:3000/events")).toBe(
    "http://localhost:3000/events",
  );
});

test("getSafeExternalUrl rejects unsafe or invalid protocols", () => {
  expect(getSafeExternalUrl("javascript:alert(1)")).toBeNull();
  expect(
    getSafeExternalUrl("data:text/html,<script>alert(1)</script>"),
  ).toBeNull();
  expect(getSafeExternalUrl("not-a-url")).toBeNull();
});

test("serializeJsonLd escapes characters that can break out of a script tag", () => {
  const serialized = serializeJsonLd({
    name: "</script><script>alert(1)</script>",
    ampersand: "A&B",
  });

  expect(serialized).not.toMatch(/<\/script>/i);
  expect(serialized).toMatch(/\\u003c\/script\\u003e/i);
  expect(serialized).toMatch(/\\u0026/);
});

test("getCalBooking takes Cal booking pages only", () => {
  expect(getCalBooking("https://cal.eu/ada/intro")).toStrictEqual({
    calLink: "ada/intro",
    calOrigin: "https://cal.eu",
    embedJsUrl: "https://cal.eu/embed.js",
  });
  expect(getCalBooking("https://cal.com/ada")?.embedJsUrl).toBe(
    "https://cal.com/embed.js",
  );
  for (const value of [
    undefined,
    "",
    "not a url",
    "http://cal.eu/ada",
    "https://evil.example/ada",
    "https://cal.eu.evil.example/ada",
    "https://app.cal.eu/ada",
    "https://user@cal.eu/ada",
    "https://cal.eu:444/ada",
    "https://cal.eu",
  ]) {
    expect(getCalBooking(value), String(value)).toBeNull();
  }
});
