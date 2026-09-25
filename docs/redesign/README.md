# Site redesign

The redesigned pages were captured on 2026-09-25 from a production build (`next build` and `next start`) with `USE_MOCK_CMS=1`, so `/events` and `/research` show local fixture data.

- Desktop captures are full-page at a 1440px viewport, scaled to 960px wide.
- Mobile captures are full-page at a 390px viewport.
- Reveal-on-scroll and count-up states were triggered by scrolling before each capture.

| Page | Desktop | Mobile |
| --- | --- | --- |
| Home | [desktop](home-desktop.jpg) | [mobile](home-mobile.jpg) |
| E-Lab | [desktop](e-lab-desktop.jpg) | [mobile](e-lab-mobile.jpg) |
| Apply | [desktop](apply-desktop.jpg) | [mobile](apply-mobile.jpg) |
| Community | [desktop](community-desktop.jpg) | [mobile](community-mobile.jpg) |
| Events | [desktop](events-desktop.jpg) | [mobile](events-mobile.jpg) |
| Research | [desktop](research-desktop.jpg) | [mobile](research-mobile.jpg) |
| Projects | [desktop](projects-desktop.jpg) | [mobile](projects-mobile.jpg) |
| Q&A | [desktop](qanda-desktop.jpg) | [mobile](qanda-mobile.jpg) |
| Partners | [desktop](partners-desktop.jpg) | [mobile](partners-mobile.jpg) |
| Data privacy | [desktop](data-privacy-desktop.jpg) | [mobile](data-privacy-mobile.jpg) |

## Verification

- `pnpm verify` passed: Biome, all 47 tests including the webpack homepage-performance build, and the production build.
- **Browser checks:** all 12 routes were loaded in Chrome at 1440, 1024, 768, 390 and 320px (60 combinations), with no horizontal overflow, broken images or console errors.
- **Page checks:** each page was also checked with reduced motion and by keyboard (tab order, dialogs, accordions, tabs, filters, drawer focus trap and focus return).
- **Header and shell:**
  - The mobile drawer opens as a dialog, traps focus, closes on Escape and returns focus to its trigger.
  - The skip link moves focus to the main content.
  - The active route is marked with `aria-current`.
- **Partner page:** section order, copy, heading levels, anchors, finder paths, booking dialog, logo rotation and marquee behaviour are unchanged. The anchors `#find-your-fit`, `#our-partners` and `#partner-contact` land at 110px, below the header.
