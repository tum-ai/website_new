import { axe } from "@test/axe";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { getMockEvents } from "@/lib/mock-cms";
import { indexHosts, summarizeEvents } from "./events";
import { EventsHero } from "./hero";

beforeEach(() => {
  // Reduced motion: the static index, as without JavaScript.
  vi.stubGlobal(
    "matchMedia",
    vi.fn((media: string) => ({
      matches: false,
      media,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** The hero is an async server component: await its element, then render it. */
async function renderHero(events: ReturnType<typeof getMockEvents>) {
  return render(
    await EventsHero({
      summary: summarizeEvents(events),
      hosts: indexHosts(events),
      hasUpcoming: false,
    }),
  );
}

describe("EventsHero", () => {
  test("shows the plain logo, without a ×, while no event has co-hosts", async () => {
    const events = getMockEvents(new Date("2026-10-01T12:00:00Z")).map(
      (event) => ({ ...event, hosts: [] }),
    );
    const { container } = await renderHero(events);
    const title = screen.getByRole("heading", { level: 1 });
    // jsdom drops the space before " events" that browsers keep.
    expect(title).toHaveAccessibleName(/^TUM\.ai\s*events$/);
    expect(title).not.toHaveTextContent("×");
    expect(
      screen.queryByRole("list", { name: /co-hosts/i }),
    ).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  test("sets the × before the co-host index when there are co-hosts", async () => {
    const events = getMockEvents(new Date("2026-10-01T12:00:00Z"));
    const hosts = indexHosts(events);
    expect(hosts.length).toBeGreaterThan(0);
    await renderHero(events);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("×");
    expect(
      screen.getByRole("list", { name: /co-hosts/i }).children,
    ).toHaveLength(hosts.length);
  });
});
