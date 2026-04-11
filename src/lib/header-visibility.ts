const MOBILE_HEADER_TOP_OFFSET = 24;
const MOBILE_HEADER_SCROLL_DELTA = 8;

interface MobileHeaderVisibilityInput {
  scrollY: number;
  previousScrollY: number;
  isMenuOpen: boolean;
  isCurrentlyVisible: boolean;
}

export function getMobileHeaderVisibility({
  scrollY,
  previousScrollY,
  isMenuOpen,
  isCurrentlyVisible,
}: MobileHeaderVisibilityInput) {
  if (isMenuOpen || scrollY <= MOBILE_HEADER_TOP_OFFSET) {
    return true;
  }

  const scrollDelta = scrollY - previousScrollY;

  if (Math.abs(scrollDelta) < MOBILE_HEADER_SCROLL_DELTA) {
    return isCurrentlyVisible;
  }

  return scrollDelta < 0;
}
