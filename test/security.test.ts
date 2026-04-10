import assert from "node:assert/strict";
import test from "node:test";
import { getSafeExternalUrl, serializeJsonLd } from "../src/lib/security.ts";

test("getSafeExternalUrl allows http and https", () => {
  assert.equal(
    getSafeExternalUrl("https://www.tum-ai.com/apply"),
    "https://www.tum-ai.com/apply",
  );
  assert.equal(
    getSafeExternalUrl("http://localhost:3000/events"),
    "http://localhost:3000/events",
  );
});

test("getSafeExternalUrl rejects unsafe or invalid protocols", () => {
  assert.equal(getSafeExternalUrl("javascript:alert(1)"), null);
  assert.equal(
    getSafeExternalUrl("data:text/html,<script>alert(1)</script>"),
    null,
  );
  assert.equal(getSafeExternalUrl("not-a-url"), null);
});

test("serializeJsonLd escapes characters that can break out of a script tag", () => {
  const serialized = serializeJsonLd({
    name: "</script><script>alert(1)</script>",
    ampersand: "A&B",
  });

  assert.doesNotMatch(serialized, /<\/script>/i);
  assert.match(serialized, /\\u003c\/script\\u003e/i);
  assert.match(serialized, /\\u0026/);
});
