/**
 * TUM.ai design system. Usage, tokens and rules: docs/design-system.md.
 * Interactive primitives are built on Base UI (@base-ui/react); styling is
 * Tailwind against the tone tokens in src/styles/index.css. Import from this
 * barrel only; the files behind it are private.
 *
 * API conventions (every component follows them; new ones must too):
 * - Variant props are cva variants, documented on the cva config. A variant
 *   that swaps the markup rather than classes may branch in JSX instead.
 * - `as` is the root element (Section, Card, Container, Reveal, typography).
 *   `headingAs` is the level of a component's title (`h2`/`h3`/`h4`); the
 *   page hero owns the `h1`.
 * - `tone` only ever means a band tone (`data-tone`: paper, mist, lavender,
 *   ink, night, violet). A text color within a tone is `emphasis`.
 * - Props extend `ComponentProps<…>` of the root element, so `ref` is a
 *   plain prop (React 19); every component exports its `XProps` type.
 * - Styling hooks: `className` targets the root; components with several
 *   parts take a `classNames` object of per-part overrides.
 * - Every export and prop has TSDoc. Deprecated aliases say what replaces
 *   them and are removed in W3.
 * - "use client" only where the component itself uses state, effects or
 *   event handlers; Base UI parts are client components already.
 * - Motion: house easing (`ease-brand`), at most 1.2s outside ambient loops,
 *   and nothing moves under `prefers-reduced-motion` (use `motion-safe:` or
 *   `motion-reduce:`).
 * - Links: http(s) opens a new tab with `rel="noopener noreferrer"` and a
 *   screen-reader hint; routes use next/link. Images use next/image.
 */

export {
  Accordion,
  AccordionItem,
  type AccordionItemProps,
  AccordionPanel,
  type AccordionPanelProps,
  type AccordionProps,
  AccordionTrigger,
  type AccordionTriggerProps,
  type FaqItem,
  FaqList,
  type FaqListProps,
} from "./accordion";
export { Actions, type ActionsProps } from "./actions";
export { Aurora, type AuroraProps } from "./aurora";
export { BrandMark, type BrandMarkProps } from "./brand-mark";
export { BrandPanel, type BrandPanelProps } from "./brand-panel";
export {
  Button,
  type ButtonArrowKind,
  ButtonLink,
  type ButtonLinkProps,
  type ButtonProps,
  type ButtonStyleProps,
  buttonStyles,
  IconButton,
  type IconButtonProps,
} from "./button";
export { Card, type CardProps, type CardStyleProps, cardStyles } from "./card";
export {
  Carousel,
  type CarouselClassNames,
  type CarouselProps,
  type CarouselVariant,
} from "./carousel";
export { ChipGroup, type ChipGroupProps, type ChipOption } from "./chip-group";
export {
  Collapsible,
  CollapsiblePanel,
  type CollapsiblePanelProps,
  type CollapsibleProps,
  CollapsibleTrigger,
  type CollapsibleTriggerProps,
} from "./collapsible";
export { Container, type ContainerProps } from "./container";
export { CountUp, type CountUpProps } from "./count-up";
export {
  CtaBand,
  type CtaBandClassNames,
  type CtaBandProps,
} from "./cta-band";
export {
  Dialog,
  DialogClose,
  DialogContent,
  type DialogContentProps,
  DialogDescription,
  type DialogDescriptionProps,
  type DialogProps,
  DialogTitle,
  type DialogTitleProps,
  DialogTrigger,
  useInertBackground,
} from "./dialog";
export { EmptyState, type EmptyStateProps } from "./empty-state";
export { FallbackImage, type FallbackImageProps } from "./fallback-image";
export { FaqSection, type FaqSectionProps } from "./faq-section";
export { FeatureCard, type FeatureCardProps } from "./feature-card";
export { formatFigure, type ParsedFigure, parseFigure } from "./figure";
export { IconBadge, type IconBadgeProps } from "./icon-badge";
export {
  type LogoItem,
  LogoTile,
  type LogoTileProps,
  LogoWall,
  type LogoWallProps,
} from "./logo-wall";
export { Marquee, type MarqueeProps } from "./marquee";
export {
  MediaCard,
  type MediaCardImage,
  type MediaCardProps,
} from "./media-card";
export { MotionProvider, type MotionProviderProps } from "./motion-provider";
export {
  PageHero,
  type PageHeroClassNames,
  type PageHeroProps,
} from "./page-hero";
export {
  Parallax,
  type ParallaxProps,
  ScrollProgress,
  type ScrollProgressProps,
} from "./parallax";
export { PersonCard, type PersonCardProps } from "./person-card";
export {
  type BadgeStatus,
  Pill,
  type PillProps,
  StatusBadge,
  type StatusBadgeProps,
  Tag,
  type TagProps,
} from "./pill";
export {
  QuoteCard,
  type QuoteCardProps,
  type QuoteImage,
  QuoteMark,
  type QuoteMarkProps,
} from "./quote-card";
export { Reveal, type RevealProps, type RevealVariant } from "./reveal";
export { Section, type SectionProps, type Tone } from "./section";
export {
  SectionHeader,
  type SectionHeaderClassNames,
  type SectionHeaderProps,
} from "./section-header";
export { SplitWords, type SplitWordsProps } from "./split-words";
export { SpotlightCard, type SpotlightCardProps } from "./spotlight-card";
export { StatGrid, type StatGridProps, type StatItem } from "./stat";
export { type StepItem, Steps, type StepsProps } from "./steps";
export {
  Tabs,
  TabsList,
  type TabsListProps,
  TabsPanel,
  type TabsPanelProps,
  type TabsProps,
  TabsTab,
  type TabsTabProps,
} from "./tabs";
export {
  TextLink,
  type TextLinkEmphasis,
  type TextLinkProps,
} from "./text-link";
export {
  Timeline,
  type TimelineItem,
  type TimelineMarker,
  type TimelineProps,
  type TimelineRail,
} from "./timeline";
export { TopBlend, type TopBlendProps } from "./top-blend";
export type {
  BlockElement,
  HeadingLevel,
  PolymorphicProps,
  TextElement,
} from "./types";
export {
  Display,
  type DisplayProps,
  Eyebrow,
  type EyebrowProps,
  Heading,
  type HeadingProps,
  Highlight,
  type HighlightProps,
  Prose,
  type ProseProps,
  Text,
  type TextEmphasis,
  type TextProps,
} from "./typography";
