import { axe } from "@test/axe";
import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { hackathonFacts } from "@/config/hackathons";
import { getMockEvents } from "@/lib/mock-cms";
import { hackathonsCopyTemplate } from "./data/copy";
import { makeathonEditions } from "./data/makeathon";
import { HackathonsPage } from "./hackathons-page";

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
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const now = new Date("2026-10-01T12:00:00Z");
const renderPage = async () =>
  render(await HackathonsPage({ events: getMockEvents(now), now }));

test("one h1, ordered bands, and no axe violations", async () => {
  const { container } = await renderPage();
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  expect(await axe(container)).toHaveNoViolations();
});

test("the ribbon lists every hackathon from the first Makeathon, and the next one", async () => {
  await renderPage();
  const list = screen.getByRole("list", {
    name: hackathonsCopyTemplate.hero.ribbonLabel,
  });
  const items = within(list).getAllByRole("listitem");
  expect(items[0]).toHaveTextContent(makeathonEditions[0].name);
  const finale = hackathonFacts.league.matches.at(-1);
  expect(items.at(-1)).toHaveTextContent(finale?.label ?? "");
  expect(screen.getByRole("slider")).toHaveAttribute(
    "aria-valuenow",
    String(items.length - 1),
  );
});

test("the league links out to its own site, in a new tab", async () => {
  await renderPage();
  const link = screen.getByRole("link", {
    name: new RegExp(hackathonsCopyTemplate.league.linkLabel),
  });
  expect(link).toHaveAttribute("href", hackathonFacts.league.url);
  expect(link).toHaveAttribute("target", "_blank");
});

test("visible copy has no em or en dashes", async () => {
  const { container } = await renderPage();
  expect(container.textContent).not.toMatch(/[–—]/);
});
