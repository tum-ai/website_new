import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { eventsCopyFixture } from "@/lib/cms-fixtures/hackathons";
import { settingsFixtureFacts } from "@/lib/cms-fixtures/settings";
import { Upcoming } from "./upcoming";

/*
 * Reduced motion keeps every Reveal in its idle, visible state, so jsdom
 * needs no IntersectionObserver.
 */
beforeEach(() => {
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion: reduce"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

test("with nothing scheduled, it says where new dates are announced, with links", async () => {
  render(await Upcoming({ events: [] }));
  const note = screen.getByText(
    (_, element) =>
      element?.tagName === "P" &&
      Boolean(
        element.textContent?.startsWith(
          eventsCopyFixture.upcoming.empty.split("{{")[0],
        ),
      ),
  );
  expect(note).toHaveTextContent(/Instagram.* and LinkedIn/);
  expect(screen.getByRole("link", { name: /^Instagram/ })).toHaveAttribute(
    "href",
    settingsFixtureFacts.socialLinks.instagram,
  );
  expect(screen.getByRole("link", { name: /^LinkedIn/ })).toHaveAttribute(
    "href",
    settingsFixtureFacts.socialLinks.linkedin,
  );
});
