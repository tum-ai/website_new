import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { PASTE_STAGGER_MS, PosterGrid } from "./poster-grid";

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;
let notify: Callback = () => {};

/** Motion preference and an observer the test drives by hand. */
function stubBrowser({ reduceMotion }: { reduceMotion: boolean }) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({ matches: reduceMotion, media: query })),
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: Callback) {
        notify = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
}

/** Puts the grid below the fold, as on a first visit to /events. */
function belowTheFold() {
  vi.spyOn(HTMLUListElement.prototype, "getBoundingClientRect").mockReturnValue(
    { top: window.innerHeight * 2 } as DOMRect,
  );
}

/** Lays a tile out in a 100px grid cell. */
function place(tile: HTMLElement, column: number, row: number) {
  Object.defineProperties(tile, {
    offsetLeft: { value: column * 101 },
    offsetTop: { value: row * 101 },
    offsetWidth: { value: 100 },
  });
}

function renderGrid() {
  const { container } = render(
    <PosterGrid>
      {["a", "b", "c", "d"].map((id) => (
        <li key={id}>{id}</li>
      ))}
    </PosterGrid>,
  );
  const grid = container.querySelector("ul") as HTMLUListElement;
  const tiles = [...grid.querySelectorAll("li")];
  return { grid, tiles };
}

beforeEach(() => {
  notify = () => {};
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test("leaves the wall as rendered under reduced motion", () => {
  stubBrowser({ reduceMotion: true });
  belowTheFold();
  const { grid } = renderGrid();
  expect(grid).toHaveAttribute("data-paste", "idle");
});

test("leaves a wall already on screen as rendered", () => {
  stubBrowser({ reduceMotion: false });
  const { grid } = renderGrid();
  expect(grid).toHaveAttribute("data-paste", "idle");
});

test("pastes entering tiles up as a diagonal wave", () => {
  stubBrowser({ reduceMotion: false });
  belowTheFold();
  const { grid, tiles } = renderGrid();
  expect(grid).toHaveAttribute("data-paste", "pending");

  // Two by two, reported out of order.
  for (const [index, tile] of tiles.entries()) {
    place(tile, index % 2, Math.floor(index / 2));
  }
  act(() =>
    notify(
      tiles.toReversed().map((target) => ({ target, isIntersecting: true })),
    ),
  );

  const delays = tiles.map((tile) =>
    tile.style.getPropertyValue("--paste-delay"),
  );
  const step = PASTE_STAGGER_MS;
  expect(delays).toEqual(["0ms", `${step}ms`, `${step}ms`, `${2 * step}ms`]);
  for (const tile of tiles) expect(tile).toHaveAttribute("data-pasted");
});

test("shows tiles a jump skipped past above the viewport at once", () => {
  stubBrowser({ reduceMotion: false });
  belowTheFold();
  const { grid, tiles } = renderGrid();
  const [skipped, ahead] = tiles as unknown as [HTMLElement, HTMLElement];

  // Jumped from above the wall to its last rows: no observer report.
  vi.spyOn(grid, "getBoundingClientRect").mockReturnValue({
    top: -500,
  } as DOMRect);
  vi.spyOn(skipped, "getBoundingClientRect").mockReturnValue({
    bottom: -10,
  } as DOMRect);
  vi.spyOn(ahead, "getBoundingClientRect").mockReturnValue({
    bottom: 200,
  } as DOMRect);
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });

  expect(skipped).toHaveAttribute("data-pasted");
  expect(skipped.style.getPropertyValue("--paste-delay")).toBe("0ms");
  expect(ahead).not.toHaveAttribute("data-pasted");
});
