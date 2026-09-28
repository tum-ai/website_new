/**
 * How the floating header reacts to the scroll position. Pure, so the
 * thresholds are testable without a browser; `header.tsx` feeds it the
 * window's measurements on every scroll and resize frame.
 *
 * The header never hides: its state depends only on where the page is, not
 * on the direction it last moved.
 */

/** Scroll distance in px after which the transparent pill turns frosted. */
export const headerFrostAfter = 8;

/**
 * How far the home hero scrolls, as a share of the viewport height, before
 * the header shows its logo. Phones reveal it sooner because their hero is
 * shorter than the screen.
 */
export const logoRevealShare = { narrow: 0.3, wide: 0.6 } as const;

/** The window measurements the header state depends on. */
export type HeaderScrollInput = {
  /** `window.scrollY`; negative values (rubber-band overscroll) count as 0. */
  scrollY: number;
  /** `window.innerHeight`. */
  viewportHeight: number;
  /** Below the `md` breakpoint. */
  narrow: boolean;
  /** The route hides the logo until the hero scrolls away (`HeaderOptions`). */
  hideLogoUntilScroll: boolean;
};

/** What the header shows for a scroll position. */
export type HeaderScrollState = {
  /** The page has left the top: frost the pill. */
  scrolled: boolean;
  /** Show the logo (always, unless the route hides it over the hero). */
  showLogo: boolean;
};

/** The header state for the current scroll position. */
export function getHeaderScrollState({
  scrollY,
  viewportHeight,
  narrow,
  hideLogoUntilScroll,
}: HeaderScrollInput): HeaderScrollState {
  const y = Math.max(scrollY, 0);
  const revealAt =
    viewportHeight * (narrow ? logoRevealShare.narrow : logoRevealShare.wide);
  return {
    scrolled: y > headerFrostAfter,
    showLogo: !hideLogoUntilScroll || y > revealAt,
  };
}
