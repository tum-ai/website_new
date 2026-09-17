# Partner page rebuild

Original browser evidence captured on 2026-09-16 against a local production build of `/partners`. Hero, full-page, partner-wall, and viewport screenshots refreshed on 2026-09-17.

## Verification

- `pnpm verify` on Node 24: lint, all 37 tests, and production build passed.
- Subsequent logo-hover and native contact-anchor refinements: scoped lint and production build passed.
- `git diff --check` passed.
- Visually inspected at 1440, 1024, 768, 390, and 320 pixels. No horizontal overflow at any requested width.
- All eight finder paths returned the expected recommendation. Back, changed intent, restart, progress, and keyboard heading focus checked.
- Header remains visible while scrolling. Desktop and mobile contact links land below the header; repeated anchor navigation and mobile menu dismissal checked.
- Verified all three portraits, all 11 alumni destination logos, and all ten featured partner logos load. No broken images or logo fallback labels in the inspected page.
- Verified white-backed CMS logos blend into the lavender hover background, including TUM Venture Labs.
- Cal.eu is absent before interaction. The dialog loads the official embed after interaction; direct booking and email fallbacks remain available.
- Opened the real Cal.eu calendar and selected a time to inspect the form. Its Additional notes field contained the chosen hackathon intent, ongoing relationship, and Long-Term Partnership recommendation. No personal data entered, appointment submitted, or email sent.
- Dialog focus remains inside it with Tab/Shift+Tab; Escape returns focus to the booking trigger. Reduced-motion emulation disables transitions and keeps finder navigation usable.
- No application or framework errors observed. Sanity Live reports the existing local-origin CORS warning for `127.0.0.1:3107`; server-side partner loading succeeds. External calendar loading can be slow; the visible fallback was also exercised.

## Screenshots

| Evidence | Capture |
| --- | --- |
| Desktop hero | [1440 px](desktop-1440.png) |
| Complete desktop page | [Full page](desktop-full-page.png) |
| Portraits and destination logos | [Profiles](portraits.png) |
| Featured logo hierarchy | [Partner wall](partner-wall.png) |
| White-backed logo hover | [TUM Venture Labs](logo-hover.png) |
| Finder recommendation | [Desktop result](finder-result.png) |
| Small-screen finder | [320 px](finder-320.png) |
| Case studies | [Outcomes](case-studies.png) |
| Tablet and mobile | [1024 px](viewport-1024.png), [768 px](viewport-768.png), [390 px](viewport-390.png), [320 px](viewport-320.png) |

## Content and integration

The supplied brief is represented in typed static content. The page retains Sanity server loading, draft preview, and legacy partner fields. Optional `tier` and `featured` settings control logo hierarchy. Gold, Silver, and Bronze tiers use subtle matching card outlines and accessible tier names. Explicit CMS values override the ten curated defaults; duplicate company aliases consolidate and other legacy entries become supporters.

Image provenance is recorded in [the asset manifest](../../public/assets/partners/SOURCES.md). Portraits and company artwork come from existing TUM.ai assets or official public sources. Case-study visuals are project artwork, event artwork, or official company branding, rather than unrelated event photographs.

## PO feedback update (2026-09-17)

- Gold, Silver, and Bronze cards have restrained tinted outlines. Tier names remain in accessible link labels; there are no per-card badges. Supporters remain unaccented.
- The hero keeps two actions: Get in touch and Find your fit. Booking remains available in the page and finder results.
- A transparent marquee replaces the white three-logo panel. Every highlighted partner appears once in the DOM, moves at an equal rate, and wraps outside the clipped viewport. There is no play/pause button. Hover and focus within the strip pause motion; reduced-motion preferences show a static wrapping list.
- The marquee follows the merged CMS directory, including tier overrides, new highlighted partners, and alias deduplication. Approved dark-background artwork is listed in the asset manifest; names are used where suitable artwork is unavailable.
- All partnership mailto links CC Silas and Kim while retaining the recipient, subject, and finder context.

Validation: `pnpm verify` passed lint, all 39 tests, and production build. Following the outline and single-instance marquee revision, lint, all nine partnership tests, and production build passed again. Local checks ran on Node 26; hosted CI uses its configured runtime. Browser evidence below is refreshed for this update.


Browser verification of the final revision:

- Chromium at 1440, 1024, 768, 390, and 320 pixels: meaningful page content, no framework overlay, no horizontal overflow, two hero actions, ten unique marquee items, no playback button or badges.
- All page images loaded. Gold/silver/bronze outlines and accessible link names match the configured tiers. Desktop and mobile screenshots visually inspected.
- Marquee moves continuously (16.64 pixels in a 400 ms sample), pauses on hover and link focus, and resumes on leaving. Reduced motion disables animation and shows all ten items in a static wrapping list. [Reduced-motion evidence](marquee-reduced-motion.png).
- Find your fit and Meet our partners anchors work. Hackathon + ongoing produces Long-Term Partnership, preserving both CC addresses and finder details in the result email and booking-dialog email fallback. Booking notes retain the same selection. Escape closes the dialog and restores focus. No email sent or appointment submitted.
- No application exceptions observed. Existing local Sanity Live CORS errors and speculative image/style preload warnings remain; CMS server data loads and all images render.
- Browser plugin was not available; checks used the available Playwright tools.
