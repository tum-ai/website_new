import { axe } from "@test/axe";
import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { journeySteps, memberJourney } from "./data/member-journey";
import { JourneySection } from "./journey-section";

/** Answers the reduced-motion query; every other query is false. */
function stubMatchMedia(reducedMotion: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion: reduce")
        ? reducedMotion
        : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

/** Reveal needs an IntersectionObserver; nothing here has to intersect. */
class FakeIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

/** Places every element at `top` (jsdom lays nothing out). */
function placeAt(top: (element: Element) => number) {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    function (this: Element) {
      const y = top(this);
      return {
        top: y,
        bottom: y + 48,
        left: 0,
        right: 48,
        width: 48,
        height: 48,
        x: 0,
        y,
        toJSON: () => ({}),
      };
    },
  );
}

const lastStage = memberJourney.length - 1;
const counter = (stage: number) => String(stage + 1).padStart(2, "0");

const stageLinks = () =>
  within(
    screen.getByRole("navigation", { name: "Member journey stages" }),
  ).getAllByRole("link");

const markers = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>("[data-marker]"));

const fills = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>("[data-fill]"));

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("JourneySection", () => {
  test("lists every journey step as a titled, linked stage", () => {
    stubMatchMedia(false);
    render(<JourneySection />);

    const titles = screen
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);
    expect(titles).toStrictEqual(journeySteps.map((step) => step.name));
    expect(stageLinks().map((link) => link.getAttribute("href"))).toEqual(
      journeySteps.map((step) => `#journey-${step.step.toLowerCase()}`),
    );
  });

  test("under reduced motion it draws one static final state", () => {
    stubMatchMedia(true);
    // Everything far below the reading line: scroll position must not matter.
    placeAt(() => 10_000);
    const { container } = render(<JourneySection />);

    expect(
      markers(container).every((marker) => marker.hasAttribute("data-lit")),
    ).toBe(true);
    for (const fill of fills(container)) {
      expect(fill.style.transform).toBe("scaleY(1)");
    }
    expect(stageLinks().map((link) => link.dataset.state)).toEqual(
      journeySteps.map((step) =>
        step.stageIndex === lastStage ? "current" : "done",
      ),
    );
    expect(container.querySelector("[data-journey-counter]")).toHaveTextContent(
      counter(lastStage),
    );

    // No scroll handler: scrolling to the top changes nothing.
    placeAt(() => 0);
    window.dispatchEvent(new Event("scroll"));
    expect(container.querySelector("[data-journey-counter]")).toHaveTextContent(
      counter(lastStage),
    );
  });

  test("with motion, the stage the reader has scrolled past is current", () => {
    stubMatchMedia(false);
    // Stages 0 and 1 sit above the reading line, the rest below it.
    placeAt((element) => {
      const stage = (element as HTMLElement).dataset?.stage;
      return stage !== undefined && Number(stage) <= 1 ? 0 : 10_000;
    });
    const { container } = render(<JourneySection />);

    expect(container.querySelector("[data-journey-counter]")).toHaveTextContent(
      counter(1),
    );
    expect(stageLinks().map((link) => link.dataset.state)).toEqual(
      journeySteps.map((step) =>
        step.stageIndex < 1
          ? "done"
          : step.stageIndex === 1
            ? "current"
            : "next",
      ),
    );
    const lit = markers(container)
      .filter((marker) => marker.dataset.stage !== undefined)
      .map((marker) => marker.hasAttribute("data-lit"));
    expect(lit).toEqual(
      markers(container)
        .filter((marker) => marker.dataset.stage !== undefined)
        .map((marker) => Number(marker.dataset.stage) <= 1),
    );
  });

  test("has no axe violations", async () => {
    stubMatchMedia(true);
    const { container } = render(<JourneySection />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
