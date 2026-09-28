import { axe } from "@test/axe";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { EventCategory, EventCity } from "@/lib/types";
import {
  EventListings,
  type EventMonthEntries,
  EventsFilterProvider,
  EventTotals,
} from "./events-browser";
import { EventFiltersPanel } from "./events-filters";
import { eventCategories, eventCities } from "./filters";

beforeEach(() => {
  // Reveal checks for reduced motion; with it, content shows immediately.
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  return () => vi.unstubAllGlobals();
});

const entry = (id: string, category?: EventCategory, city?: EventCity) => ({
  id,
  category,
  city,
  card: <article aria-label={id}>{id}</article>,
});

const upcoming: EventMonthEntries[] = [
  {
    key: "2026-10",
    monthName: "October",
    year: "2026",
    entries: [
      entry("Makeathon", "Hackathon", "Munich"),
      entry("Agents Workshop", "Event", "Online"),
    ],
  },
  {
    key: "2026-11",
    monthName: "November",
    year: "2026",
    entries: [entry("Demo Day", "E-Lab", "Munich")],
  },
];

const past: EventMonthEntries[] = [
  {
    key: "2026-09",
    monthName: "September",
    year: "2026",
    entries: [entry("NVIDIA Talk", "Speaker", "Munich")],
  },
];

function renderIsland() {
  return render(
    <EventsFilterProvider upcoming={upcoming} past={past}>
      <main>
        <h1>Events</h1>
        <EventFiltersPanel />
        <EventTotals />
        <EventListings />
      </main>
    </EventsFilterProvider>,
  );
}

const cards = () =>
  screen.queryAllByRole("article").map((card) => card.textContent);

describe("events filter island", () => {
  test("shows one chip per schema category and city, and every event", async () => {
    const { container } = renderIsland();

    const category = screen.getByRole("group", { name: "Category" });
    expect(
      within(category)
        .getAllByRole("button")
        .map((chip) => chip.firstChild?.textContent),
    ).toEqual(["All Categories", ...eventCategories]);
    const city = screen.getByRole("group", { name: "City" });
    expect(within(city).getAllByRole("button")).toHaveLength(
      eventCities.length + 1,
    );

    expect(cards()).toEqual([
      "Makeathon",
      "Agents Workshop",
      "Demo Day",
      "NVIDIA Talk",
    ]);
    expect(screen.getByText("(4 events)")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /Upcoming Events/ }),
    ).toHaveTextContent("(3)");
    expect(await axe(container)).toHaveNoViolations();
  });

  test("filters by category and city, updating counts, totals and months", async () => {
    const user = userEvent.setup();
    renderIsland();

    await user.click(screen.getByRole("button", { name: /^Munich/ }));
    expect(cards()).toEqual(["Makeathon", "Demo Day", "NVIDIA Talk"]);
    expect(screen.getByText("(3 events)")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^E-Lab/ }));
    expect(cards()).toEqual(["Demo Day"]);
    // October has no match left, so its month group is gone.
    expect(
      screen.queryByRole("heading", { level: 3, name: /October/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: /November/ }),
    ).toBeInTheDocument();
    // No past match: the archive section and its hero link disappear.
    expect(
      screen.queryByRole("heading", { level: 2, name: /Past Events/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Past Events/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Upcoming Events/ }),
    ).toHaveAttribute("href", "#upcoming-events");
  });

  test("Clear resets the filters and keeps focus on the chips", async () => {
    const user = userEvent.setup();
    renderIsland();
    const all = screen.getByRole("button", { name: /^All Categories/ });

    await user.click(screen.getByRole("button", { name: /^Speaker/ }));
    expect(all).toHaveAttribute("aria-pressed", "false");
    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(all).toHaveAttribute("aria-pressed", "true");
    expect(cards()).toHaveLength(4);
    expect(
      screen.queryByRole("button", { name: "Clear" }),
    ).not.toBeInTheDocument();
    await vi.waitFor(() => expect(all).toHaveFocus());
  });

  test("an empty result shows the empty state, whose Clear restores everything", async () => {
    const user = userEvent.setup();
    const { container } = renderIsland();

    await user.click(screen.getByRole("button", { name: /^Speaker/ }));
    await user.click(screen.getByRole("button", { name: /^Online/ }));
    expect(cards()).toEqual([]);
    expect(
      screen.getByText("No events found matching your filters."),
    ).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();

    const clearButtons = screen.getAllByRole("button", { name: "Clear" });
    await user.click(clearButtons[clearButtons.length - 1]);
    expect(cards()).toHaveLength(4);
    await vi.waitFor(() =>
      expect(
        screen.getByRole("button", { name: /^All Categories/ }),
      ).toHaveFocus(),
    );
  });
});
