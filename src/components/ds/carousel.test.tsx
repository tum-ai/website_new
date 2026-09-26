import { axe } from "@test/axe";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { Carousel } from "./carousel";

/*
 * Embla measures slides, which jsdom cannot lay out, so the tests drive a
 * fake API: three snap positions, scrolled one step per call.
 */
const embla = vi.hoisted(() => {
  const handlers = new Map<string, Set<() => void>>();
  const state = { index: 0, last: 2 };
  const emit = (event: string) => {
    for (const handler of handlers.get(event) ?? []) handler();
  };
  const api = {
    canScrollPrev: () => state.index > 0,
    canScrollNext: () => state.index < state.last,
    scrollProgress: () => state.index / state.last,
    scrollPrev: vi.fn(() => {
      state.index = Math.max(0, state.index - 1);
      emit("select");
    }),
    scrollNext: vi.fn(() => {
      state.index = Math.min(state.last, state.index + 1);
      emit("select");
    }),
    on(event: string, handler: () => void) {
      if (!handlers.has(event)) handlers.set(event, new Set());
      handlers.get(event)?.add(handler);
      return api;
    },
    off(event: string, handler: () => void) {
      handlers.get(event)?.delete(handler);
      return api;
    },
  };
  return { api, state, handlers };
});

vi.mock("embla-carousel-react", () => ({
  default: () => [() => {}, embla.api],
}));

beforeEach(() => {
  embla.state.index = 0;
  embla.handlers.clear();
  embla.api.scrollNext.mockClear();
  embla.api.scrollPrev.mockClear();
});

function Example() {
  return (
    <Carousel label="Highlights">
      <p key="events">Events</p>
      <p key="research">Research</p>
      <p key="projects">Projects</p>
    </Carousel>
  );
}

describe("Carousel", () => {
  test("is a labelled carousel region of numbered slides", () => {
    render(<Example />);
    const region = screen.getByRole("region", { name: "Highlights" });
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
    const slides = screen.getAllByRole("listitem");
    expect(slides).toHaveLength(3);
    expect(slides[1]).toHaveAttribute("aria-roledescription", "slide");
    expect(slides[1]).toHaveAccessibleName("2 of 3");
  });

  test("scrolls with the arrow keys anywhere in the region", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(embla.api.scrollNext).toHaveBeenCalledTimes(1);
    await user.keyboard("{ArrowLeft}");
    expect(embla.api.scrollPrev).toHaveBeenCalledTimes(1);
  });

  test("disabled arrows stay focusable and announce their state", () => {
    render(<Example />);
    const previous = screen.getByRole("button", { name: "Previous slide" });
    expect(previous).toHaveAttribute("aria-disabled", "true");
    expect(previous).not.toHaveAttribute("disabled");
  });

  test("keeps focus on a working arrow when one runs out of slides", async () => {
    const user = userEvent.setup();
    render(<Example />);
    const next = screen.getByRole("button", { name: "Next slide" });
    const previous = screen.getByRole("button", { name: "Previous slide" });

    await user.click(next);
    await user.click(next);
    expect(next).toHaveAttribute("aria-disabled", "true");
    expect(previous).toHaveFocus();

    await user.click(previous);
    await user.click(previous);
    expect(next).toHaveFocus();
  });

  test("hides the controls when every slide fits", () => {
    embla.state.last = 0;
    render(<Example />);
    expect(screen.queryByRole("button", { name: "Next slide" })).toBeNull();
    embla.state.last = 2;
  });

  test("applies class slots to the inner parts", () => {
    render(
      <Carousel
        label="Photos"
        classNames={{ track: "track-slot", slide: "basis-full" }}
      >
        <p key="a">A</p>
      </Carousel>,
    );
    const slide = screen.getByRole("listitem");
    expect(slide).toHaveClass("basis-full");
    expect(slide).not.toHaveClass("basis-[85%]");
    expect(slide.parentElement).toHaveClass("track-slot");
  });

  test("has no axe violations", async () => {
    const { container } = render(<Example />);
    await act(async () => {});
    expect(await axe(container)).toHaveNoViolations();
  });
});
