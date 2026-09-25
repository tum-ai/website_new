import { expect, test } from "vitest";
import { getSafeExternalUrl, serializeJsonLd } from "../src/lib/security.ts";

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
