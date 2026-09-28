import { act, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { heroPhotos } from "./data/homepage";
import { HeroAperture, nextPhotoIndex } from "./hero-aperture";

/** jsdom has neither API; the observer never reports, so the hero counts as on screen. */
function stubBrowser({ reducedMotion = false } = {}) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("reduce") ? reducedMotion : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
}

beforeEach(() => {
  stubBrowser();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("nextPhotoIndex", () => {
  test("advances and wraps around while cycling is allowed", () => {
    expect(nextPhotoIndex(0, 3, true)).toBe(1);
    expect(nextPhotoIndex(2, 3, true)).toBe(0);
  });

  test("holds the current photo when it may not cycle or has nothing to cycle", () => {
    expect(nextPhotoIndex(1, 3, false)).toBe(1);
    expect(nextPhotoIndex(0, 1, true)).toBe(0);
  });
});

function activeSrc(container: HTMLElement) {
  return container
    .querySelector('img[data-active="true"]')
    ?.getAttribute("src");
}

describe("HeroAperture", () => {
  test("server HTML carries no photo, so nothing competes with the logo preload", () => {
    const html = renderToString(<HeroAperture photos={heroPhotos} />);
    expect(html).not.toContain("<img");
  });

  test("mounts the photos after hydration, hidden from assistive technology", () => {
    const { container } = render(<HeroAperture photos={heroPhotos} />);
    expect(container.querySelectorAll("img")).toHaveLength(heroPhotos.length);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  test("crossfades to the next photo after the hold", () => {
    vi.useFakeTimers();
    const { container } = render(<HeroAperture photos={heroPhotos} />);
    const first = activeSrc(container);
    act(() => vi.advanceTimersByTime(6000));
    expect(activeSrc(container)).not.toBe(first);
  });

  test("holds the first photo under reduced motion", () => {
    vi.useFakeTimers();
    stubBrowser({ reducedMotion: true });
    const { container } = render(<HeroAperture photos={heroPhotos} />);
    const first = activeSrc(container);
    act(() => vi.advanceTimersByTime(20_000));
    expect(activeSrc(container)).toBe(first);
  });
});
