import { act, fireEvent, render, waitFor } from "@testing-library/react";
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
  test("server HTML carries only the first photo, eager and preloaded", () => {
    const html = renderToString(<HeroAperture photos={heroPhotos} />);
    const images = html.match(/<img[^>]*>/g) ?? [];
    const preloads = html.match(/<link rel="preload"[^>]*>/g) ?? [];
    expect(images).toHaveLength(1);
    expect(images[0]).toContain('loading="eager"');
    expect(preloads).toHaveLength(1);
    expect(preloads[0]).toContain(encodeURIComponent(heroPhotos[0]?.src ?? ""));
  });

  test("holds the entrance until the first photo has loaded", async () => {
    const { container } = render(<HeroAperture photos={heroPhotos} />);
    const root = container.firstElementChild;
    expect(root).toHaveAttribute("data-ready", "false");
    // next/image reports the load after the image decodes (a promise).
    fireEvent.load(container.querySelector("img") as HTMLImageElement);
    await waitFor(() => expect(root).toHaveAttribute("data-ready", "true"), {
      timeout: 1000,
    });
  });

  test("runs the entrance anyway when the first photo is slow", () => {
    vi.useFakeTimers();
    const { container } = render(<HeroAperture photos={heroPhotos} />);
    act(() => vi.advanceTimersByTime(2500));
    expect(container.firstElementChild).toHaveAttribute("data-ready", "true");
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
