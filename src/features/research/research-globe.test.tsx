import { axe } from "@test/axe";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { labSitesFixture as labSites } from "@/lib/cms-fixtures/programmes";
import { getLabSites } from "./research";
import { ResearchGlobe } from "./research-globe";

// jsdom has no WebGL: cobe fails to start, so the globe stays hidden while
// the slider semantics and keyboard turning still work. The touch tests
// swap in a stand-in globe that records what it is asked to draw.
const cobe = vi.hoisted(() => ({ createGlobe: vi.fn() }));
vi.mock("cobe", () => ({ default: cobe.createGlobe }));

beforeEach(() => {
  cobe.createGlobe.mockImplementation(() => {
    throw new Error("no WebGL");
  });
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

const { sites } = getLabSites([{ name: "Example Lab" }], labSites);

describe("ResearchGlobe", () => {
  test("is a named slider that says which places it shows", async () => {
    const { container } = render(<ResearchGlobe sites={sites} />);
    const globe = screen.getByRole("slider", {
      name: "Globe of our research sites",
    });
    expect(globe).toHaveAccessibleDescription(
      /Arcs run from Example Home to Example Remote \(Example Lab\)/,
    );
    expect(globe).toHaveAttribute("aria-valuetext", "Centred on 29° west");
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
    fireEvent.lostPointerCapture(canvas, { pointerId: 1 });
    expect(await reportsTurns()).toBe(true);
  });
});

describe("ResearchGlobe on a touch screen", () => {
  const globe = { update: vi.fn(), destroy: vi.fn() };
  let frames = new Map<number, FrameRequestCallback>();
  let nextFrame = 1;

  /** Runs every animation frame asked for so far. */
  function flushFrames() {
    const due = [...frames.values()];
    frames = new Map();
    for (const callback of due) callback(0);
  }

  /** What the last draw put on screen. */
  function lastView() {
    const calls = globe.update.mock.calls.filter(
      ([state]) => state.phi !== undefined,
    );
    return calls.at(-1)?.[0] as { phi: number; theta: number; scale: number };
  }

  beforeEach(() => {
    globe.update.mockClear();
    cobe.createGlobe.mockImplementation(() => globe);
    for (const [token, hex] of [
      ["--color-violet-800", "#2e1065"],
      ["--color-violet-300", "#c4b5fd"],
      ["--color-violet-950", "#1e0a3c"],
      ["--color-violet-400", "#a78bfa"],
    ]) {
      document.documentElement.style.setProperty(token, hex);
    }
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      const id = nextFrame++;
      frames.set(id, callback);
      return id;
    });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.removeAttribute("style");
  });

  /** Renders the globe and waits for the stand-in to be built. */
  async function renderTouchGlobe() {
    const { container } = render(<ResearchGlobe sites={sites} />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Zoom in" })).toBeEnabled(),
    );
    const canvas = container.querySelector("canvas");
    if (!canvas) throw new Error("no canvas");
    canvas.setPointerCapture = vi.fn();
    globe.update.mockClear();
    return canvas;
  }

  const touch = (pointerId: number, clientX: number, clientY: number) => ({
    pointerId,
    pointerType: "touch",
    button: 0,
    clientX,
    clientY,
  });

  test("draws once per frame however often the finger moves", async () => {
    const canvas = await renderTouchGlobe();
    fireEvent.pointerDown(canvas, touch(1, 100, 100));
    for (const x of [102, 104, 106, 108]) {
      fireEvent.pointerMove(canvas, touch(1, x, 100));
    }
    expect(globe.update).not.toHaveBeenCalled();
    flushFrames();
    expect(globe.update).toHaveBeenCalledTimes(1);
  });

  test("two fingers spread to zoom and move together to tilt", async () => {
    const canvas = await renderTouchGlobe();
    fireEvent.pointerDown(canvas, touch(1, 100, 100));
    fireEvent.pointerDown(canvas, touch(2, 200, 100));
    fireEvent.pointerMove(canvas, touch(2, 300, 100));
    flushFrames();
    const spread = lastView();
    expect(spread.scale).toBeCloseTo(2);

    fireEvent.pointerMove(canvas, touch(1, 100, 101));
    fireEvent.pointerMove(canvas, touch(2, 300, 101));
    flushFrames();
    expect(lastView().theta).not.toBeCloseTo(spread.theta);
    expect(lastView().scale).toBeCloseTo(2);
  });

  test("lifting one of two fingers drags on without a jump", async () => {
    const canvas = await renderTouchGlobe();
    fireEvent.pointerDown(canvas, touch(1, 100, 100));
    fireEvent.pointerDown(canvas, touch(2, 200, 100));
    fireEvent.pointerUp(canvas, touch(2, 200, 100));
    const before = lastView();
    // The remaining finger moves on from where it is, not from where the
    // pinch or its own drag began.
    fireEvent.pointerMove(canvas, touch(1, 101, 100));
    flushFrames();
    // jsdom lays nothing out: the globe is 1 px wide, so 1 px is π.
    expect(lastView().phi - before.phi).toBeCloseTo(Math.PI / before.scale);
  });

  test("a double tap zooms in, and from the closest view back out", async () => {
    const canvas = await renderTouchGlobe();
    const zoomIn = screen.getByRole("button", { name: "Zoom in" });
    const zoomOut = screen.getByRole("button", { name: "Zoom out" });
    const doubleTap = () => {
      for (let tap = 0; tap < 2; tap++) {
        fireEvent.pointerDown(canvas, touch(1, 100, 100));
        fireEvent.pointerUp(canvas, touch(1, 100, 100));
      }
    };
    doubleTap();
    expect(zoomOut).toBeEnabled();
    for (let step = 0; step < 3; step++) doubleTap();
    expect(zoomIn).toBeDisabled();
    doubleTap();
    expect(zoomOut).toBeDisabled();
  });

  test("a drag between two taps is no double tap", async () => {
    const canvas = await renderTouchGlobe();
    fireEvent.pointerDown(canvas, touch(1, 100, 100));
    fireEvent.pointerUp(canvas, touch(1, 100, 100));
    fireEvent.pointerDown(canvas, touch(1, 100, 100));
    fireEvent.pointerMove(canvas, touch(1, 140, 100));
    fireEvent.pointerUp(canvas, touch(1, 140, 100));
    fireEvent.pointerDown(canvas, touch(1, 140, 100));
    fireEvent.pointerUp(canvas, touch(1, 140, 100));
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeDisabled();
  });

  test("two fingers do not scroll the page; one finger does", async () => {
    const canvas = await renderTouchGlobe();
    expect(fireEvent.touchMove(canvas, { touches: [{}] })).toBe(true);
    expect(fireEvent.touchMove(canvas, { touches: [{}, {}] })).toBe(false);
  });

  test("waits to be built until it nears the viewport", async () => {
    let reveal: IntersectionObserverCallback = () => {};
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: IntersectionObserverCallback) {
          reveal = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    cobe.createGlobe.mockClear();
    render(<ResearchGlobe sites={sites} />);
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));
    expect(cobe.createGlobe).not.toHaveBeenCalled();

    act(() =>
      reveal(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      ),
    );
    await waitFor(() => expect(cobe.createGlobe).toHaveBeenCalled());
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
