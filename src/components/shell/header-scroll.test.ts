import { describe, expect, test } from "vitest";
import {
  getHeaderScrollState,
  type HeaderScrollInput,
  headerFrostAfter,
  logoRevealShare,
} from "./header-scroll";

const viewportHeight = 900;
const at = (
  scrollY: number,
  overrides: Partial<HeaderScrollInput> = {},
): HeaderScrollInput => ({
  scrollY,
  viewportHeight,
  narrow: false,
  hideLogoUntilScroll: false,
  ...overrides,
});

describe("frosted pill", () => {
  test("stays transparent at the top of the page", () => {
    expect(getHeaderScrollState(at(0)).scrolled).toBe(false);
    expect(getHeaderScrollState(at(headerFrostAfter)).scrolled).toBe(false);
  });

  test("frosts once the page scrolls past the threshold", () => {
    expect(getHeaderScrollState(at(headerFrostAfter + 1)).scrolled).toBe(true);
  });

  test("treats rubber-band overscroll above the top as the top", () => {
    expect(getHeaderScrollState(at(-120))).toStrictEqual(
      getHeaderScrollState(at(0)),
    );
  });
});

describe("logo", () => {
  test("always shows on routes that don't hide it", () => {
    for (const scrollY of [0, 1, 10_000]) {
      expect(getHeaderScrollState(at(scrollY)).showLogo).toBe(true);
    }
  });

  test.each([
    { narrow: false, share: logoRevealShare.wide },
    { narrow: true, share: logoRevealShare.narrow },
  ])(
    "appears after $share of the viewport (narrow: $narrow)",
    ({ narrow, share }) => {
      const revealAt = viewportHeight * share;
      const hidden = { hideLogoUntilScroll: true, narrow };
      expect(getHeaderScrollState(at(0, hidden)).showLogo).toBe(false);
      expect(getHeaderScrollState(at(revealAt, hidden)).showLogo).toBe(false);
      expect(getHeaderScrollState(at(revealAt + 1, hidden)).showLogo).toBe(
        true,
      );
    },
  );

  test("phones reveal it sooner than wide screens", () => {
    expect(logoRevealShare.narrow).toBeLessThan(logoRevealShare.wide);
    const between = viewportHeight * logoRevealShare.narrow + 1;
    const hidden = { hideLogoUntilScroll: true };
    expect(
      getHeaderScrollState(at(between, { ...hidden, narrow: true })).showLogo,
    ).toBe(true);
    expect(
      getHeaderScrollState(at(between, { ...hidden, narrow: false })).showLogo,
    ).toBe(false);
  });
});

test("depends on the position, not the scroll direction", () => {
  // The header never hides: scrolling back up to a position gives the same
  // state as scrolling down to it.
  const hidden = { hideLogoUntilScroll: true };
  const path = [0, 400, 900, 400, 0].map((y) =>
    getHeaderScrollState(at(y, hidden)),
  );
  expect(path[1]).toStrictEqual(path[3]);
  expect(path[0]).toStrictEqual(path[4]);
  expect(path[2]).toStrictEqual({ scrolled: true, showLogo: true });
  expect(path[4]).toStrictEqual({ scrolled: false, showLogo: false });
});
