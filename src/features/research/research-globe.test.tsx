import { axe } from "@test/axe";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { labSites } from "./data/lab-sites";
import { getLabSites } from "./research";
import { ResearchGlobe } from "./research-globe";

// jsdom has no WebGL: cobe fails to start, so the globe stays hidden while
// the slider semantics and keyboard turning still work.
vi.mock("cobe", () => ({
  default: () => {
    throw new Error("no WebGL");
  },
}));

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion: reduce"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

const { sites } = getLabSites(["MIT", "IBM Almaden", "Inria"], labSites);

describe("ResearchGlobe", () => {
  test("is a named slider that says which places it shows", async () => {
    const { container } = render(<ResearchGlobe sites={sites} />);
    const globe = screen.getByRole("slider", {
      name: "Globe of our research sites",
    });
    expect(globe).toHaveAccessibleDescription(
      /Arcs run from Munich to Boston \(MIT\); San Jose \(IBM Almaden\); Paris \(Inria\)/,
    );
    expect(globe).toHaveAttribute("aria-valuetext", "Centred on 28° west");
    expect(await axe(container)).toHaveNoViolations();
  });

  test("the arrow keys turn it and announce the new centre", async () => {
    const user = userEvent.setup();
    render(<ResearchGlobe sites={sites} />);
    const globe = screen.getByRole("slider");
    const before = Number(globe.getAttribute("aria-valuenow"));
    globe.focus();
    await user.keyboard("{ArrowRight}");
    // A right turn brings places to the east into view.
    expect(Number(globe.getAttribute("aria-valuenow"))).toBeGreaterThan(before);
  });

  test("the zoom buttons wait for the globe to render", () => {
    render(<ResearchGlobe sites={sites} />);
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeDisabled();
  });
});

describe("ResearchGlobe dragging", () => {
  /** The globe's canvas, with pointer capture (missing in jsdom) stubbed. */
  function canvasOf(container: HTMLElement) {
    const canvas = container.querySelector("canvas");
    if (!canvas) throw new Error("no canvas");
    canvas.setPointerCapture = vi.fn();
    return canvas;
  }

  /** Whether an arrow key still reports the new centre (no drag holds it). */
  async function reportsTurns() {
    const globe = screen.getByRole("slider");
    const before = globe.getAttribute("aria-valuenow");
    globe.focus();
    await userEvent.setup().keyboard("{ArrowRight}");
    return globe.getAttribute("aria-valuenow") !== before;
  }

  test("a secondary click does not start a drag", async () => {
    const { container } = render(<ResearchGlobe sites={sites} />);
    fireEvent.pointerDown(canvasOf(container), { button: 2, pointerId: 1 });
    expect(await reportsTurns()).toBe(true);
  });

  test("a drag ends when the pointer capture is lost", async () => {
    const { container } = render(<ResearchGlobe sites={sites} />);
    const canvas = canvasOf(container);
    fireEvent.pointerDown(canvas, { button: 0, pointerId: 1 });
    expect(await reportsTurns()).toBe(false);
    fireEvent(canvas, new Event("lostpointercapture"));
    expect(await reportsTurns()).toBe(true);
  });
});

test("keeps the reader's view when a refresh hands over the same sites", async () => {
  const { rerender } = render(<ResearchGlobe sites={sites} />);
  const globe = screen.getByRole("slider");
  globe.focus();
  await userEvent.setup().keyboard("{ArrowRight}");
  const turned = globe.getAttribute("aria-valuenow");

  rerender(<ResearchGlobe sites={structuredClone(sites)} />);
  expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", turned);
});
