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
  const figure = screen.getByRole("figure", {
    name: hackathonsCopyTemplate.hero.ribbonLabel,
  });
  const list = within(figure).getByRole("list");
  const items = within(list).getAllByRole("listitem");
  expect(items[0]).toHaveTextContent(makeathonEditions[0].name);
  const finale = hackathonFacts.league.matches.at(-1);
  expect(items.at(-1)).toHaveTextContent(finale?.label ?? "");
  expect(screen.getByRole("slider")).toHaveAttribute(
    "aria-valuenow",
    String(items.length - 1),
  );
});

test("the hero claims both flagships and links to each one's site", async () => {
  await renderPage();
  const title = screen.getByRole("heading", { level: 1 });
  expect(title).toHaveAccessibleName(hackathonsCopyTemplate.hero.title);
  const hero = title.closest("section") as HTMLElement;
  for (const [label, url] of [
    [hackathonsCopyTemplate.hero.leagueAction, hackathonFacts.league.url],
    [hackathonsCopyTemplate.hero.makeathonAction, hackathonFacts.makeathonUrl],
  ]) {
    const link = within(hero).getByRole("link", { name: new RegExp(label) });
    expect(link).toHaveAttribute("href", url);
    expect(link).toHaveAttribute("target", "_blank");
  }
  // The Grand Finale is still to come on `now`: the hero points to it.
  expect(
    within(hero).getByRole("link", { name: /Grand Finale/ }),
  ).toHaveAttribute("href", "#league");
});

test("the league comes right after the hero, then the Makeathon", async () => {
  await renderPage();
  const titles = screen
    .getAllByRole("heading", { level: 2 })
    .map(({ textContent }) => textContent);
  expect(titles.slice(0, 2)).toStrictEqual([
    hackathonFacts.league.name,
    hackathonsCopyTemplate.makeathon.title,
  ]);
});

test("the league and the Makeathon each say Learn more, named by their site", async () => {
  await renderPage();
  for (const [name, url] of [
    [hackathonFacts.league.name, hackathonFacts.league.url],
    [hackathonsCopyTemplate.makeathon.title, hackathonFacts.makeathonUrl],
  ]) {
    const link = screen.getByRole("link", {
      name: `${hackathonsCopyTemplate.league.linkLabel}: ${name}`,
    });
    expect(link).toHaveTextContent(hackathonsCopyTemplate.league.linkLabel);
    expect(link).toHaveAttribute("href", url);
    expect(link).toHaveAttribute("target", "_blank");
  }
});

test("the season route lists every match, the next one with its countdown", async () => {
  await renderPage();
  const route = screen.getByRole("list", {
    name: hackathonsCopyTemplate.league.routeLabel,
  });
  const stops = within(route).getAllByRole("listitem");
  expect(stops).toHaveLength(hackathonFacts.league.matches.length);
  // 1 October to the finale on 10 October.
  expect(stops.at(-1)).toHaveTextContent("In 9 days");
});

test("visible copy has no em or en dashes", async () => {
  const { container } = await renderPage();
  expect(container.textContent).not.toMatch(/[–—]/);
});
