import assert from "node:assert/strict";
import test from "node:test";
import { getJoinHostRedirectDestination } from "../src/lib/redirects.ts";

test("join host redirects to the apply page", () => {
  const redirectUrl = getJoinHostRedirectDestination(
    "join.tum-ai.com",
    "https://join.tum-ai.com/some/path?utm=1",
  );

  assert.equal(redirectUrl?.toString(), "https://join.tum-ai.com/apply");
});

test("join host does not redirect the apply page to itself", () => {
  const redirectUrl = getJoinHostRedirectDestination(
    "join.tum-ai.com",
    "https://join.tum-ai.com/apply",
  );

  assert.equal(redirectUrl, null);
});

test("other hosts are not redirected", () => {
  const redirectUrl = getJoinHostRedirectDestination(
    "tum-ai.com",
    "https://tum-ai.com/events",
  );

  assert.equal(redirectUrl, null);
});
