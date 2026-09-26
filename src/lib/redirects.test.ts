import { expect, test } from "vitest";
import { getJoinHostRedirectDestination } from "@/lib/redirects";

test("join host redirects to the apply page", () => {
  const redirectUrl = getJoinHostRedirectDestination(
    "join.tum-ai.com",
    "https://join.tum-ai.com/some/path?utm=1",
  );

  expect(redirectUrl?.toString()).toBe("https://join.tum-ai.com/apply");
});

test("join host does not redirect the apply page to itself", () => {
  const redirectUrl = getJoinHostRedirectDestination(
    "join.tum-ai.com",
    "https://join.tum-ai.com/apply",
  );

  expect(redirectUrl).toBeNull();
});

test("other hosts are not redirected", () => {
  const redirectUrl = getJoinHostRedirectDestination(
    "tum-ai.com",
    "https://tum-ai.com/events",
  );

  expect(redirectUrl).toBeNull();
});
