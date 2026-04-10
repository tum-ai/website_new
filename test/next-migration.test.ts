import assert from "node:assert/strict";
import test from "node:test";
import { buildMetadata, getJsonLd } from "../src/config/seo.ts";
import { getJoinHostRedirectDestination } from "../src/lib/redirects.ts";

test("buildMetadata preserves canonical URLs for static routes", () => {
  const metadata = buildMetadata("events");

  assert.equal(metadata.title, "Events");
  assert.equal(metadata.alternates?.canonical, "https://www.tum-ai.com/events");
  assert.equal(metadata.openGraph?.url, "https://www.tum-ai.com/events");
  assert.equal(metadata.openGraph?.siteName, "TUM.ai");
  assert.equal(metadata.twitter?.card, "summary_large_image");
  assert.deepEqual(metadata.twitter?.images, [
    "/assets/logo_new_white_standard.png",
  ]);
});

test("getJsonLd returns structured data for the homepage", () => {
  const jsonLd = getJsonLd("home");

  assert.equal(jsonLd.length, 2);
});

test("join host redirects to the apply page", () => {
  const redirectUrl = getJoinHostRedirectDestination(
    "join.tum-ai.com",
    "https://join.tum-ai.com/some/path?utm=1",
  );

  assert.equal(redirectUrl?.toString(), "https://join.tum-ai.com/apply");
});

test("other hosts are not redirected", () => {
  const redirectUrl = getJoinHostRedirectDestination(
    "tum-ai.com",
    "https://tum-ai.com/events",
  );

  assert.equal(redirectUrl, null);
});
