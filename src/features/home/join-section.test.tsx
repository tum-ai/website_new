import { axe } from "@test/axe";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { MemberStory } from "@/features/community";
import type { HomeCopy } from "./data/homepage";
import { JoinSection } from "./join-section";

vi.mock("@/features/community/server", () => ({
  MembershipApplyButton: () => <a href="/apply">Apply</a>,
}));

const join: HomeCopy["join"] = {
  title: "Build with our team",
  lead: "Bring a project to life.",
  stepsTitle: "This application round",
  steps: [
    { title: "Apply", dates: "3 to 12 October" },
    { title: "Meet", dates: "15 October" },
    { title: "Start", dates: "20 October" },
  ],
  quotes: [
    {
      key: "selected-member",
      name: "Example Member",
      excerpt: "We made the prototype together.",
    },
  ],
};
const stories: MemberStory[] = [
  {
    key: "other-member",
    name: "Example Member",
    role: "Different programme",
    story: "Another member story.",
    image: "/assets/fixtures/photo.svg",
  },
  {
    key: "selected-member",
    name: "Example Member",
    role: "Selected programme",
    story: join.quotes[0]?.excerpt ?? "",
    image: "/assets/fixtures/photo.svg",
  },
];

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((media: string) => ({
      matches: true,
      media,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});
afterEach(() => vi.unstubAllGlobals());

test("the animated join band preserves supplied copy, dates and author identity", async () => {
  const { container } = render(<JoinSection join={join} stories={stories} />);
  expect(screen.getByRole("heading", { name: join.title })).toBeVisible();
  expect(screen.getByText(join.lead)).toBeVisible();
  for (const step of join.steps) {
    expect(screen.getByText(step.title, { selector: "p" })).toBeVisible();
    expect(screen.getByText(step.dates)).toBeVisible();
  }
  expect(screen.getByText(`“${join.quotes[0]?.excerpt}”`)).toBeVisible();
  expect(screen.getByText("Selected programme")).toBeVisible();
  expect(screen.queryByText("Different programme")).not.toBeInTheDocument();
  expect(await axe(container)).toHaveNoViolations();
});

test.each(["shortened", "reordered"])(
  "a %s CMS member list starts with its new first quote selected",
  (change) => {
    const second = {
      key: "other-member",
      name: "Example Member",
      excerpt: "Another member story.",
    };
    const both = { ...join, quotes: [...join.quotes, second] };
    const { rerender, container } = render(
      <JoinSection join={both} stories={stories} />,
    );
    const before = screen.getAllByRole("button", { name: "Example Member" });
    fireEvent.focus(before[1]);
    expect(before[1]).toHaveAttribute("aria-pressed", "true");
    const changed =
      change === "shortened"
        ? join
        : { ...join, quotes: both.quotes.toReversed() };
    rerender(<JoinSection join={changed} stories={stories} />);
    const after = screen.getAllByRole("button", { name: "Example Member" });
    expect(after[0]).toHaveAttribute("aria-pressed", "true");
    expect(
      after
        .slice(1)
        .every((button) => button.getAttribute("aria-pressed") === "false"),
    ).toBe(true);
    const firstExcerpt = changed.quotes[0]?.excerpt;
    expect(screen.getByText(`“${firstExcerpt}”`)).toHaveAttribute(
      "aria-hidden",
      "false",
    );
    expect(
      container.querySelector('[aria-live="polite"]'),
    ).toBeEmptyDOMElement();
  },
);
