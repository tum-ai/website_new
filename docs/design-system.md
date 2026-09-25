# Design system

The site's visual language follows the 2026 brand guide
(`docs/brand/source/brand-guidelines.pdf`) and the partner page (#257): dark
indigo bands with the large logomark as a background shape, big light-weight
Manrope headlines with tight tracking, thin rules, rounded photography, and
calm light bands for reading. Motion is small, purposeful and always optional.

- Components: `src/components/ds` (import from `@/components/ds`)
- Tokens: `src/styles/index.css`
- Live reference: `/design-system` (development and Vercel previews only)

Every page, including `/partners`, is built from these components. Page-only
styles are the exception: keyframes or mechanics that belong to one page live in
`src/styles/pages/*.css` or, for the partner page, `src/styles/partners.css`.

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
| `text-highlight` | AA-safe accent color for emphasis, eyebrows and links |
| `bg-fg/[0.07]` etc. | Tone-aware tints (works on light and dark) |

Raw scales exist for rare cases: `violet-50…950` (500 = #9A64D9,
800 = #523573, 950 = #1B0049) and `ink-50…950` (violet-tinted neutrals).

## Typography

Use Manrope only. Pick a visual size independently of the heading level.

| Utility | Size | Use |
| --- | --- | --- |
| `text-display-2xl` | up to 128px | Home hero only |
| `text-display-xl` | up to 100px | Page heroes |
| `text-display-lg` | up to 72px | Big section statements, CTAs |
| `text-display-md` | up to 54px | Section titles (default `SectionHeader`) |
| `text-heading-lg` / `-md` / `-sm` | 34 / 23 / 17px | Card and sub-section titles |
| `text-lead` | up to 21px | Intros under headlines |
| `text-body` / `text-small` / `text-meta` | 16 / 14 / 13px | Copy, card copy, metadata |
| `text-eyebrow` | 12px uppercase | Labels above headlines |

Components: `Display`, `Heading`, `Text`, `Eyebrow` (with an optional
`index` counter), `Highlight` (`accent` or `fade`), and `Prose` (long-form
text such as the legal pages).

## Components

Layout
- `Container`: sizes `default` (80rem), `wide`, `narrow`, `prose`. Gutters match `/partners`.
- `Section`: props `tone`, `spacing` (`sm`–`xl`), `grain` (dark bands). Give it an `id` and `aria-labelledby`.
- `SectionHeader`: props `eyebrow`, `index`, `title`, `lead`, `actions`, and `layout` (`split` | `stack` | `center`). Reveals on scroll.

Page patterns
- `PageHero`: every page starts with one (ink by default). It accepts `eyebrow`, `title` (strings rise in word by word, and `<Highlight>` parts work), `lead`, `actions`, an optional `media` column and `children` (for stats or filters under the headline). It clears the fixed header.
- `CtaBand`: closing call to action. `variant="panel"` is an inset ink panel; `variant="band"` is full bleed.
- `FaqSection`: sticky heading beside an accordion. `FaqList` renders the accordion on its own.
- `Timeline`: a vertical rail that fills as you scroll. Pass `alternate` to zig-zag the items.
- `Steps`: a numbered process, with an optional per-step `number` (e.g. "02A").

Actions
- `ButtonLink`: for navigation. Uses next/link internally; external links open in a new tab and say so. Variants: `primary`, `secondary`, `outline`, `ghost`, `inverse` (white on dark), `link`. Sizes: `sm`, `md`, `lg`. `arrow` takes `true`, `"external"` or `"down"`.
- `Button`: for actions (Base UI). Compose it into triggers with `render={<Button variant="outline" />}`.
- `IconButton`: requires `aria-label`.
- `TextLink`: inline link with an underline that draws in on hover.

Content
- `Card`: variants `raised`, `outline`, `glass`, `plain`; set `interactive` when the card is a link.
- `SpotlightCard`: a card whose light follows the pointer.
- `FeatureCard`: icon, title and copy on a spotlight surface.
- `MediaCard`: photo card. `layout="overlay"` puts text on a scrim, `"stacked"` puts it below. Supports `href` and `aspect`, and passes `unoptimized` to next/image for CMS URLs.
- `QuoteCard`, `PersonCard`, `LogoTile`, `LogoWall`.
- `StatGrid`: numeric values count up when they scroll into view; strings render as they are.
- `Pill`: outlined brand pill.
- `Tag`: keyword chip.
- `StatusBadge`: `live` (pulsing dot) or `idle`. Its `size` (`sm`, `md`, `lg`) matches button heights; always pair it at the same size as the button beside it.
- `EmptyState`.

Interactive (Base UI)
- `Accordion` / `FaqList`: panels use `hidden="until-found"` so find-in-page still works.
- `Tabs`, `TabsList`, `TabsTab`, `TabsPanel`: the active pill slides between tabs.
- `Dialog`, `DialogTrigger`, `DialogContent` (`size` is `md`, `lg` or `xl`), `DialogTitle`, `DialogDescription`, `DialogClose`.
- `Collapsible`, `CollapsibleTrigger`, `CollapsiblePanel`.
- `ChipGroup`: single-select filter chips, with optional counts.
- `Carousel`: Embla with arrow buttons, a progress line and keyboard support.

Motion
- `Reveal`: fades content in on scroll. Variants: `up`, `fade`, `scale`, `left`, `right`, `line`. Use `delay={i * 80}` to stagger.
- `SplitWords`: headline words rise in on load; animated with CSS only.
- `CountUp`, `Parallax`, `ScrollProgress`.
- `BrandMark`: the logomark as a tonal background shape. Use it as decoration only, never as a logo substitute.
- `Aurora`: slow light field for dark bands.
- `Marquee`: infinite rail. Pauses on hover and focus, and becomes a static, horizontally scrollable row under reduced motion.

## Motion rules

- Above the fold, use the CSS utilities (`motion-safe:animate-rise`, `-rise-sm`, `-fade`) or `SplitWords`. Never use `Reveal` there: it waits for hydration.
- Below the fold, use `Reveal`. Only elements that start below the viewport are hidden, so server-rendered HTML and no-JS visitors always see content.
- Animate only `transform` and `opacity`. Avoid `filter` on anything containing text or large areas: Safari clips filtered elements to their box (cutting descenders) and large blurs stutter on phones. Any filter must be released when the animation ends. Use the house easing `ease-brand` (`cubic-bezier(0.22,1,0.36,1)`). Keep durations between 300ms (hover) and 1.2s (entrances).
- Prefix every looping or entrance animation with `motion-safe:`. Components already handle reduced motion themselves.
- Hover effects should be small: slow image zoom (1.04), arrow nudges, a 4px card lift, spotlight. Nothing bouncy.
- framer-motion runs inside `LazyMotion strict`: import `m`, not `motion`.

## Composition rules

These come from design review. Treat them as hard rules.

- **No meta rows.** Don't put a row of small labels between hairlines above hero headlines or sections.
- **Nested corners:** never set a rounded image or tile against a straight divider or straight edge inside a card. Either let the media bleed to the card edge, where the card's outer radius clips it and its inner edges stay straight, or inset it evenly on all sides with inner radius = outer radius − inset.
- **Alignment:** within a panel, labels, titles and controls share one baseline or grid. Icons are optically centered on the text they label. Never nudge them by hand.
- **Equal heights:** a button and a badge or chip placed side by side use the same size step.
- **No redundant labels:** if a logo already shows the name (a wordmark), don't repeat the name next to it. Symbol-only logos get the name inside the chip as a lockup, and only information the logo lacks sits outside it.
- **Don't combine `hyphens: auto` with `SplitWords` headlines:** each word is its own box, so hyphenation strands syllables. Size the headline down instead.
- **No em dashes in visible copy.** Use a comma, colon, period or a spaced hyphen instead. The same goes for separators in labels.

## Accessibility rules

- One `<main>` per page. It is usually the view's root element, and the layout provides the skip link target.
- Heading order: the `PageHero` is the `h1`, section titles are `h2`, card titles are `h3`.
- Use Base UI components for anything interactive. Never make a `<div>` clickable.
- Images need meaningful `alt` text; decorative images get `alt=""`. Links that open a new tab announce it; `ButtonLink` and `TextLink` do this for you.
- Focus rings are global (3px violet with an offset). Don't remove them.

## Page anatomy

1. `PageHero` (ink)
2. Alternating bands, for example paper → mist or lavender → ink → paper, each opening with a `SectionHeader`
3. `FaqSection`, if the page has FAQs
4. `CtaBand`
5. The global footer (night tone)

Pages end on light or ink bands, because the footer is night.

## Constraints

- **Homepage** (`test/homepage-performance.test.ts`):
  - The only image preload may be `/assets/tum_ai_logo_new.svg`, which is the hero's `priority` image. All other homepage images must be lazy.
  - `brand-grid-tile` and `mix-blend-overlay` must not appear in server-rendered HTML.
  - The page must stay statically prerendered and must build with webpack.
- **Tested content:** don't change tested content or config (`src/config/e-lab.ts`, `src/data/e-lab/*`).
- **Local CMS data:** `USE_MOCK_CMS=1` serves fixtures from `src/lib/mock-cms.ts`. It never runs on Vercel.
