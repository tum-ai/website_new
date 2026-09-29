# Design system

The site's visual language follows the 2026 brand guide
(`docs/brand/source/brand-guidelines.pdf`) and the partner page (#257): dark
indigo bands with the large logomark as a background shape, big light-weight
Manrope headlines with tight tracking, thin rules, rounded photography, and
calm light bands for reading. Motion is small, purposeful and always optional.

- Components: `src/components/ds` (import from `@/components/ds` only)
- Tokens: `src/styles/index.css`
- Live reference: `/design-system` (development and Vercel previews only)
- Why Base UI, tones and layers: [ADR 0001](adr/0001-base-ui-over-radix.md),
  [ADR 0002](adr/0002-tone-tokens-and-cascade-layers.md)

Every page, including `/partners`, is built from these components. Page-only
styles are the exception: keyframes or mechanics that belong to one page live in
`src/features/<domain>/<domain>.css` (today `home.css` and `partners.css`),
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
| `text-highlight` | AA-safe accent color for emphasis, eyebrows and links |
| `bg-fg/[0.07]` etc. | Tone-aware tints (works on light and dark) |

Raw scales exist for rare cases: `violet-50…950` (500 = #9A64D9,
800 = #523573, 950 = #1B0049) and `ink-50…950` (violet-tinted neutrals).
`bg-indicator` (`--color-indicator`, violet-400) is the live and active dot:
`StatusBadge` `live`, the active nav item, the live event count. It reads on
dark and light bands alike.

Custom utilities (`@utility` in `index.css`): `grain` (film grain on dark
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

## API conventions

Every ds component follows these; new ones must too. They are also written at
the top of `src/components/ds/index.ts`, which wins if the two disagree.

- **Variants** are cva variants with `defaultVariants`, documented on the cva
  config. A variant that swaps the markup rather than classes may branch in
  JSX instead.
- **`as` vs `headingAs`.** `as` is the root element (Section, Card, Container,
  Reveal, typography). `headingAs` is the level of a component's title (`h2`,
  `h3`, `h4`); the page hero owns the `h1`. `SectionHeader` takes `headingAs`
  (it used to take `as`).
- **`tone` vs `emphasis`.** `tone` only ever means a band tone (`data-tone`:
  paper, mist, lavender, ink, night, violet). A text color within a tone is
  `emphasis` (`Text`, `TextLink`).
- **Props** extend `ComponentProps<…>` of the root element, so `ref` is a plain
  prop (React 19). Every component exports its `XProps` type.
- **Styling hooks.** `className` targets the root; components with several
  parts take a `classNames` object of per-part overrides. A slot class replaces
  the part's layout default where the TSDoc says so: `Carousel`
  `classNames.slide` replaces the default slide widths rather than merging with
  them.
- **Names that collide with HTML attributes are avoided.** The line under a
  name on `QuoteCard` and `PersonCard` is `byline` (it used to be `role`, which
  clashed with the root's ARIA `role`).
- **TSDoc** on every export and every prop. A renamed prop keeps a
  `@deprecated` alias that names its replacement for one release, then goes.
  (The W1 aliases, `Text`/`TextLink` `tone` and `Carousel`
  `slideClassName`/`viewportClassName`, are gone.)
- **`"use client"`** only where the component itself uses state, effects or
  event handlers; Base UI parts are client components already.
- **Motion:** house easing (`ease-brand`), at most 1.2s outside ambient loops,
  and nothing moves under `prefers-reduced-motion` (`motion-safe:` or
  `motion-reduce:`).
- **Links go through `Anchor`:** routes use next/link; http(s) opens a new
  tab with `rel="noopener noreferrer"` and a screen-reader hint; mailto:, tel:
  and in-page anchors stay plain `<a>`. `ButtonLink`, `TextLink`, `MediaCard`
  and `LogoTile` link through it. **Images** use next/image; remote CMS URLs
  pass `unoptimized`.
- **Imports:** ds files import only sibling ds files and `@/lib/cn`.

A change to a component is done when the component, its colocated test, its
`/design-system` showcase entry (`showcase-coverage.test.ts` fails on a missing
export) and its row in the API reference below agree. The `ds-component` skill
walks through it.

## Components

Layout
- `Container`: sizes `default` (80rem), `wide`, `narrow`, `prose`. Gutters match `/partners`.
- `Section`: props `tone`, `spacing` (`sm`–`xl`), `grain` (dark bands). Give it an `id` and `aria-labelledby`.
- `SectionHeader`: `eyebrow`, `index`, `title`, `count` (a small "(4)" after the title), `lead`, `actions`, `layout` (`split` | `stack` | `center`), `size` (`md`, `lg`, or `xl` for a page's lead statement) and `headingAs`. Reveals on scroll.

Page patterns
- `PageHero`: every page starts with one: a flat ink band (no aurora or grain). It accepts `eyebrow`, `title` (strings rise in word by word, and `<Highlight>` parts work), `lead`, `actions`, an optional `media` column, `children` (for stats or filters under the headline) and `classNames` slots. `emphasis="highlight"` sets the whole title in the tone's accent, as on the brand guide's section slides; keep the default when the title marks words with `<Highlight>`. `size="fit"` caps the title for long single words (the privacy page). It clears the fixed header.
- `CtaBand`: closing call to action. `variant="panel"` is an inset ink panel; `variant="band"` is full bleed. Takes `children` and `classNames.footer`.
- `CtaPanel`: the panel surface of `CtaBand` on its own (ink, aurora, grain, logomark), for places a whole band can't go, such as a bento cell.
- `FaqSection`: sticky heading beside an accordion, with an eyebrow `index` and `defaultValue` (questions that start open). `FaqList` renders the accordion on its own and takes `defaultValue` too.
- `Timeline`: a vertical rail that fills as you scroll (static under reduced motion). `alternate` zig-zags the items; `rail="dashed"`, `marker="number"` and `continuation` cover the E-Lab program.
- `Steps`: a numbered process, with `rail` (`solid`, `dashed`, `none`), `marker` (`badge`, `dot`), an optional per-step `number` (e.g. "02A") and a `detail` line under the title (such as the step's dates). `layout="rows"` sets each step as a hairline row with the number beside it, for steps that are sentences.
- `StatGrid`: numeric values count up when they scroll into view (sizes `sm`–`xl` on the `text-stat-*` tokens); strings render as they are, or count with `count`.
- `Ledger`: key figures as an annual-report ledger, one hairline row per figure with its label and a `note` on the left and the figure right-aligned (`size` `md` or `lg`). Same figure rules as `StatGrid`.
- `KeyDates`: a round's important dates as a call for papers sets them. One hairline row per date, the label (and a `detail` line) on the left and the date in light figures on the right. Each row's `state` (`past`, `next`, `upcoming`) comes from the caller's own clock: past dates are struck through and say "(passed)" to screen readers, and the next one is in the accent with its `note`. `size` `md` or `lg`; `drawIn` draws the strikes once on load (above the fold).
- `DayRuler`: a window of days as a ruler, with one tick per day, taller week ticks, and a fill and mark up to today (`days`, `elapsed`, optional `startLabel`, `endLabel` and a `markLabel` over today's mark, `size` `md` or `lg`, `drawIn`). It is decorative, so say the same thing in text beside it ("26 days left").
- `IndexList`: a typographic index of destinations. Full-width link rows (large light title, one line of description, optional `detail`, an arrow); from `lg` a sticky photo beside the list follows the hovered or focused row and the other rows dim. Below `lg` each row shows its photo as a thumbnail.
- `BrandPanel`: the branded placeholder for a missing image.
- `TopBlend`: eases a dark band's edge into the root canvas (see [browser-quirks.md](browser-quirks.md)).

Actions
- `ButtonLink`: for navigation. Uses next/link internally; external links open in a new tab and say so. Variants: `primary` (a flat violet-600 fill with a hairline highlight, no glow), `secondary`, `outline`, `ghost`, `inverse` (white on dark), `link`. Sizes: `sm`, `md`, `lg`. `arrow` takes `true`, `"external"` or `"down"`.
- `Button`: for actions (Base UI). Compose it into triggers with `render={<Button variant="outline" />}`.
- `Actions`: the row for two or more buttons or badges (`align`: `start` | `center`). On one line each item keeps its width; once the row wraps on a phone, every item grows to the row width, so stacked actions share one width. `PageHero`, `CtaBand` and `SectionHeader` use it for their `actions`.
- `IconButton`: requires `aria-label`.
- `TextLink`: inline link with an underline that draws in on hover.
- `Anchor`: the unstyled, route-aware link every ds link builds on; use it directly for links that bring their own styling (navigation lists, the footer).

Content
- `Card`: variants `raised`, `outline`, `glass`, `plain`; set `interactive` when the card is a link.
- `SpotlightCard`: a card whose light follows the pointer.
- `FeatureCard`: icon, title and copy on a spotlight surface.
- `IconBadge`: an icon in a tinted brand-violet tile (decorative). `interactive` reacts to the enclosing card, link or button (`card-hover:`).
- `MediaCard`: photo card. `layout="overlay"` puts text on a scrim, `"stacked"` puts it below. Supports `href`, `aspect`, a `fallback` for a missing or broken image (default `BrandPanel`), a `cornerHint` slot, an `action` slot (for example a dialog trigger instead of a link), `titleId`, and `descriptionLines` (clamp and reserve 2 or 3 lines so titles in a row align). It passes `unoptimized` to next/image for CMS URLs.
- `CornerHint`: the corner disc that says what a click does (`icon` `arrow` or `open`), for cards that aren't `MediaCard`.
- `FallbackImage`: next/image that swaps to a fallback when it fails to load.
- `QuoteCard` (`raised` or `glass`, with `context` and `footer` slots; `editorial` sets one quote in display type without a card; `ruled` sets quotes in a list under a hairline, without a card) and `QuoteMark`.
- `Photo`: a documentary photo in the brand frame with a factual `caption` (a `figure`). `aspect` (`3/2` default, `4/3`, `16/10`, `4/5`, `1/1`, and `panorama` for wide group shots: 4/3, then 2/1 from `sm` and 24/7 from `lg`), `shape` (`rounded` = `rounded-4xl`, or `bleed`), `position` for the crop, and `eager` for the LCP photo (high fetch priority, no preload tag). Use it instead of hand-rolled image frames; `MediaCard` is for linked cards with text on or under the photo.
- `PersonCard`: portrait, name and `byline`; `image.position` keeps a face in frame, and `unoptimized` serves the portrait as is.
- `LogoTile`, `LogoWall`: logos as tiles (`size` `sm` to `xl`, `responsive` for one step smaller on phones), `variant="chip"` (with `fixed` width so rows don't reflow), `variant="bare"` for artwork made for dark bands, `variant="mono"` for light-background artwork in greyscale on light bands, links, or a `wordmark` lockup, with a name fallback when the artwork fails. `LogoWall layout="strip"` sets `mono` logos in one wrapping row, each sized to the same area from its `aspectRatio`.
- `BulletList`: a short list of points as raised rows with an accent dot (for example inside an FAQ answer).
- `Pill`: outlined brand pill.
- `Tag`: keyword chip.
- `StatusBadge`: `live` (pulsing dot), `idle` or `closed`. Its `size` (`sm`, `md`, `lg`) matches button heights; always pair it at the same size as the button beside it. A label too long for a narrow phone wraps into a rounded rectangle, centred, with the dot on its first line.
- `EmptyState`.

Interactive (Base UI)
- `Accordion` / `FaqList`: panels use `hidden="until-found"` so find-in-page still works.
- `Tabs`, `TabsList`, `TabsTab`, `TabsPanel`: the active pill slides between tabs; on phones long labels wrap.
- `Dialog`, `DialogTrigger`, `DialogContent` (`variant` `modal` or `fullscreen`, `size` `md`, `lg` or `xl`, `tone`), `DialogTitle`, `DialogDescription`, `DialogClose`. An open dialog makes the page inert (`useInertBackground`).
- `Collapsible`, `CollapsibleTrigger`, `CollapsiblePanel`.
- `ChipGroup`: single-select filter chips, with optional counts.
- `Carousel`: Embla with arrow buttons, a progress line, keyboard support and `classNames` slots.

Motion
- `Reveal`: fades content in on scroll. Variants: `up`, `fade`, `scale`, `left`, `right`, `line`. Use `delay={i * 80}` to stagger.
- `SplitWords`: headline words rise in on load; animated with CSS only.
- `CountUp` (parses formatted strings such as "1.2M+"; `parseFigure` and `formatFigure` are the server-safe helpers), `Parallax`, `ScrollProgress`.
- `MotionProvider`: framer-motion's `LazyMotion strict`, provided once by the site layout.
- `BrandMark`: the logomark as a tonal background shape, with an `intensity` step for dark bands. Use it as decoration only, never as a logo substitute.
- `Aurora`: slow light field for dark bands.
- `Marquee`: infinite rail. Pauses on hover and focus, and becomes a static, horizontally scrollable row under reduced motion.

Hooks
- `useBreakpoint("md")`: whether the viewport is at least a Tailwind breakpoint wide, for islands that must know the layout in JavaScript. It is `false` on the server and during hydration, so render the narrow layout first.

## Motion rules

- Above the fold, use the CSS utilities (`motion-safe:animate-rise`, `-rise-sm`, `-fade`) or `SplitWords`. Never use `Reveal` there: it waits for hydration.
- Below the fold, use `Reveal`. Only elements that start below the viewport are hidden, so server-rendered HTML and no-JS visitors always see content.
- Animate only `transform` and `opacity`. Avoid `filter` on anything containing text or large areas: Safari clips filtered elements to their box (cutting descenders) and large blurs stutter on phones. Any filter must be released when the animation ends. Use the house easing `ease-brand` (`cubic-bezier(0.22,1,0.36,1)`). Keep durations between 300ms (hover) and 1.2s (entrances).
- Prefix every looping or entrance animation with `motion-safe:`. Components already handle reduced motion themselves.
- Hover effects should be small: slow image zoom (1.04, `zoom-media`), arrow nudges, a 4px card lift, spotlight. Nothing bouncy.
- framer-motion runs inside `LazyMotion strict`: import `m`, not `motion`.

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
- Images need meaningful `alt` text; decorative images get `alt=""`. Links that open a new tab announce it; `Anchor`, and everything built on it (`ButtonLink`, `TextLink`, `MediaCard`, `LogoTile`), does this for you.
- Focus rings are global (3px violet with an offset). Don't remove them.

## Page anatomy

1. `PageHero` (ink)
2. Alternating bands, for example paper → mist or lavender → ink → paper, each opening with a `SectionHeader`
3. `FaqSection`, if the page has FAQs
4. `CtaBand`
5. The global footer (night tone)

Pages end on light or ink bands, because the footer is night.

## Constraints

- **Homepage budget** (`test/perf/homepage.perf.ts`, run by `pnpm test:perf` against the Turbopack output of `pnpm build`, in CI's Build job):
  - Two image preloads only: `/assets/tum_ai_logo_new.svg`, the header logo (`priority`), and the hero aperture's first photo, which is eager in the server HTML so React preloads it responsively (`imagesrcset` with `sizes`). The mark's entrance waits for that photo, so shape and image arrive together. Every other homepage image is lazy, including the other aperture photos, which mount after hydration.
  - `brand-grid-tile` and `mix-blend-overlay` must not appear in server-rendered HTML.
  - The CSS the homepage links must contain the utilities it uses.
- **Facts and content:** dates, counts, emails and links come from `src/config/`, never from components or page code. Changing them there is the intended way to update the site (see "Updating site facts" in [contributor-guide.md](contributor-guide.md)); the content tests derive their expectations from config, so they stay green. Don't hard-code a fact to make a layout work, and don't loosen a guard pattern.
- **Local CMS data:** `USE_MOCK_CMS=1` serves fixtures from `src/lib/mock-cms.ts`. It is read at build time (`USE_MOCK_CMS=1 pnpm build` or `pnpm dev`) and never runs on Vercel.

## API reference

Generated from the TSDoc on each exported `XProps` type in `src/components/ds`, listing the props
each component declares itself. Every component also accepts the props of its root element (or of
the Base UI part it wraps), including `ref`, `className` and `aria-*`. A `?` marks an optional
prop. When this table and the source disagree, the source wins: update the table in the same PR.

### `AccordionItem`

| Prop | Type | Description |
| --- | --- | --- |
| `className?` | `string` | Classes merged over the defaults (a hairline below the item). |

### `AccordionPanel`

| Prop | Type | Description |
| --- | --- | --- |
| `children` | `ReactNode` | The answer. |
| `className?` | `string` | Classes for the answer's content box. The panel element itself only animates its height, so padding and type go here. |

### `Accordion`

| Prop | Type | Description |
| --- | --- | --- |
| `className?` | `string` | Classes merged over the defaults (a hairline above the first item). |

### `AccordionTrigger`

| Prop | Type | Description |
| --- | --- | --- |
| `children` | `ReactNode` | The question. |
| `headingAs?` | `HeadingLevel` | Heading level that wraps the trigger. Default `h3`. |
| `className?` | `string` | Classes merged over the trigger button's defaults. |

### `FaqList`

| Prop | Type | Description |
| --- | --- | --- |
| `items` | `FaqItem[]` | Questions and answers. Keep the data in the feature's data/ folder. |
| `defaultValue?` | `string[]` | Questions whose answers start open, e.g. `[items[0].question]` to open the first. Each item's value is its question. |
| `headingAs?` | `HeadingLevel` | Heading level of each question. Default `h3`. |
| `className?` | `string` | Classes merged over the accordion root. |

### `Actions`

| Prop | Type | Description |
| --- | --- | --- |
| `align?` | `"center" \| "start"` | Horizontal alignment of the row. |

### `Anchor`

| Prop | Type | Description |
| --- | --- | --- |
| `children?` | `ReactNode` | The link content; it names the link. |
| `href` | `string` | Route, in-page anchor, http(s), mailto: or tel: URL. |
| `external?` | `boolean` | Force new-tab behavior; defaults to true for http(s) URLs. |

### `Aurora`

| Prop | Type | Description |
| --- | --- | --- |
| `intensity?` | `"subtle" \| "default" \| "vivid"` | How strongly the light shows. |
| `className?` | `string` | Classes merged over the light field's box (fills its parent). |

### `BrandMark`

| Prop | Type | Description |
| --- | --- | --- |
| `variant?` | `"tonal" \| "gradient"` | `tonal`: one currentColor fill. `gradient`: violet fade on the center stroke. |
| `drift?` | `boolean` | Slow ambient drift (still under reduced motion). Default true. |
| `intensity?` | `"strong" \| "subtle" \| "faint" \| "soft" \| "medium"` | How much the white mark shows on a dark band; see the cva variant. |

### `BrandPanel`

| Prop | Type | Description |
| --- | --- | --- |
| `seed?` | `number` | Picks one of three compositions, e.g. the item's index in a grid, so neighbours differ. Any integer works. |

### `BulletList`

| Prop | Type | Description |
| --- | --- | --- |
| `items` | `ReactNode[]` | The points, in order. Text items are keyed by their text, so keep them unique; give elements their own `key`. |

### `ButtonLink`

| Prop | Type | Description |
| --- | --- | --- |
| `children` | `ReactNode` | The visible label. |
| `variant?` | `"link" \| "primary" \| "secondary" \| "outline" \| "ghost" \| "inverse"` | Visual weight. `inverse` is solid white for dark bands and photos. |
| `size?` | `"sm" \| "md" \| "lg" \| "icon" \| "icon-sm"` | Height step; `icon` and `icon-sm` are square. |
| `href` | `string` | Route, in-page anchor, http(s), mailto: or tel: URL. |
| `arrow?` | `ButtonArrowKind` | Trailing arrow that nudges on hover. |
| `external?` | `boolean` | Force new-tab behavior; defaults to true for http(s) URLs. |

### `Button`

| Prop | Type | Description |
| --- | --- | --- |
| `variant?` | `"link" \| "primary" \| "secondary" \| "outline" \| "ghost" \| "inverse"` | Visual weight. `inverse` is solid white for dark bands and photos. |
| `size?` | `"sm" \| "md" \| "lg" \| "icon" \| "icon-sm"` | Height step; `icon` and `icon-sm` are square. |
| `arrow?` | `ButtonArrowKind` | Trailing arrow that nudges on hover. |
| `className?` | `string` | Classes merged over the variant styles. |

### `IconButton`

| Prop | Type | Description |
| --- | --- | --- |
| `className?` | `string` | Classes merged over the variant styles. |
| `aria-label` | `string` | Defines a string value that labels the current element. Required: the only name an icon-only button has. |
| `variant?` | `"link" \| "primary" \| "secondary" \| "outline" \| "ghost" \| "inverse"` | Visual weight. `inverse` is solid white for dark bands and photos. |
| `size?` | `"icon" \| "icon-sm"` | Square size step. Default `icon`. |

### `Card`

| Prop | Type | Description |
| --- | --- | --- |
| `variant?` | `"outline" \| "raised" \| "glass" \| "plain"` | Surface treatment. |
| `padding?` | `"sm" \| "md" \| "lg" \| "none"` | Inner padding step. |
| `interactive?` | `boolean` | A 4px lift and a stronger shadow on hover (still under reduced motion). |
| `as?` | `T` | Root element to render. |

### `Carousel`

| Prop | Type | Description |
| --- | --- | --- |
| `children` | `ReactNode` | One element per slide. |
| `label` | `string` | Accessible name of the carousel, e.g. "Program highlights". |
| `options?` | `Partial<OptionsType>` | Embla options, merged over `align: "start"` and `containScroll: "trimSnaps"`. |
| `variant?` | `CarouselVariant` | `rail`: controls in a row under the slides. `overlay`: the carousel fills its parent (a photo frame) and the controls sit on its bottom edge. |
| `gap?` | `number` | Gap between slides in rem. Default 1.25. |
| `controls?` | `boolean` | Show the arrows and progress line when the slides overflow. Default true. |
| `slideLabel?` | `((position: number, total: number) => string)` | Screen-reader label for each slide. Default "2 of 5". |
| `classNames?` | `CarouselClassNames` | Class overrides for the inner parts. |
| `className?` | `string` | Classes merged over the root region. |

### `ChipGroup`

| Prop | Type | Description |
| --- | --- | --- |
| `label` | `string` | Accessible group name, e.g. "Category". |
| `labelledBy?` | `string` | id of a visible label element; preferred over `label` when present. |
| `options` | `ChipOption[]` | The chips, in order. |
| `value` | `string` | The selected value (controlled). |
| `onValueChange` | `(value: string) => void` | Called with the newly selected value. |
| `className?` | `string` | Classes merged over the wrapping row. |

### `CollapsiblePanel`

| Prop | Type | Description |
| --- | --- | --- |
| `className?` | `string` | Classes merged over the defaults (height transition, clipping). |

### `Collapsible`

| Prop | Type | Description |
| --- | --- | --- |
| `className?` | `string` | Classes for the root element. |

### `CollapsibleTrigger`

| Prop | Type | Description |
| --- | --- | --- |
| `className?` | `string` | Classes merged over the defaults. The trigger is `group/collapsible`, so children can style the open state with `group-data-[panel-open]/collapsible:`. |

### `Container`

| Prop | Type | Description |
| --- | --- | --- |
| `size?` | `"default" \| "wide" \| "narrow" \| "prose"` | Maximum width of the column; the gutters are the same for all. |
| `as?` | `T` | Root element to render. |

### `CountUp`

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `string \| number` | A number, formatted with the props below, or a copy figure ("1.2M+", "2.3%") that counts up and always settles on the exact source text. |
| `prefix?` | `string` | Text before a numeric value, e.g. "~". Ignored for strings. |
| `suffix?` | `string` | Text after a numeric value, e.g. "+". Ignored for strings. |
| `decimals?` | `number` | Fraction digits of a numeric value. Ignored for strings. |
| `grouping?` | `boolean` | Thousands separators for a numeric value ("2,100"); default true. |
| `duration?` | `number` | Seconds. Default 1.2, the longest entrance the motion rules allow. |
| `className?` | `string` | Classes merged over the wrapper (which sets tabular figures). |

### `CtaBand`

| Prop | Type | Description |
| --- | --- | --- |
| `title` | `ReactNode` | The closing statement. |
| `eyebrow?` | `ReactNode` | Small label above the title. |
| `visual?` | `ReactNode` | Large icon or artwork above the title (decorative; hide it from AT). |
| `lead?` | `ReactNode` | One or two sentences under the title. |
| `actions?` | `ReactNode` | Buttons and status badges, laid out by `<Actions>`. |
| `children?` | `ReactNode` | Content under the lead that brings its own layout (e.g. a feature's contact row that is already an `<Actions>`), revealed after `actions`. |
| `titleId?` | `string` | id of the heading, referenced by the section's `aria-labelledby`. |
| `headingAs?` | `HeadingLevel` | Heading level of the title. Default `h2`. |
| `id?` | `string` | Anchor id for the section (e.g. "contact"). |
| `variant?` | `"panel" \| "band"` | `panel`: rounded ink panel (`<CtaPanel>`) inset in a light band (default). `band`: full-bleed dark band. |
| `tone?` | `Tone` | Surrounding band tone for the `panel` variant. Default `paper`. |
| `classNames?` | `CtaBandClassNames` | Class overrides for the inner parts. |
| `className?` | `string` | Classes merged over the section. |

### `CtaPanel`

No props of its own; see the source file for the root element or Base UI part it forwards to.

### `DialogContent`

| Prop | Type | Description |
| --- | --- | --- |
| `variant?` | `"modal" \| "fullscreen"` | `modal`: a rounded card centered on phones' bottom edge and in the middle on larger screens. `fullscreen`: a full-height sheet that slides in from the right and covers the screen on phones (the header menu); cap its width with `className` (e.g. `max-w-md`). |
| `size?` | `"md" \| "lg" \| "xl"` | Maximum width of the `modal` variant. |
| `children` | `ReactNode` | The dialog's content; include a `<DialogTitle>`. |
| `showClose?` | `boolean` | Show the round close button in the top-right corner. Default true for `modal`, false for `fullscreen` (which usually has its own header row). |
| `closeLabel?` | `string` | Accessible name of the close button. Default "Close". |
| `tone?` | `Tone` | Band tone of the dialog surface. Default `paper`. |
| `className?` | `string` | Classes merged over the popup. |

### `DialogDescription`

| Prop | Type | Description |
| --- | --- | --- |
| `className?` | `string` | Classes merged over the paragraph. |

### `Dialog`

No props of its own; see the source file for the root element or Base UI part it forwards to.

### `DialogTitle`

| Prop | Type | Description |
| --- | --- | --- |
| `className?` | `string` | Classes merged over the heading. |

### `EmptyState`

| Prop | Type | Description |
| --- | --- | --- |
| `icon?` | `LucideIcon` | Icon above the title. |
| `title` | `ReactNode` | What is empty, e.g. "No events found". |
| `children?` | `ReactNode` | What to do about it. |
| `action?` | `ReactNode` | A button that resolves it (e.g. "Clear filters"). |
| `className?` | `string` | Classes merged over the dashed panel. |

### `FallbackImage`

| Prop | Type | Description |
| --- | --- | --- |
| `src?` | `string \| StaticImport` | Image source. Without one the fallback renders straight away. |
| `fallback` | `ReactNode` | Rendered instead of the image when there is no source or it fails to load. |
| `onError?` | `(() => void)` | Called once the image has failed, before the fallback renders. |

### `FaqSection`

| Prop | Type | Description |
| --- | --- | --- |
| `items` | `FaqItem[]` | Questions and answers. Keep the data in the feature's data/ folder. |
| `title?` | `ReactNode` | Section title (an `h2`). Default "Frequently asked questions". |
| `eyebrow?` | `ReactNode` | Label above the title. Default "FAQ". |
| `index?` | `string \| number` | Editorial counter in the eyebrow, e.g. 2 → "02". |
| `defaultValue?` | `string[]` | Questions whose answers start open (see `FaqListProps`). |
| `lead?` | `ReactNode` | A sentence under the title. |
| `aside?` | `ReactNode` | Extra content under the lead (e.g. a contact link). |
| `id?` | `string` | Anchor id of the section; the title gets `${id}-title`. Default "faq". |
| `tone?` | `Tone` | Band tone. Default `paper`. |
| `className?` | `string` | Classes merged over the section. |

### `FeatureCard`

| Prop | Type | Description |
| --- | --- | --- |
| `icon?` | `LucideIcon` | Icon in a violet badge that tilts on hover. |
| `title` | `ReactNode` | The card title. |
| `children?` | `ReactNode` | A sentence or two of copy. |
| `index?` | `string` | Editorial counter shown top-right, e.g. "01". |
| `headingAs?` | `HeadingLevel` | Heading level of the title. Default `h3`. |
| `variant?` | `"outline" \| "raised" \| "glass"` | Card surface. Default `raised`. |
| `className?` | `string` | Classes merged over the card. |

### `IconBadge`

| Prop | Type | Description |
| --- | --- | --- |
| `variant?` | `"soft" \| "outline" \| "tint"` | Surface behind the icon. |
| `size?` | `"sm" \| "md" \| "lg"` | Box size; the icon scales with it. |
| `interactive?` | `boolean` | Tilts and fills with brand violet while the enclosing card (`group/card`), link or button is hovered (the `card-hover:` variant; no tilt under reduced motion). |
| `shape?` | `"circle" \| "square"` | `square` has rounded corners, `circle` is round. |
| `icon` | `LucideIcon` | The Lucide icon. It is decorative; name the thing in adjacent text. |
| `strokeWidth?` | `number` | Stroke width of the icon. Default 1.75, the house weight. |

### `LogoTile`

| Prop | Type | Description |
| --- | --- | --- |
| `name` | `string` | Organization name: the fallback text and the default `alt`. |
| `src?` | `string` | Logo artwork. Without it (or if it fails to load) the name is set instead. |
| `href?` | `string` | Link to the organization; http(s) URLs open in a new tab. |
| `alt?` | `string` | Text alternative for the artwork. Default `name`. |
| `wordmark?` | `ReactNode` | Name set beside a symbol-only logo, forming a wordmark lockup ("[symbol] Y Combinator"). The image then gets an empty `alt`, since the text names the organization. |
| `unoptimized?` | `boolean` | Serve the artwork as is, skipping the image optimizer. Default: true for absolute http(s) URLs (CMS hosts are outside next.config's image patterns), false for local assets. |
| `aspectRatio?` | `number` | The artwork's width divided by its height. A `strip` wall uses it to give every logo the same area, so wide wordmarks and square marks read at one visual weight. |
| `variant?` | `"tile" \| "chip" \| "bare" \| "mono"` | `tile`: a white card for logo grids. `chip`: a compact white chip that carries light-background artwork on dark bands (quote rows, meta lines). `bare`: no surface, for artwork made for dark bands (logo rails on ink); size it with `className`. `mono`: no surface, light-background artwork in greyscale on light bands, in colour while hovered or focused; it fills its parent's `--logo-w` and `--logo-h` (a `strip` wall sets them). |
| `size?` | `"sm" \| "md" \| "lg" \| "xl"` | Tile height and logo cap (the `tile` variant only), smallest to largest: `sm` 64px, `md` 96px, `lg` 112px, `xl` 128px. |
| `responsive?` | `boolean` | One size step smaller below `md` (phones and small tablets), for `lg` and `xl` tiles in narrow grid cells. |
| `fixed?` | `boolean` | Chip only: a fixed width (6.25rem, 7.75rem from `sm`) that reserves the artwork's box, so a wrapping row of chips doesn't reflow while the logos load. |
| `eager?` | `boolean` | Load the artwork eagerly, e.g. inside a moving marquee. |
| `className?` | `string` | Classes merged over the tile. |

### `LogoWall`

| Prop | Type | Description |
| --- | --- | --- |
| `layout?` | `"grid" \| "strip"` | `grid`: white tiles in columns. `strip`: `mono` logos in one wrapping row, each sized to the same area from its `aspectRatio`. |
| `columns?` | `4 \| 3 \| 5 \| 6` | Columns on wide screens (`grid` only); phones always show two. |
| `logos` | `LogoItem[]` | The organizations; `name` must be unique (it is the list key). |
| `size?` | `"sm" \| "md" \| "lg" \| "xl"` | Tile size for every logo (`grid` only). |
| `label?` | `string` | Accessible name of the list, e.g. "Research collaborators". |
| `className?` | `string` | Classes merged over the list. |

### `Marquee`

| Prop | Type | Description |
| --- | --- | --- |
| `children` | `ReactNode` | One element per item. Keyed elements keep their key. |
| `label` | `string` | Accessible name for the list, e.g. "Partners". |
| `duration?` | `number` | Seconds per full loop. Scale with item count for a steady speed. |
| `reverse?` | `boolean` | Run left to right instead. |
| `gap?` | `number` | Gap between items in rem. Default 1.25. |
| `className?` | `string` | Classes merged over the clipping root. |
| `itemClassName?` | `string` | Classes for every item's `li`. |

### `CornerHint`

| Prop | Type | Description |
| --- | --- | --- |
| `variant?` | `"media" \| "tonal"` | `media`: a white disc over photos. `tonal`: on the card surface. |
| `icon?` | `"arrow" \| "open"` | What a click does: `arrow` goes somewhere, `open` opens a dialog. |

### `MediaCard`

| Prop | Type | Description |
| --- | --- | --- |
| `fill?` | `boolean` | Fill the parent's height (e.g. a bento cell) instead of using `aspect`. |
| `layout?` | `"overlay" \| "stacked"` | `overlay`: text on a scrim over the image. `stacked`: text below. |
| `aspect?` | `"4/5" \| "3/4" \| "1/1" \| "4/3" \| "16/10" \| "16/9"` | Image frame ratio (ignored with `fill`). |
| `scrim?` | `"strong" \| "default"` | Overlay scrim: `strong` keeps copy legible on bright photos. |
| `descriptionLines?` | `2 \| 3` | Clamp the description to this many lines and, from `md` (grids of two or more columns), reserve their height, so the titles of a row share a baseline however long each description is. |
| `image` | `MediaCardImage` | The photo. |
| `title` | `ReactNode` | The card title; with `href` it is the link's accessible name. |
| `titleId?` | `string` | id of the title heading, e.g. for an `action`'s `aria-labelledby`. |
| `href?` | `string` | Makes the whole card a link (http(s) URLs open in a new tab). |
| `action?` | `ReactNode` | Makes the whole card one control instead of a link: an interactive element, typically a Base UI trigger such as `<DialogTrigger aria-labelledby={titleId} />`, stretched over the card. Name it (e.g. by the title, through `titleId`); the card draws its focus ring. Use it instead of `href`, not with it. |
| `eyebrow?` | `ReactNode` | Small label above the title. |
| `description?` | `ReactNode` | A sentence under the title. |
| `meta?` | `ReactNode` | Small line under the title (date, metric, location). |
| `fallback?` | `ReactNode` | Shown in the image frame when there is no `image.src` or the image fails to load. Default: a `<BrandPanel>`. |
| `cornerHint?` | `ReactNode` | Top-right corner of the image (decorative). Default: a `<CornerHint>` arrow when the card links, a <CornerHint icon="open"> plus when it has an `action`; pass `null` for none, or e.g. a `<Tag>` or an icon. |
| `headingAs?` | `HeadingLevel` | Heading level of the title. Default `h3`. |
| `sizes?` | `string` | next/image `sizes`. |
| `unoptimized?` | `boolean` | For CMS URLs outside next.config image patterns. |
| `priority?` | `boolean` | Load the image with high priority (the LCP image of a page). |
| `className?` | `string` | Classes merged over the `article`. |

### `MotionProvider`

| Prop | Type | Description |
| --- | --- | --- |
| `children` | `ReactNode` | The app (the site layout wraps everything in it). |

### `PageHero`

| Prop | Type | Description |
| --- | --- | --- |
| `size?` | `"md" \| "lg" \| "xl" \| "fit"` | Display step of the headline. `fit` is `md` capped so a single word of about ten em (a German compound such as "Datenschutzerklärung") still fits a phone column: word-by-word titles can't hyphenate. |
| `emphasis?` | `"default" \| "highlight"` | Title colour. `highlight` sets the whole headline in the tone's accent (Electric Lavender on the dark bands), as the brand guide's section slides do; keep `default` when the title marks words with `<Highlight>`. |
| `title` | `ReactNode` | The page's `h1`. |
| `eyebrow?` | `ReactNode` | Small label above the title. |
| `lead?` | `ReactNode` | One or two sentences under the title. |
| `actions?` | `ReactNode` | Buttons and status badges, laid out by `<Actions>`. |
| `media?` | `ReactNode` | Right column (image, card, stats). Stacks under the text on mobile. |
| `children?` | `ReactNode` | Content below the headline block (stats row, filters, tabs, a marquee). |
| `splitTitle?` | `boolean` | Animate the title word by word (`<SplitWords>`). Set false when the title brings its own SplitWords, e.g. one per line with custom delays. |
| `tone?` | `"ink" \| "night"` | Dark band tone. Default `ink`. |
| `mark?` | `boolean` | Large drifting logomark in the background. Default true. |
| `titleId?` | `string` | id of the `h1`, referenced by the section's `aria-labelledby`. |
| `classNames?` | `PageHeroClassNames` | Class overrides for the inner parts. |
| `className?` | `string` | Classes merged over the section (e.g. its top and bottom padding). |

### `Parallax`

| Prop | Type | Description |
| --- | --- | --- |
| `children` | `ReactNode` | The layer that drifts. |
| `offset?` | `number` | Pixels travelled across the element's pass through the viewport. Default 60. |
| `className?` | `string` | Classes for the moving wrapper. |

### `ScrollProgress`

| Prop | Type | Description |
| --- | --- | --- |
| `target` | `RefObject<HTMLElement>` | Element whose scroll pass drives the progress (0 → 1). |
| `className?` | `string` | Classes for the bar (size, position, color). |
| `axis?` | `"x" \| "y"` | Fill direction: `y` grows downwards (default), `x` to the right. |

### `PersonCard`

| Prop | Type | Description |
| --- | --- | --- |
| `name` | `string` | The person's name (also the default `alt`). |
| `byline?` | `ReactNode` | Line under the name: role or affiliation. |
| `image` | `{ src: string; alt?: string \| undefined; position?: string \| undefined; }` | Portrait, cropped to 4:5. `position` is a CSS `object-position` (for example "50% 20%") that keeps the face in frame when the crop cuts it. |
| `children?` | `ReactNode` | A short bio or links under the byline. |
| `headingAs?` | `HeadingLevel` | Heading level of the name. Default `h3`. |
| `sizes?` | `string` | next/image `sizes`. |
| `unoptimized?` | `boolean` | Serve the portrait as is, skipping the image optimizer (CMS URLs outside next.config's image patterns, or artwork that must stay lossless). |
| `className?` | `string` | Classes merged over the `figure`. |

### `Photo`

| Prop | Type | Description |
| --- | --- | --- |
| `src` | `string` | Image path under /public or an allowed remote URL. |
| `alt` | `string` | What the photo shows, for screen readers. Required: photos carry content. Screen readers read it before the caption, so describe what the caption leaves out rather than repeating it. |
| `caption?` | `ReactNode` | A factual caption under the photo: what, where and when. Never a slogan; leave it out rather than guess. |
| `aspect?` | `"3/2" \| "4/3" \| "16/10" \| "4/5" \| "1/1" \| "panorama"` | Aspect ratio of the frame; the photo is cropped to fill it. `panorama` is for wide group shots: 4:3 on phones, 2:1 from `sm` and 24:7 from `lg`. Default `3/2`. |
| `shape?` | `"rounded" \| "bleed"` | `rounded` is the brand's large photo radius; `bleed` has square corners for photos that run to the edge. Default `rounded`. |
| `position?` | `string` | `object-position` of the crop, e.g. "50% 30%" to keep faces in frame. |
| `sizes?` | `string` | Responsive `sizes` for next/image. Default: the full viewport width. |
| `eager?` | `boolean` | Load immediately with high fetch priority, for a photo that is the largest element above the fold. It adds no preload tag. |
| `classNames?` | `{ frame?: string; caption?: string }` | Class overrides for the frame and the caption. |
| `className?` | `string` | Classes merged over the `figure`. |

### `Pill`

| Prop | Type | Description |
| --- | --- | --- |
| `size?` | `"sm" \| "md" \| "lg"` | Size step; `lg` is a statement label ("Mission"). |

### `StatusBadge`

| Prop | Type | Description |
| --- | --- | --- |
| `size?` | `"sm" \| "md" \| "lg"` | Matches Button heights (default `md` like Button) so badges sit flush beside buttons. Always use the size of the neighbouring button. |
| `status?` | `"live" \| "idle" \| "closed"` | `live` pulses (applications open), `idle` is static (upcoming, paused), `closed` is muted with a hollow dot (applications closed). |
| `children` | `ReactNode` | The status line, e.g. "Applications open until 26.09.2026". |

### `Tag`

No props of its own; see the source file for the root element or Base UI part it forwards to.

### `QuoteCard`

| Prop | Type | Description |
| --- | --- | --- |
| `variant?` | `"raised" \| "glass" \| "editorial" \| "ruled"` | `raised` for light bands; `glass` is the frosted panel for dark bands; `editorial` drops the card and sets the quote as a large light statement, for one quote that carries a section; `ruled` drops the card for a hairline rule above the quote, for lists of quotes set editorially on any band. |
| `quote` | `ReactNode` | The quotation, without quote marks. |
| `name` | `string` | Who said it. |
| `byline?` | `ReactNode` | Line under the name: role and affiliation. (Not `role`, which stays the figure's ARIA role.) |
| `portrait?` | `QuoteImage` | Round portrait before the name. |
| `logo?` | `(QuoteImage & { alt: string; })` | Organization logo at the end of the person row. |
| `context?` | `ReactNode` | Short context beside the quote mark (e.g. a `<Tag>` with the cohort). |
| `footer?` | `ReactNode` | Row under the person (e.g. the organization on a logo chip). |
| `eager?` | `boolean` | Load the images eagerly, e.g. inside a moving marquee. |

### `IndexList`

| Prop | Type | Description |
| --- | --- | --- |
| `items` | `IndexListItem[]` | The destinations, in reading order. |
| `headingAs?` | `HeadingLevel` | Heading level of each title. Default `h3`. |
| `className?` | `string` | Classes merged over the wrapper. |

### `KeyDates`

| Prop | Type | Description |
| --- | --- | --- |
| `items` | `KeyDateItem[]` | The dates, in calendar order: `id`, `label`, `date` (as shown), optional `dateTime` (ISO, for `<time>`), `detail`, `state` (`past` \| `next` \| `upcoming`, default `upcoming`) and `note` (shown beside the `next` date). |
| `size?` | `"md" \| "lg"` | `md` beside a headline; `lg` when the dates are the band's content. Default `md`. |
| `drawIn?` | `boolean` | Draw the strikes through past dates once on load, in order. For a register above the fold. |
| `className?` | `string` | Classes merged over the `dl`. |

### `DayRuler`

| Prop | Type | Description |
| --- | --- | --- |
| `days` | `number` | Days the ruler spans: it draws `days + 1` ticks, one per midnight. |
| `elapsed` | `number` | Whole days gone, `0..days`: the fill runs to this tick and the mark sits on it (clamped). |
| `startLabel?` | `ReactNode` | Label under the first tick. |
| `endLabel?` | `ReactNode` | Label under the last tick. |
| `size?` | `"md" \| "lg"` | Tick heights: `md` under a register, `lg` when the ruler carries a band. Default `md`. |
| `markLabel?` | `ReactNode` | Label over today's mark (e.g. "Today", "26 days left"): centred on the mark, flush with the ruler's end near either edge. |
| `drawIn?` | `boolean` | Draw the fill once on load, for a ruler above the fold. |
| `className?` | `string` | Classes merged over the root (`aria-hidden`). |

### `Ledger`

| Prop | Type | Description |
| --- | --- | --- |
| `size?` | `"md" \| "lg"` | Figure size: `md` (the stat-md step) for a ledger beside a headline, `lg` (stat-lg) when the ledger is the section's main content. |
| `items` | `LedgerItem[]` | The rows, in reading order. |
| `className?` | `string` | Classes merged over the `dl`. |

### `QuoteMark`

No props of its own; see the source file for the root element or Base UI part it forwards to.

### `Reveal`

| Prop | Type | Description |
| --- | --- | --- |
| `variant?` | `RevealVariant` | Entrance motion. Default `up`. |
| `delay?` | `number` | Delay in ms; use `index * 80` for staggered lists. |
| `as?` | `T` | Root element to render. |

### `Section`

| Prop | Type | Description |
| --- | --- | --- |
| `spacing?` | `"sm" \| "md" \| "lg" \| "none" \| "xl"` | Vertical padding step. `none` for heroes that set their own. |
| `tone?` | `Tone` | Surface band. Sets the semantic color tokens for everything inside. |
| `grain?` | `boolean` | Film grain overlay; use on dark bands only. |
| `as?` | `T` | Root element to render. |

### `SectionHeader`

| Prop | Type | Description |
| --- | --- | --- |
| `layout?` | `"center" \| "split" \| "stack"` | `split`: title left, lead bottom-right (partner page rhythm). `stack`: lead under the title. `center`: centered stack. |
| `size?` | `"md" \| "lg" \| "xl"` | Display step of the title: `md` for sections, `lg` for key sections, `xl` for a page's lead statement. |
| `title` | `ReactNode` | The section's headline. |
| `count?` | `number` | A count set small and top-aligned after the title, in parentheses: `count={4}` renders "Upcoming Events (4)". |
| `id?` | `string` | id for the heading, referenced by the section's `aria-labelledby`. |
| `eyebrow?` | `ReactNode` | Small label above the title. |
| `index?` | `string \| number` | Editorial counter in the eyebrow, e.g. 1 → "01". |
| `lead?` | `ReactNode` | One or two sentences that frame the section. |
| `actions?` | `ReactNode` | Buttons and status badges, laid out by `<Actions>`. |
| `headingAs?` | `HeadingLevel` | Heading level of the title. Default `h2`. |
| `classNames?` | `SectionHeaderClassNames` | Class overrides for the inner parts. |
| `className?` | `string` | Classes merged over the `header` element. |

### `SplitWords`

| Prop | Type | Description |
| --- | --- | --- |
| `children` | `ReactNode` | The headline: text, and elements (e.g. `<Highlight>`) that move as one word. |
| `delay?` | `number` | Delay before the first word, in ms. |
| `step?` | `number` | Delay between words, in ms. |
| `className?` | `string` | Classes for the wrapping span. |

### `SpotlightCard`

| Prop | Type | Description |
| --- | --- | --- |
| `variant?` | `"outline" \| "raised" \| "glass" \| "plain"` | Surface treatment. |
| `padding?` | `"sm" \| "md" \| "lg" \| "none"` | Inner padding step. |
| `interactive?` | `boolean` | A 4px lift and a stronger shadow on hover (still under reduced motion). |

### `StatGrid`

| Prop | Type | Description |
| --- | --- | --- |
| `columns?` | `2 \| 4 \| 3` | Columns on wide screens. |
| `size?` | `"sm" \| "md" \| "lg" \| "xl"` | Figure size, from the `text-stat-*` tokens. |
| `items` | `StatItem[]` | The figures, in reading order. |
| `className?` | `string` | Classes merged over the `dl`. |

### `Steps`

| Prop | Type | Description |
| --- | --- | --- |
| `columns?` | `4 \| 3 \| 5` | Columns on wide screens. |
| `marker?` | `"badge" \| "dot"` |  |
| `rail?` | `"none" \| "solid" \| "dashed"` | The line that joins the markers on wide screens: `solid` hairline, `dashed` violet dashes (a path that runs on), or `none`. |
| `items` | `StepItem[]` | The steps, in order: `title`, optional `description`, `detail` (a short line under the title, such as the step's dates), `icon`, `number` and `id`. |
| `layout?` | `"columns" \| "rows"` | `columns` (default): markers on a rail, one column per step on wide screens. `rows`: one hairline row per step with the number beside it, for steps that are sentences rather than short labels. `rows` ignores `columns`, `rail`, `marker` and icons. |
| `headingAs?` | `HeadingLevel` | Heading level of each step title. Default `h3`. |
| `className?` | `string` | Classes merged over the wrapper. |

### `TabsList`

| Prop | Type | Description |
| --- | --- | --- |
| `className?` | `string` | Classes merged over the segmented control. |

### `TabsPanel`

| Prop | Type | Description |
| --- | --- | --- |
| `className?` | `string` | Classes merged over the panel. |

### `Tabs`

| Prop | Type | Description |
| --- | --- | --- |
| `className?` | `string` | Classes for the root element. |

### `TabsTab`

| Prop | Type | Description |
| --- | --- | --- |
| `className?` | `string` | Classes merged over the tab button. |

### `TextLink`

| Prop | Type | Description |
| --- | --- | --- |
| `children` | `ReactNode` | The visible label. |
| `emphasis?` | `"accent" \| "muted"` | `accent` for links in copy, `muted` for dense lists (footer, meta rows). |
| `href` | `string` | Route, in-page anchor, http(s), mailto: or tel: URL. |
| `arrow?` | `boolean` | Trailing arrow (up and out for external links). |
| `external?` | `boolean` | Force new-tab behavior; defaults to true for http(s) URLs. |

### `Timeline`

| Prop | Type | Description |
| --- | --- | --- |
| `items` | `TimelineItem[]` | The entries, in order. |
| `alternate?` | `boolean` | Zig-zag the entries left and right of a centered rail on wide screens. |
| `rail?` | `TimelineRail` | Rail style. Default `progress`. |
| `marker?` | `TimelineMarker` | Marker style. Default `dot`. |
| `continuation?` | `ReactNode` | Closing line after the last entry (e.g. "Your journey continues..."), reached by a dashed rail that fades out. |
| `headingAs?` | `HeadingLevel` | Heading level of each entry title. Default `h3`. |
| `className?` | `string` | Classes merged over the wrapper. |

### `TopBlend`

| Prop | Type | Description |
| --- | --- | --- |
| `edge?` | `"top" \| "bottom"` | Which edge of the band blends into the root canvas. |
| `className?` | `string` | Classes merged over the gradient layer. |

### `Display`

| Prop | Type | Description |
| --- | --- | --- |
| `size?` | `"md" \| "lg" \| "xl" \| "2xl"` | Display step from the type scale (`text-display-*`). |
| `as?` | `T` | Root element to render. |

### `Eyebrow`

| Prop | Type | Description |
| --- | --- | --- |
| `index?` | `string \| number` | Editorial counter before the label: 1 renders "01", a string as is. |
| `children` | `ReactNode` | The label. |
| `as?` | `T` | Root element to render. |

### `Heading`

| Prop | Type | Description |
| --- | --- | --- |
| `size?` | `"sm" \| "md" \| "lg"` | Heading step from the type scale (`text-heading-*`). |
| `as?` | `T` | Root element to render. |

### `Highlight`

| Prop | Type | Description |
| --- | --- | --- |
| `variant?` | `"fade" \| "accent"` | `accent`: the tone's accessible accent color. `fade`: Electric Fade gradient. |

### `Prose`

No props of its own; see the source file for the root element or Base UI part it forwards to.

### `Text`

| Prop | Type | Description |
| --- | --- | --- |
| `size?` | `"body" \| "meta" \| "small" \| "lead"` | Body step from the type scale. |
| `emphasis?` | `"subtle" \| "default" \| "muted"` | Text color within the band's tone. |
| `as?` | `T` | Root element to render. |

