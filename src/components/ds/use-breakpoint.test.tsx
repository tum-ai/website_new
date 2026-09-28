import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { type Breakpoint, useBreakpoint } from "./use-breakpoint";

/** A window `width` wide whose media queries follow `resize`. */
function stubViewport(initialWidth: number) {
  let width = initialWidth;
  const listeners = new Set<() => void>();
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => {
      const rem = Number(/width >= ([\d.]+)rem/.exec(query)?.[1]);
      return {
        get matches() {
          return width >= rem * 16;
        },
        media: query,
        addEventListener: (_: string, listener: () => void) =>
          listeners.add(listener),
        removeEventListener: (_: string, listener: () => void) =>
          listeners.delete(listener),
      };
    }),
  );
  return {
    resize(next: number) {
      width = next;
      for (const listener of listeners) listener();
    },
  };
}

function Probe({ at }: { at: Breakpoint }) {
  return <p>{useBreakpoint(at) ? "wide" : "narrow"}</p>;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useBreakpoint", () => {
  test("matches from Tailwind's breakpoint up and follows resizes", () => {
    const viewport = stubViewport(767);
    render(<Probe at="md" />);
    expect(screen.getByText("narrow")).toBeInTheDocument();

    act(() => viewport.resize(768));
    expect(screen.getByText("wide")).toBeInTheDocument();
  });

  test("reads each breakpoint's own width", () => {
    stubViewport(1024);
    render(
      <>
        <Probe at="lg" />
        <Probe at="xl" />
      </>,
    );
    expect(
      screen.getAllByRole("paragraph").map((node) => node.textContent),
    ).toEqual(["wide", "narrow"]);
  });
});
