import { axe } from "@test/axe";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { RibbonScrubber } from "./ribbon-scrubber";

const entries = [
  {
    id: "a",
    title: "GPT-3 Makeathon",
    dates: "18 April 2021",
    label: "Makeathon",
    x: 0.1,
    w: 0.01,
  },
  {
    id: "b",
    title: "BKW Hackathon",
    dates: "18 to 19 October 2025",
    label: "Other hackathon",
    x: 0.5,
    w: 0.01,
  },
  {
    id: "c",
    title: "Grand Finale",
    dates: "10 to 11 October 2026",
    label: "Next",
    x: 0.9,
    w: 0.01,
  },
];

const renderScrubber = () =>
  render(
    <RibbonScrubber
      entries={entries}
      defaultIndex={2}
      label="Hackathon timeline"
      track={<div data-testid="track" />}
      compact={<div data-testid="compact" />}
    />,
  );

test("starts on the default hackathon and names it", async () => {
  const { container } = renderScrubber();
  const slider = screen.getByRole("slider", { name: "Hackathon timeline" });
  expect(slider).toHaveAttribute("aria-valuenow", "2");
  expect(slider).toHaveAttribute(
    "aria-valuetext",
    "Grand Finale, 10 to 11 October 2026",
  );
  expect(screen.getByText("Next")).toBeInTheDocument();
  expect(await axe(container)).toHaveNoViolations();
});

test("the arrow keys, Home and End step through the hackathons", async () => {
  const user = userEvent.setup();
  renderScrubber();
  const slider = screen.getByRole("slider");
  slider.focus();
  await user.keyboard("{ArrowLeft}");
  expect(slider).toHaveAttribute(
    "aria-valuetext",
    "BKW Hackathon, 18 to 19 October 2025",
  );
  expect(screen.getByText("Other hackathon")).toBeInTheDocument();
  await user.keyboard("{Home}");
  expect(slider).toHaveAttribute("aria-valuenow", "0");
  await user.keyboard("{ArrowLeft}");
  expect(slider).toHaveAttribute("aria-valuenow", "0");
  await user.keyboard("{End}");
  expect(slider).toHaveAttribute("aria-valuenow", "2");
  await user.keyboard("{ArrowRight}");
  expect(slider).toHaveAttribute("aria-valuenow", "2");
});

test("the pointer picks the nearest hackathon", () => {
  renderScrubber();
  const slider = screen.getByRole("slider");
  slider.getBoundingClientRect = () =>
    ({ left: 0, width: 1000, top: 0, height: 100 }) as DOMRect;
  fireEvent.pointerMove(slider, { clientX: 120 });
  expect(slider).toHaveAttribute("aria-valuenow", "0");
  expect(screen.getByText("GPT-3 Makeathon")).toBeInTheDocument();
});

test("both layouts are rendered for CSS to choose between", () => {
  renderScrubber();
  expect(screen.getByTestId("track")).toBeInTheDocument();
  expect(screen.getByTestId("compact")).toBeInTheDocument();
});
