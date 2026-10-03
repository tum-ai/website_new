# Design system

The site's visual language follows the 2026 brand guide
(`docs/brand/source/brand-guidelines.pdf`) and the partner page (#257): dark
indigo bands with the large logomark as a background shape, big light-weight
Manrope headlines with tight tracking, thin rules, rounded photography, and
calm light bands for reading. Motion is small, purposeful and always optional.

- Components: [`@tum.ai/ui-kit` 0.2.0](https://github.com/tum-ai/ui-kit/tree/v0.2.0)
- Tokens: `@tum.ai/ui-kit/tailwind.css`, imported by `src/styles/index.css`
- Live reference: `/design-system` (development and Vercel previews only)
- Why Base UI, tones and layers: [ADR 0001](adr/0001-base-ui-over-radix.md),
  [ADR 0002](adr/0002-tone-tokens-and-cascade-layers.md)

Every page, including `/partners`, is built from these components. Page-only
styles are the exception: keyframes or mechanics that belong to one page live in
`src/features/<domain>/<domain>.css` (today `home.css`, `partners.css`, `research.css`, `events.css`, `e-lab.css`, `projects.css` and `hackathons.css`),
inside cascade layers, imported by the route.

## Principles

1. **Precise, calm, alive.** Use generous whitespace, strong hierarchy and a
   few confident moves per section. Motion should support the content and
   never decorate for its own sake.
2. **Brand colors only.** Use violet, dark purple, dark indigo, black, lavender
   tint, minimal grey, white, and the tonal steps derived from them. Never give
   individual items their own accent color, and never use stock Tailwind grays
   or purples.
3. **Bands, not boxes.** A page is a sequence of full-bleed tone bands. Most
   separation comes from contrast between bands, spacing and hairlines, not
   from outlines.
4. **Accessible by default.** Base UI supplies behavior. Every text/background
   pair meets WCAG AA. Every animation respects `prefers-reduced-motion`.
   Server-rendered content is visible without JavaScript.

## Tones

Wrap each band in `<Section tone="…">`. It sets semantic tokens that every
component reads, so the same card works on light and dark bands.

| Tone | Canvas | Use for |
| --- | --- | --- |
| `paper` | #FFFFFF | Default reading band |
| `mist` | #EFEFEF (Minimal Grey) | Alternate light band |
| `lavender` | #F5EFFF (Lavender Tint) | Soft emphasis, forms, FAQs |
| `ink` | #1B0049 (Dark Indigo) | Heroes, feature bands, CTAs |
| `night` | #0D0214 (Black) | Deep contrast bands, footer |
| `violet` | #9A64D9 (Electric Lavender) | Large type only (stats); sparingly |

Semantic utilities (resolve per tone):

| Utility | Meaning |
| --- | --- |
| `bg-canvas` / `bg-raised` / `bg-sunken` | Band, one step up (cards), one step down (placeholders) |
| `text-fg` / `text-fg-muted` / `text-fg-subtle` | Primary, secondary, meta text |
| `border-hairline` / `border-hairline-strong` | Dividers and borders |
| `text-highlight` | AA-safe accent color for emphasis, links and markers (eyebrows use `text-fg-muted`) |
| `bg-fg/[0.07]` etc. | Tone-aware tints (works on light and dark) |

Raw scales exist for rare cases: `violet-50…950` (500 = #9A64D9,
800 = #523573, 950 = #1B0049) and `ink-50…950` (violet-tinted neutrals).
`bg-indicator` (`--color-indicator`, violet-400) is the live and active dot:
`StatusBadge` `live`, the active nav item, the live event count. It reads on
dark and light bands alike.

Custom utilities (provided by the kit stylesheet): `grain` (film grain on dark
bands), `zoom-media` (the one hover zoom for card media; put `group/zoom` on the
element whose hover starts it), `scroll-mt-header` (anchor targets land below
the fixed header), `tabular`, `mask-fade-x`, `rounded-signature`,
`text-gradient-brand`.

Custom variant: `card-hover:` applies while the enclosing card (`group/card`),
link or button is hovered, on devices that can hover. `IconBadge interactive`
uses it, so a badge reacts inside any clickable surface without a group name.

## Typography

Use Manrope only. Pick a visual size independently of the heading level.

| Utility | Size | Use |
| --- | --- | --- |
| `text-display-2xl` | up to 128px | Home hero only |
| `text-display-xl` | up to 100px | Page heroes |
| `text-display-lg` | up to 72px | Big section statements, CTAs |
| `text-display-md` | up to 54px | Section titles (default `SectionHeader`) |
| `text-heading-lg` / `-md` / `-sm` | 34 / 23 / 17px | Card and sub-section titles |
| `text-display-fit` | up to 72px | `PageHero size="fit"`: display-lg capped so a ~10em German compound fits a phone column |
| `text-lead` | up to 21px | Intros under headlines |
| `text-label` / `text-label-sm` | 15 / 13px | UI labels: md (and sm) buttons and badges, logo lockups and chips |
| `text-body` / `text-small` / `text-meta` | 16 / 14 / 13px | Copy, card copy, metadata |
| `text-eyebrow` | 14px, sentence case | Labels above headlines |
| `text-stat-sm` … `text-stat-xl` | 40 to 88px | Figures in `StatGrid` and `Ledger` |

Weights follow the brand guide: display sizes and figures are Light (300),
`display-md` is Regular (400), headings are Medium (500), labels Semibold.
Labels are never set in capitals.

Components: `Display`, `Heading`, `Text`, `Eyebrow` (with an optional
`index` counter, only for sections that form a sequence), `Highlight` (`accent` or `fade`), and `Prose` (long-form
text such as the legal pages).

## Public API and ownership

The website pins `@tum.ai/ui-kit` to **0.2.0**. The kit owns the shared primitives,
patterns, token definitions, utilities, interaction behaviour and generic shell.
The website owns page composition, content, CMS data, navigation and app adapters.

Use the versioned kit documentation for component contracts instead of maintaining
another API table here:

- [Public API](https://github.com/tum-ai/ui-kit/tree/v0.2.0/docs/api.md)
- [Design system and API conventions](https://github.com/tum-ai/ui-kit/tree/v0.2.0/docs/design-system.md)
- [Component contracts](https://github.com/tum-ai/ui-kit/tree/v0.2.0/docs/components)
- [Brand guide](https://github.com/tum-ai/ui-kit/tree/v0.2.0/docs/brand.md)
- [Getting started](https://github.com/tum-ai/ui-kit/tree/v0.2.0/docs/getting-started.md)

Import public primitives and types directly from `@tum.ai/ui-kit`. Generic shell
components come from `@tum.ai/ui-kit/shell`; site pages use the adapters in
`src/components/shell/`. Never deep-import kit implementation files, create a
local primitive barrel, copy kit source into the website, or patch `node_modules`.
If a shared contract needs a new variant or behaviour, change it in the kit,
release it, then deliberately update this website's exact version and showcase.
The `ds-component` skill describes that handoff.

```tsx
import { ButtonLink, Container, PageHero, Section } from "@tum.ai/ui-kit";

export function ExamplePage() {
  return (
    <main>
      <PageHero title="Build with TUM.ai" />
      <Section tone="paper">
        <Container>
          <ButtonLink href="/apply">Join the initiative</ButtonLink>
        </Container>
      </Section>
    </main>
  );
}
```

`src/styles/index.css` imports Tailwind, `@tum.ai/ui-kit/tailwind.css` and
`@tum.ai/ui-kit/shell.css`. The kit stylesheet registers its compiled JavaScript
as a Tailwind source; keep that registration when upgrading so package classes
are generated. The existing Next.js font loader supplies Manrope and
`--font-manrope`, so this app does not import the optional kit `fonts.css`.
`src/styles/partner-rotation.css` remains app-owned because it coordinates the
website's rotating partner artwork; route CSS remains app-owned too.

The layout provides `MotionProvider`, `#app-root` (the inert background for
modals), and `#main-content` (the skip-link target). Header and footer adapters
shape site facts, navigation, CMS content and logo URLs into kit props. Routes,
image policy and data fetching remain in this application. Kit media receives
explicit `unoptimized` where the app serves CMS URLs without the Next optimizer;
local asset choices remain the caller's policy.

`/design-system` demonstrates the installed package inside the website shell in
development and Vercel previews. Production returns 404. Its coverage test compares
the installed package's runtime public exports with the showcase's imported and
used symbols; `MotionProvider` is exercised by the layout. Package unit tests and
Storybook belong to the kit, while website tests cover content, adapters, routes
and integration. Run lint, typecheck and the targeted showcase test locally; full
suites, builds, E2E and visual checks run in this website's PR CI.

## Motion rules

- Above the fold, use the CSS utilities (`motion-safe:animate-rise`, `-rise-sm`, `-fade`) or `SplitWords`. Never use `Reveal` there: it waits for hydration.
- Below the fold, use `Reveal`. Only elements that start below the viewport are hidden, so server-rendered HTML and no-JS visitors always see content.
- Animate only `transform` and `opacity`. Avoid `filter` on anything containing text or large areas: Safari clips filtered elements to their box (cutting descenders) and large blurs stutter on phones. Any filter must be released when the animation ends. A short blur on logo images (not text) is fine: the partner walls blur the outgoing and incoming artwork through a swap (`src/styles/partner-rotation.css`). Use the house easing `ease-brand` (`cubic-bezier(0.22,1,0.36,1)`). Keep durations between 300ms (hover) and 1.2s (entrances).
- Prefix every looping or entrance animation with `motion-safe:`. Components already handle reduced motion themselves.
- Hover effects should be small: slow image zoom (1.04, `zoom-media`), arrow nudges, a 4px card lift, spotlight. Nothing bouncy.
- Use public kit motion components (`MotionProvider`, `Reveal`, `SplitWords`, `CountUp`) or CSS utilities. Shared motion implementation belongs upstream; this website consumes the public kit API.

## Composition rules

These come from design review. Treat them as hard rules.

- **No meta rows.** Don't put a row of small labels between hairlines above hero headlines or sections.
- **Nested corners:** never set a rounded image or tile against a straight divider or straight edge inside a card. Either let the media bleed to the card edge, where the card's outer radius clips it and its inner edges stay straight, or inset it evenly on all sides with inner radius = outer radius − inset.
- **Alignment:** within a panel, labels, titles and controls share one baseline or grid. Icons are optically centered on the text they label. Never nudge them by hand.
- **Equal heights:** a button and a badge or chip placed side by side use the same size step.
- **Equal widths when stacked:** group actions in `Actions`, never a bare `flex flex-wrap` row, so buttons that stack on a phone line up at one width.
- **No redundant labels:** if a logo already shows the name (a wordmark), don't repeat the name next to it. Symbol-only logos get the name inside the chip as a lockup, and only information the logo lacks sits outside it.
- **Don't combine `hyphens: auto` with `SplitWords` headlines:** each word is its own box, so hyphenation strands syllables. Size the headline down instead.
- **No em dashes in visible copy.** Use a comma, colon, period or a spaced hyphen instead. The same goes for separators in labels.

## Accessibility rules

- One `<main>` per page. It is the page module's root element, and the layout provides the skip link target.
- Heading order: the `PageHero` is the `h1`, section titles are `h2`, card titles are `h3`.
- Use Base UI components for anything interactive. Never make a `<div>` clickable.
- Images need meaningful `alt` text; decorative images get `alt=""`. Links that open a new tab announce it; `Anchor`, and everything built on it (`ButtonLink`, `TextLink`, `LogoTile`), does this for you.
- Focus rings are global (3px violet with an offset). Don't remove them.

## Page anatomy

1. `PageHero`: ink by default; research, projects and Q&A set `tone="night"`, and the home and
   events heroes are their own night bands (each still owns the page's `h1`)
2. Alternating bands, for example paper → mist or lavender → ink → paper, each opening with a `SectionHeader`
3. `FaqSection`, if the page has FAQs
4. A closing band: most pages have their own (`closing-section.tsx` in apply, community, e-lab,
   projects and qanda; research's closing band and home's `join-section.tsx`); `CtaBand` is the
   ds version (the partners contact band uses it)
5. The global footer (night tone)

Pages end on light or ink bands, because the footer is night.

## Constraints

- **Homepage budget** (`test/perf/homepage.perf.ts`, run by `pnpm test:perf` against the Turbopack output of `pnpm build`, in CI's Build job):
  - Two image preloads only: `/assets/tum_ai_logo_new.svg`, the header logo (`preload`), and the hero aperture's first photo, which is eager in the server HTML so React preloads it responsively (`imagesrcset` with `sizes`). The mark's entrance waits for that photo, so shape and image arrive together. Every other homepage image is lazy, including the other aperture photos, which mount after hydration.
  - `brand-grid-tile` and `mix-blend-overlay` must not appear in server-rendered HTML.
  - The CSS the homepage links must contain the utilities it uses.
- **Facts and content:** dates, counts, emails and links come from `src/config/`, never from components or page code. Changing them there is the intended way to update the site (see "Updating site facts" in [contributor-guide.md](contributor-guide.md)); the content tests derive their expectations from config, so they stay green. Don't hard-code a fact to make a layout work, and don't loosen a guard pattern.
- **Local CMS data:** `USE_MOCK_CMS=1` serves fixtures from `src/lib/mock-cms.ts`. It is read at build time (`USE_MOCK_CMS=1 pnpm build` or `pnpm dev`) and never runs on Vercel.

