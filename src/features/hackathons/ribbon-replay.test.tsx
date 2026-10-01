import { axe } from "@test/axe";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { RibbonReplay } from "./ribbon-replay";

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

/** `matchMedia` answering `replay` for the replay's query. */
function stubMedia(replay: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("min-width") ? replay : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

beforeEach(() => stubMedia(false));
afterEach(() => vi.unstubAllGlobals());

const renderReplay = () =>
  render(
    <RibbonReplay
      entries={entries}
      defaultIndex={2}
      label="Hackathon timeline"
      intro={<h1>Our hackathons</h1>}
      track={<div data-testid="track" />}
      compact={<div data-testid="compact" />}
      legend={<p>Key</p>}
    />,
  );

test("without the replay it rests on the next hackathon, numbered", async () => {
  const { container } = renderReplay();
  const slider = screen.getByRole("slider", { name: "Hackathon timeline" });
  expect(slider).toHaveAttribute("aria-valuenow", "2");
  expect(slider).toHaveAttribute(
    "aria-valuetext",
    "Next: Grand Finale, 10 to 11 October 2026",
  );
  expect(container).toHaveTextContent("03");
  expect(await axe(container)).toHaveNoViolations();
});

test("the arrow keys, Home and End step through the hackathons", async () => {
  const user = userEvent.setup();
  renderReplay();
  const slider = screen.getByRole("slider");
  slider.focus();
  await user.keyboard("{ArrowLeft}");
  expect(slider).toHaveAttribute(
    "aria-valuetext",
    "Other hackathon: BKW Hackathon, 18 to 19 October 2025",
  );
  await user.keyboard("{Home}");
  expect(slider).toHaveAttribute("aria-valuenow", "0");
  await user.keyboard("{ArrowLeft}");
  expect(slider).toHaveAttribute("aria-valuenow", "0");
  await user.keyboard("{End}");
  expect(slider).toHaveAttribute("aria-valuenow", "2");
  await user.keyboard("{ArrowRight}");
  expect(slider).toHaveAttribute("aria-valuenow", "2");
});

test("a tap or the pointer picks the nearest hackathon", () => {
  renderReplay();
  const slider = screen.getByRole("slider");
  slider.getBoundingClientRect = () =>
    ({ left: 0, width: 1000, top: 0, height: 100 }) as DOMRect;
  fireEvent.pointerDown(slider, { clientX: 120 });
  expect(slider).toHaveAttribute("aria-valuenow", "0");
  fireEvent.pointerMove(slider, { clientX: 480 });
  expect(slider).toHaveAttribute("aria-valuenow", "1");
});

test("with the replay, scrolling the band moves from the first hackathon to the next", () => {
  stubMedia(true);
  vi.stubGlobal("innerHeight", 1000);
  const frames: FrameRequestCallback[] = [];
  vi.stubGlobal("requestAnimationFrame", (run: FrameRequestCallback) =>
    frames.push(run),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  const scroll = () =>
    act(() => {
      window.dispatchEvent(new Event("scroll"));
      for (const run of frames.splice(0)) run(0);
    });
  const { container } = renderReplay();
  const band = container.firstElementChild as HTMLElement;
  let top = 0;
  band.getBoundingClientRect = () =>
    ({ top, height: 3000, left: 0, width: 1000 }) as DOMRect;
  const slider = screen.getByRole("slider");

  scroll();
  expect(slider).toHaveAttribute("aria-valuenow", "0");

  // Halfway through the band's travel (2000px): past the middle mark.
  top = -1100;
  scroll();
  expect(slider).toHaveAttribute("aria-valuenow", "1");

  top = -2000;
  scroll();
  expect(slider).toHaveAttribute("aria-valuenow", "2");
});

test("both layouts are rendered for CSS to choose between", () => {
  renderReplay();
  expect(screen.getByTestId("track")).toBeInTheDocument();
  expect(screen.getByTestId("compact")).toBeInTheDocument();
});
