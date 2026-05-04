import assert from "node:assert/strict";
import test from "node:test";
import { getMobileHeaderVisibility } from "../src/lib/header-visibility";

test("mobile header stays visible near the top of the page", () => {
  assert.equal(
    getMobileHeaderVisibility({
      scrollY: 18,
      previousScrollY: 4,
      isMenuOpen: false,
      isCurrentlyVisible: true,
    }),
    true,
  );
});

test("mobile header hides after a meaningful downward scroll", () => {
  assert.equal(
    getMobileHeaderVisibility({
      scrollY: 120,
      previousScrollY: 80,
      isMenuOpen: false,
      isCurrentlyVisible: true,
    }),
    false,
  );
});

test("mobile header reappears when scrolling upward", () => {
  assert.equal(
    getMobileHeaderVisibility({
      scrollY: 84,
      previousScrollY: 132,
      isMenuOpen: false,
      isCurrentlyVisible: false,
    }),
    true,
  );
});

test("mobile header ignores tiny scroll jitter", () => {
  assert.equal(
    getMobileHeaderVisibility({
      scrollY: 126,
      previousScrollY: 122,
      isMenuOpen: false,
      isCurrentlyVisible: false,
    }),
    false,
  );
});

test("mobile header always stays visible while the menu is open", () => {
  assert.equal(
    getMobileHeaderVisibility({
      scrollY: 220,
      previousScrollY: 180,
      isMenuOpen: true,
      isCurrentlyVisible: false,
    }),
    true,
  );
});
