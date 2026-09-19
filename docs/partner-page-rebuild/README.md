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

The supplied brief is represented in typed static content. The page retains Sanity server loading, draft preview, and legacy partner fields. Optional `tier` and `featured` settings control logo hierarchy. Gold, Silver, and Bronze tiers use one understated heading per group, clean cards, and accessible tier names. Explicit CMS values override the ten curated defaults; duplicate company aliases consolidate and other legacy entries become supporters.

Image provenance is recorded in [the asset manifest](../../public/assets/partners/SOURCES.md). Portraits and company artwork come from existing TUM.ai assets or official public sources. Case-study visuals are project artwork, event artwork, or official company branding, rather than unrelated event photographs.

## PO feedback update (2026-09-17)

- Gold, Silver, and Bronze each have one muted lavender heading above their group. Cards retain their size hierarchy without colored outlines or per-card badges. Tier names also remain in accessible link labels.
- The hero keeps two actions: Get in touch and Find your fit. Booking remains available in the page and finder results.
- A transparent marquee replaces the white three-logo panel. Every highlighted partner appears once in the DOM, moves at an equal rate, and wraps outside the clipped viewport. There is no play/pause button. Hover and focus within the strip pause motion; reduced-motion preferences show a static wrapping list.
- The marquee follows the merged CMS directory, including tier overrides, new highlighted partners, and alias deduplication. All ten curated partners have local, transparent marquee artwork, including OpenAI, Anthropic, Spherecast, and the Dryft symbol with its name. Sources are listed in the asset manifest; new CMS partners without approved artwork retain a readable name fallback.
- All partnership mailto links CC Silas and Kim while retaining the recipient, subject, and finder context.

Validation: `pnpm verify` passed lint, all 39 tests, and production build. Following the outline and single-instance marquee revision, lint, all nine partnership tests, and production build passed again. Local checks ran on Node 26; hosted CI uses its configured runtime. Browser evidence below is refreshed for this update.


Browser verification of the final revision:

- Chromium at 1440, 1024, 768, 390, and 320 pixels: meaningful page content, no framework overlay, no horizontal overflow, two hero actions, ten unique marquee items, no playback button or badges.
- All page images loaded. Gold/Silver/Bronze group headings and accessible link names match the configured tiers. Desktop and mobile screenshots visually inspected.
- Marquee moves continuously (16.64 pixels in a 400 ms sample), pauses on hover and link focus, and resumes on leaving. Reduced motion disables animation and shows all ten items in a static wrapping list. [Reduced-motion evidence](marquee-reduced-motion.png).
- Find your fit and Meet our partners anchors work. Hackathon + ongoing produces Long-Term Partnership, preserving both CC addresses and finder details in the result email and booking-dialog email fallback. Booking notes retain the same selection. Escape closes the dialog and restores focus. No email sent or appointment submitted.
- No application exceptions observed. Existing local Sanity Live CORS errors and speculative image/style preload warnings remain; CMS server data loads and all images render.
- Browser plugin was not available; checks used the available Playwright tools.


### Final tier treatment (2026-09-17)

Replaced tier outlines with one muted lavender heading per group, matching the approved mockup. Cards retain their existing sizes. Link arrows are hidden at rest and appear on hover or keyboard focus. Verified the three headings, 6/3/1 card grouping, responsive layout, and absence of overflow at 1440, 768, 390, and 320 pixels. Lint, nine partnership tests, and the production build passed after the grouped-heading change; lint and build were repeated after the arrow refinement.

### Marquee artwork fix (2026-09-17)

Added missing local artwork for OpenAI, Anthropic, Spherecast, and Dryft. JetBrains uses its official color-gradient symbol with white lettering. All ten curated partners now render images in the marquee; the regression test requires both a mapping and a shipped asset for each partner. New CMS partners can still use a readable name fallback.

`pnpm verify` passed lint, all 40 tests, and production build. The first attempt hit a local disk-space error; retry passed after clearing this worktree's generated build output. Browser checks confirmed ten decoded images, no fallback labels, and no overflow at 1440, 1024, 768, 390, and 320 pixels. Dark-background artwork and reduced-motion rendering were visually inspected; affected screenshots refreshed.

## Partner roster, photography, and rotation update (2026-09-19)

The curated roster now contains eight Gold partners, seven Silver partners, and three Bronze partners. NVIDIA and Entire.io join Gold; McKinsey & Company, Jane Street, BMW, and AWS join Silver; AMD and IBM join Bronze. CMS tier overrides remain supported, while alias normalization prevents duplicate companies across categories. Each addition also has local hero-marquee artwork.

The hero and three profiles use the supplied photographs. The outcome photos follow the confirmed mapping: atmo1 → Osapiens, atmo 2 → BMW, atmo 3 → QuantCo. WebP encoding preserves original dimensions without upscaling. Asset provenance and monochrome adaptations are documented in `public/assets/partners/SOURCES.md`.

Each tier has three stationary card frames, arranged horizontally from 768px upward and vertically on phones. Gold and Silver replace one company every 2.5 seconds with offset timers and a 600ms blur/scale dissolve. Bronze remains static. The scheduler shuffles slot order in groups of three, avoids consecutive use of the same slot, chooses the least-shown hidden companies, and favors a different previous slot when equally eligible. A transition reserves its outgoing and incoming companies until completion, preventing duplicates even during the dissolve.

Hover, keyboard focus, offscreen rows, and hidden documents pause automatic rotation. Explicit pause/resume and next controls remain available. Reduced motion disables autoplay and transitions, retaining keyboard-operable manual next controls. Image preloading has a bounded timeout; broken images retain the existing company-name fallback. Server rendering stays deterministic, with no CMS schema changes.

### Verification

- `pnpm verify` was run. The corrected run passed lint and all 43 tests; its subsequent build stage was interrupted during runner troubleshooting. A separate `pnpm build` then passed compilation, TypeScript, and static generation. No verification claim relies on the interrupted build. The first attempt also overlapped a dev server and failed; that server was stopped before final checks.
- The scheduler suite exercises 45,000 transitions across five roster sizes and three seeds, checking unique visible partners, least-shown selection, slot coverage, and shuffled-slot invariants. The real seven/eight-company rosters retain balanced appearance counts. Zero-to-three-company and duplicate-input cases remain static.
- Production browser checks: `http://127.0.0.1:3107/partners`, Chromium via Playwright (Browser plugin unavailable), widths 1440, 1024, 768, 390, and 320 in both light and dark color schemes. Every tier has exactly three active cards; layout switches at 768px. No horizontal overflow or broken images.
- Page title and content match `/partners`; no framework error overlay. Hero, portraits, case-study crops, and logos were visually inspected after image decoding.
- Five timed samples showed unique active companies and staggered replacements. Transition inspection confirmed a 0.6s animation, unique outgoing/incoming companies, and identical card-frame geometry before/during animation.
- Hover and keyboard-focus pause, explicit pause, manual next, offscreen pause, reduced-motion manual switching, and resume passed. Hidden-document behavior passed with a simulated visibility event; native browser background-tab throttling was not separately tested.
- Existing local Sanity Live CORS errors and speculative preload warnings remain. Server-side CMS loading succeeds; no application exception was observed. Node 26 also reports its existing localStorage build warning; Biome reports its existing schema-version informational notice.
- `git diff --check` passed. Changes are scoped to `feat/partner-page-rebuild` for PR #257; unrelated E-Lab edits in the main checkout are preserved.

### Updated visual evidence

| Surface | Screenshot |
| --- | --- |
| Hero, desktop | [Desktop hero](refresh-hero-desktop.png) |
| Hero, mobile | [Mobile hero](refresh-hero-mobile.png) |
| Supplied portraits | [Profiles](refresh-profiles.png) |
| Outcome photographs | [Case studies](refresh-cases.png) |
| Three-card tiers, desktop | [1440 px](refresh-wall-1440.png) |
| Three-card tiers, tablet | [768 px](refresh-wall-768.png) |
| Stacked tiers, phones | [390 px](refresh-wall-390.png), [320 px](refresh-wall-320.png) |

Wall screenshots are cropped from full-page captures with the header at the top of the document, avoiding sticky-header overlap in element screenshots. Autoplay is paused for these static captures.

### Portrait resolution correction (2026-09-19)

Replaced the landscape portrait sources with lossless 708 × 864 crops from the supplied PNGs and disabled Next.js recompression for these three images. The original width-based responsive selection was undersampling the vertical resolution needed by `object-fit: cover`, especially at Retina density. New asset filenames avoid stale optimized-image caches.

Verified pixel-for-pixel equality between each lossless WebP and its original PNG crop. Production browser verification at 1440px with device scale factor 2 confirms all three direct asset URLs serve 708 × 864 pixels, exceeding the 604 × 736 pixels needed by each 302 × 368 CSS-pixel card. Also visually checked at 390px. The profiles screenshot above now records this Retina verification. Scoped lint, all ten partnership tests, the production build, and `git diff --check` passed.

### Continuous rotation and supporter board (2026-09-19)

The follow-up request supersedes the playback controls and hover/focus pauses described above. Gold and Silver now rotate continuously while visible, without buttons. Offscreen and hidden-document suspension remains. Reduced-motion users see the complete static roster, with no animation or inaccessible hidden partners.

Supporters use the same stationary-card dissolve in exactly three rows: 18 cards on desktop, 15 or 12 on tablets, and nine on phones. Every 2.5 seconds, a batch of six, five, four, or three logos changes with 90ms staggering. The batch scheduler reserves every outgoing company until the batch finishes, avoids duplicate slots, and balances company appearances. Resizing remounts the scheduler for the new capacity.

Entire.io now uses lossless WebP renders of the official artwork. Logo errors retry once with a fresh URL before showing a name fallback; changing the source resets the retry state. A browser test deliberately failed the initial Entire.io request and confirmed recovery to its decoded 960px image.

Validation: lint, all 14 focused partnership/rotation tests, and the production build passed. Batch simulations cover four capacities and multiple roster sizes, including pools too small for a full batch. Production browser checks confirmed three rows at 1440, 1024, 768, 390, and 320px, unique companies throughout overlapping transitions, multiple simultaneous replacements, and no horizontal overflow. Hover and keyboard focus do not stop rotation. Reduced motion displays all 44 supporters without transition layers. Existing local Sanity Live CORS and speculative preload diagnostics remain, alongside the deliberately failed image request used for recovery testing.

Refreshed tier screenshots above remove the obsolete controls. Supporter evidence: [desktop](refresh-supporters-1440.png), [tablet](refresh-supporters-768.png), [390px](refresh-supporters-390.png), [320px](refresh-supporters-320.png). Captures were taken with rows offscreen to keep the static evidence stable.
