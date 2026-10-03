import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useMediaQuery } from "./use-media-query";

/** A controllable `matchMedia` for one query. */
function stubMatchMedia(initial: boolean) {
  let matches = initial;
  const listeners = new Set<() => void>();
  vi.stubGlobal(
    "matchMedia",
    vi.fn((media: string) => ({
      get matches() {
        return matches;
      },
      media,
      addEventListener: (_: string, listener: () => void) =>
        listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) =>
        listeners.delete(listener),
    })),
  );
  return {
    set(next: boolean) {
      matches = next;
      for (const listener of listeners) listener();
    },
    listeners,
  };
}

const query = "(prefers-reduced-motion: reduce)";

describe("useMediaQuery", () => {
  let media: ReturnType<typeof stubMatchMedia>;
  beforeEach(() => {
    media = stubMatchMedia(false);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("follows the query as it changes", () => {
    const { result } = renderHook(() => useMediaQuery(query));
    expect(result.current).toBe(false);
    act(() => media.set(true));
    expect(result.current).toBe(true);
    act(() => media.set(false));
    expect(result.current).toBe(false);
  });

  test("stops listening on unmount", () => {
    const { unmount } = renderHook(() => useMediaQuery(query));
    expect(media.listeners.size).toBe(1);
    unmount();
    expect(media.listeners.size).toBe(0);
  });
});
