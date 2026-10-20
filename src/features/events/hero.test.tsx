import { axe } from "@test/axe";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { getMockEvents } from "@/lib/mock-cms";
import { indexHosts, summarizeEvents } from "./events";
import { EventsHero } from "./hero";

beforeEach(() => {
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
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
  vi.unstubAllEnvs();
});

/** The hero is an async server component: await its element, then render it. */
async function renderHero(events: Awaited<ReturnType<typeof getMockEvents>>) {
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
    const events = (await getMockEvents(new Date("2026-10-01T12:00:00Z"))).map(
      (event) => ({ ...event, hosts: [], coHosts: [] }),
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
    const events = await getMockEvents(new Date("2026-10-01T12:00:00Z"));
    const hosts = indexHosts(events);
    expect(hosts.length).toBeGreaterThan(1);
    await renderHero(events);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("×");
    expect(
      screen.getByRole("list", { name: /co-hosts/i }).children,
    ).toHaveLength(hosts.length);
  });

  test("synthetic referenced and typed co-hosts enable keyboard stepping and wraparound", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((media: string) => ({
        matches: media === "(prefers-reduced-motion: no-preference)",
        media,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    const user = userEvent.setup();
    const events = await getMockEvents(new Date("2026-10-01T12:00:00Z"));
    const hosts = indexHosts(events);
    expect(hosts.some(({ key }) => key)).toBe(true);
    expect(hosts.some(({ key }) => !key)).toBe(true);
    const { container } = await renderHero(events);
    const reel = await screen.findByRole("group", { name: /^Co-hosts:/ });
    const panels = [...container.querySelectorAll("[data-host-panel]")];
    expect(panels).toHaveLength(hosts.length);
    expect(panels.length).toBeGreaterThan(1);
    expect(panels[0]).toHaveAttribute("data-active", "");
    reel.focus();
    expect(reel).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(panels[1]).toHaveAttribute("data-active", ""));
    expect(panels[0]).not.toHaveAttribute("data-active");
    await user.keyboard("{ArrowUp}");
    await waitFor(() => expect(panels[0]).toHaveAttribute("data-active", ""));
    await user.keyboard("{ArrowUp}");
    await waitFor(() =>
      expect(panels.at(-1)).toHaveAttribute("data-active", ""),
    );
  });

  test("the reel shows a referenced co-host's dark logo, a typed name as text", async () => {
    const at = "2026-01-01T10:00:00Z";
    const [base] = await getMockEvents(new Date(at));
    const { container } = await renderHero([
      {
        ...base,
        id: "a",
        event_date: at,
        hosts: [],
        coHosts: [{ key: "example-company", name: "Example Company" }],
      },
      {
        ...base,
        id: "b",
        event_date: at,
        hosts: ["Unaffiliated co-host"],
        coHosts: [],
      },
    ]);
    const reel = container.querySelector(".events-reel");
    const sources = [...(reel?.querySelectorAll("img") ?? [])].map(
      (image) => image.getAttribute("src") ?? "",
    );
    expect(sources.some((src) => src.includes("fixtures/logo.svg"))).toBe(true);
    expect(reel).toHaveTextContent("Unaffiliated co-host");
    expect(reel).not.toHaveTextContent("Example Company");
  });
});
