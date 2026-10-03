import { axe } from "@test/axe";
import { render, screen } from "@testing-library/react";
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
  quote: {
    key: "selected-member",
    name: "Example Member",
    excerpt: "We made the prototype together.",
  },
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
    story: join.quote.excerpt,
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
  expect(screen.getByText(`“${join.quote.excerpt}”`)).toBeVisible();
  expect(screen.getByText("Selected programme")).toBeVisible();
  expect(screen.queryByText("Different programme")).not.toBeInTheDocument();
  expect(await axe(container)).toHaveNoViolations();
});
