import { axe } from "@test/axe";
import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { PartnerRotationGrid } from "@/features/partners";
import type { PartnerTier } from "@/lib/people-and-logos";
import type { Partner } from "@/lib/types";
import { PartnerWall, partnerWallCapacity } from "./partner-wall";

const partner = (name: string, tier: PartnerTier): Partner => ({
  id: name.toLowerCase(),
  name,
  tier,
  link: `https://${name.toLowerCase()}.example/`,
  image: `/assets/partners/logos/${name.toLowerCase()}.webp`,
});

/** A directory: the highlighted partners first, then the supporters. */
const highlighted = Array.from({ length: partnerWallCapacity }, (_, index) =>
  partner(`Tiered${index}`, index < 8 ? "gold" : "silver"),
);
const supporters = Array.from({ length: 12 }, (_, index) =>
  partner(`Supporter${index}`, "supporter"),
);
const directory = [...highlighted, ...supporters];

let reducedMotion = false;

beforeEach(() => {
  reducedMotion = false;
  vi.useFakeTimers();
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: reducedMotion && query.includes("prefers-reduced-motion"),
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
      set src(_: string) {
        queueMicrotask(() => this.onload?.());
      }
    },
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/** The names on the wall's tiles, in slot order (the incoming copy of each). */
function wallNames() {
  const wall = screen.getByRole("list", { name: "TUM.ai partners" });
  return within(wall)
    .getAllByRole("listitem")
    .map((slot) => within(slot).getByRole("img").getAttribute("alt"));
}

describe("the homepage partner wall", () => {
  test("starts with the highlighted partners in directory order, unlinked", async () => {
    vi.useRealTimers();
    const { container } = render(<PartnerWall partners={directory} />);
    expect(wallNames()).toStrictEqual(highlighted.map(({ name }) => name));
    expect(screen.queryAllByRole("link")).toStrictEqual([]);
    expect(await axe(container)).toHaveNoViolations();
  });

  test("rotates the supporters in, three at a time", async () => {
    render(<PartnerWall partners={directory} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500);
    });
    const names = wallNames();
    expect(names).toHaveLength(partnerWallCapacity);
    expect(names.filter((name) => name?.startsWith("Supporter"))).toHaveLength(
      3,
    );
  });

  test("holds exactly the starting wall under reduced motion", async () => {
    reducedMotion = true;
    render(<PartnerWall partners={directory} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(wallNames()).toStrictEqual(highlighted.map(({ name }) => name));
    // A still wall is not masked as a rotating one in visual tests.
    expect(
      screen.getByRole("list", { name: "TUM.ai partners" }),
    ).not.toHaveAttribute("data-rotating");
  });
});

test("the /partners walls still show every partner under reduced motion", async () => {
  reducedMotion = true;
  const { container } = render(
    <PartnerRotationGrid
      partners={directory}
      capacity={6}
      className="partner-supporter-grid"
    />,
  );
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
  const wall = container.firstElementChild;
  expect(wall?.tagName).toBe("DIV");
  expect(wall).toHaveAttribute("data-rotating", "false");
  expect(within(wall as HTMLElement).getAllByRole("img")).toHaveLength(
    directory.length,
  );
});
