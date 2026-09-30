import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { socialLinks } from "@/config/contact";
import { Upcoming } from "./upcoming";

/*
 * Reduced motion keeps every Reveal in its idle, visible state, so jsdom
 * needs no IntersectionObserver.
 */
beforeEach(() => {
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
});

test("with nothing scheduled, it says where new dates are announced, with links", async () => {
  render(await Upcoming({ events: [] }));
  const note = screen.getByText(/Nothing is scheduled right now\./);
  expect(note).toHaveTextContent(
    /^Nothing is scheduled right now\. We announce new dates on Instagram.* and LinkedIn.*\.$/,
  );
  expect(screen.getByRole("link", { name: /^Instagram/ })).toHaveAttribute(
    "href",
    socialLinks.instagram,
  );
  expect(screen.getByRole("link", { name: /^LinkedIn/ })).toHaveAttribute(
    "href",
    socialLinks.linkedin,
  );
});
