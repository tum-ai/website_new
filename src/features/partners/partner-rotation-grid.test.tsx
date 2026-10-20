import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { Partner } from "@/lib/types";
import { PartnerRotationGrid } from "./partner-rotation-grid";

const partners: Partner[] = ["alpha", "beta", "gamma", "delta"].map((name) => ({
  id: name,
  name,
  image: `/assets/partners/logos/${name}.webp`,
  link: `https://${name}.example/`,
}));

/** Every URL the grid preloads through `new Image()`. */
const preloaded: string[] = [];

beforeEach(() => {
  preloaded.length = 0;
  vi.useFakeTimers();
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(private callback: IntersectionObserverCallback) {}
      observe(target: Element) {
        this.callback(
          [{ target, isIntersecting: true } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
      }
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "Image",
    class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      decode = () => Promise.resolve();
      set src(value: string) {
        preloaded.push(value);
        queueMicrotask(() => this.onload?.());
      }
    },
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test("rotating tiles render the exact logo URL the grid preloaded", async () => {
  render(<PartnerRotationGrid partners={partners} className="grid" />);
  const [hidden] = partners.slice(3);
  expect(screen.queryByRole("img", { name: hidden.name })).toBeNull();

  await act(async () => {
    await vi.advanceTimersByTimeAsync(2500);
  });

  expect(preloaded).toStrictEqual([hidden.image]);
  const incoming = screen.getByRole("img", { name: hidden.name });
  // Both resolve against the page, as the browser's image cache does.
  const resolve = (url: string | null) =>
    new URL(url ?? "", location.href).href;
  expect(resolve(incoming.getAttribute("src"))).toBe(resolve(preloaded[0]));
});
