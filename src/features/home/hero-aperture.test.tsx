import { act, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const heroPhotos = [
  { src: "/assets/fixtures/photo.svg", width: 960, height: 640, alt: "" },
  { src: "/assets/fixtures/logo.svg", width: 200, height: 80, alt: "" },
];

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
  test("server HTML carries only the first photo, eager and preloaded at high priority", () => {
    const html = renderToString(<HeroAperture photos={heroPhotos} />);
    const images = html.match(/<img[^>]*>/g) ?? [];
    const preloads = html.match(/<link rel="preload"[^>]*>/g) ?? [];
    expect(images).toHaveLength(1);
    expect(images[0]).not.toContain('loading="lazy"');
    expect(images[0]).toContain('fetchPriority="high"');
    expect(preloads).toHaveLength(1);
    expect(preloads[0]).toContain(heroPhotos[0]?.src ?? "");
    expect(preloads[0]).toContain('fetchPriority="high"');
  });

  test("never gates the entrance on hydration", () => {
    const html = renderToString(<HeroAperture photos={heroPhotos} />);
    expect(html).not.toContain("data-ready");
  });

  test("mounts only the next photo after the page load, hidden from assistive technology", () => {
    const photos = [
      ...heroPhotos,
      {
        src: "/assets/fixtures/photo.svg?third",
        width: 960,
        height: 640,
        alt: "",
      },
    ];
    const { container } = render(<HeroAperture photos={photos} />);
    expect(container.querySelectorAll("img")).toHaveLength(2);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  test("waits for the load event before mounting the next photo", () => {
    const readyState = vi
      .spyOn(document, "readyState", "get")
      .mockReturnValue("loading");
    const { container } = render(<HeroAperture photos={heroPhotos} />);
    expect(container.querySelectorAll("img")).toHaveLength(1);
    readyState.mockReturnValue("complete");
    act(() => {
      window.dispatchEvent(new Event("load"));
    });
    expect(container.querySelectorAll("img")).toHaveLength(2);
  });

  test("mounts each later photo one turn ahead of the crossfade", () => {
    vi.useFakeTimers();
    const photos = [
      ...heroPhotos,
      {
        src: "/assets/fixtures/photo.svg?third",
        width: 960,
        height: 640,
        alt: "",
      },
    ];
    const { container } = render(<HeroAperture photos={photos} />);
    expect(container.querySelectorAll("img")).toHaveLength(2);
    act(() => vi.advanceTimersByTime(6000));
    expect(container.querySelectorAll("img")).toHaveLength(3);
  });

  test("crossfades to the next photo after the hold", () => {
    vi.useFakeTimers();
    const { container } = render(<HeroAperture photos={heroPhotos} />);
    const first = activeSrc(container);
    act(() => vi.advanceTimersByTime(6000));
    expect(activeSrc(container)).not.toBe(first);
  });

  test("shows a photo when a refresh shortens the list under the current one", () => {
    vi.useFakeTimers();
    const { container, rerender } = render(
      <HeroAperture photos={heroPhotos} />,
    );
    const first = activeSrc(container);
    act(() => vi.advanceTimersByTime(6000));
    expect(activeSrc(container)).not.toBe(first);

    rerender(<HeroAperture photos={heroPhotos.slice(0, 1)} />);
    expect(container.querySelectorAll('img[data-active="true"]')).toHaveLength(
      1,
    );
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
