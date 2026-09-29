import { axe } from "@test/axe";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { EventCategory } from "@/lib/types";
import { RegisterFilter, type RegisterSemester } from "./register-filter";

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

const entry = (id: string, category?: EventCategory) => ({
  id,
  category,
  row: <article aria-label={id}>{id}</article>,
});

const semesters: RegisterSemester[] = [
  {
    key: "2026-summer",
    label: "Summer semester 2026",
    entries: [entry("Energy Hack", "Hackathon"), entry("Midterm", "Event")],
  },
  {
    key: "2025-winter",
    label: "Winter semester 2025/26",
    entries: [
      entry("Christmas Hackathon", "Hackathon"),
      entry("Talk", "Speaker"),
    ],
  },
];

const rows = () =>
  screen.queryAllByRole("article").map((row) => row.textContent);

function renderRegister() {
  return render(
    <main>
      <h2>Past events</h2>
      <RegisterFilter semesters={semesters} />
    </main>,
  );
}

describe("register filter", () => {
  test("offers All and each category that has events, with counts", async () => {
    const { container } = renderRegister();
    const chips = within(screen.getByRole("group", { name: "Category" }))
      .getAllByRole("button")
      .map((chip) => chip.textContent);
    expect(chips).toEqual(["All4", "Hackathons2", "Talks1", "Other events1"]);
    expect(rows()).toEqual([
      "Energy Hack",
      "Midterm",
      "Christmas Hackathon",
      "Talk",
    ]);
    expect(
      screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent),
    ).toEqual(["Summer semester 2026", "Winter semester 2025/26"]);
    expect(await axe(container)).toHaveNoViolations();
  });

  test("a chip filters the rows and drops semesters left empty", async () => {
    const user = userEvent.setup();
    renderRegister();
    await user.click(screen.getByRole("button", { name: /^Talks/ }));
    expect(rows()).toEqual(["Talk"]);
    expect(
      screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent),
    ).toEqual(["Winter semester 2025/26"]);
    // The semester count and the live region both say it.
    expect(screen.getAllByText("1 event")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: /^All/ }));
    expect(rows()).toHaveLength(4);
  });

  test("without two categories to choose from, there are no chips", () => {
    render(
      <RegisterFilter
        semesters={[
          {
            key: "k",
            label: "Summer semester 2026",
            entries: [entry("A", "Hackathon")],
          },
        ]}
      />,
    );
    expect(screen.queryByRole("group")).toBeNull();
  });
});
