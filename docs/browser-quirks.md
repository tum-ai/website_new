# Browser quirks

Workarounds for browser behaviour, mostly Safari 26 on iPhone. Each entry says what Safari does,
what the code does about it, and where. The code comments at those places are tagged "Safari"
(`rg -n Safari src`); read them before changing the root background, the header, dialogs or the
motion utilities.

WebKit in Playwright (Linux or macOS) does not reproduce the tinted status bar and toolbar. Check
those items on a real iPhone with the checklist in
`.agents/skills/ui-verify/references/iphone-safari.md`.

The shared workarounds below are now owned by the pinned kit; its
[versioned browser notes](https://github.com/tum-ai/ui-kit/tree/v0.2.0/docs/browser-quirks.md)
track primitive and shell implementations. This page records the website integration
and historical reasons. Change shared behaviour upstream, then consume a release.

## Status bar and toolbar tint

**What Safari does.** Safari 26 tints its status bar (top) and bottom toolbar from the page
itself: from the root canvas at the page's ends, and from fixed elements touching the top edge.
It ignores `theme-color`.

**What the code does.**

- The root canvas is brand black (`--color-black`, #0D0214): `html { background-color }` in
  the kit `shell.css` imported by `src/styles/index.css`. Every page starts with a dark hero and ends with the night footer, so
  both ends of the page meet the browser chrome in the same colour. Page content sits on its own
  bands and `#main-content` is white, so the black never shows through.
- `TopBlend` (the kit public export) fades a dark band's decorative layers (aurora,
  logomark) into that flat canvas: at the top of heroes, and at the bottom of the footer
  (`src/components/shell/footer.tsx`), so there is no seam against the status bar or toolbar.
- The layout still declares `themeColor: "#0d0214"` (`src/app/(site)/layout.tsx`) for browsers
  that read it, such as Chrome on Android.
- The header's fixed container starts 12 px below the top edge
  (the kit `Header`, configured by `src/components/shell/header.tsx`), so Safari doesn't tint the status bar from the header; once
  the page scrolls, the page itself shows through behind the status bar.

History: #262 (`8b9be3c`, `9a13d68`, `ea80095`).

## Full-screen overlays

**What Safari does.** Safari tints both bars from whatever covers them, and its toolbar
collapses and expands, so the visible viewport changes height while the large viewport doesn't.

**What the code does.**

- Dialog backdrops span the large viewport (`h-lvh`), so they also dim the areas behind the status
  bar and toolbar (the kit `DialogContent`).
- Modal dialogs are laid out in the dynamic viewport (`h-dvh`), so they always sit in the visible
  area and never under the toolbar.
- The mobile menu is the ds `DialogContent variant="fullscreen"`: a flat ink panel over the whole
  large viewport, so both bars tint to the same colour and no page shows below it. Its content
  uses `min-h-lvh` with a bottom padding of `100lvh - 100dvh`, so the last row can still scroll
  above the toolbar on small phones and in landscape (`src/components/shell/header.tsx`).

History: #262 (`401bd5f`, `9a13d68`, `9bab38f`).

## Focus escaping modals

**What Safari does.** Safari's Tab key skips links by default ("Press Tab to highlight each item"
is off). Focus then slipped past Base UI's focus guards to the page behind an open dialog or menu,
and focusing those elements scrolled the page.

**What the code does.** The kit `<Dialog>` makes `#app-root` inert while a modal is
open and releases it as soon as closing starts, so focus can return to the trigger. The app
keeps that root ID; use the public `backgroundRootId` prop for another integration root.
Portals render outside `#app-root` (`src/app/(site)/layout.tsx`).

Tests: WebKit on macOS follows the same default, so `e2e/keyboard.spec.ts` presses Option+Tab
there; WebKit on Linux (CI) uses plain Tab.

History: #262 (`9e0799c`).

## Clipped text and filters

**What Safari does.** An element with a CSS `filter` (even `blur(0)`) is clipped to its box. At
tight display line heights, descenders (g, p, y) hang below each word's box and were cut off, and
blurring large areas repaints every frame and stutters on phones.

**What the code does.**

- Entrance keyframes (`rise`, `rise-sm`, `fade`) and scroll reveals animate only `transform` and
  `opacity`; no blur (the kit `tailwind.css`).
- `SplitWords` pads each word's box and pulls it back with negative margins, so descenders and
  overhangs fit inside the animating inline block (the kit `SplitWords` export).
- The design rule follows from this: never animate `filter` on text, and release any filter when
  its animation ends ([design-system.md](design-system.md), "Motion rules").

History: #262 (`7ac50f4`, `9bab38f`, `5138545`).

## Touch

- A brand-tinted tap highlight replaces the default grey flash, and `touch-action: manipulation`
  on links and buttons removes double-tap zoom on repeated taps (the kit `shell.css`).

History: #262 (`9bab38f`).

## Adding a workaround

1. Put a comment at the workaround that starts with the browser name ("Safari ...") and says what
   the browser does.
2. Add an entry here: what the browser does, what the code does, where, and the PR or commit.
3. If it affects page chrome, add a line to the iPhone checklist.
