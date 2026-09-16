# Partner page rebuild

Browser evidence captured on 2026-09-16 against a local production build of `/partners`.

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

The supplied brief is represented in typed static content. The page retains Sanity server loading, draft preview, and legacy partner fields. Optional `tier` and `featured` settings control logo hierarchy without exposing tier names. Explicit CMS values override the ten curated defaults; duplicate company aliases consolidate and other legacy entries become supporters.

Image provenance is recorded in [the asset manifest](../../public/assets/partners/SOURCES.md). Portraits and company artwork come from existing TUM.ai assets or official public sources. Case-study visuals are project artwork, event artwork, or official company branding, rather than unrelated event photographs.
