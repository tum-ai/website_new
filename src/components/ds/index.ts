/**
 * TUM.ai design system. Usage, tokens and rules: docs/design-system.md.
 * Interactive primitives are built on Base UI (@base-ui/react); styling is
 * Tailwind against the tone tokens in src/styles/index.css.
 */

export {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  type FaqItem,
  FaqList,
} from "./accordion";
export { Aurora } from "./aurora";
export { BrandMark } from "./brand-mark";
export { Button, ButtonLink, buttonStyles, IconButton } from "./button";
export { Card, cardStyles } from "./card";
export { Carousel } from "./carousel";
export { ChipGroup, type ChipOption } from "./chip-group";
export {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "./collapsible";
export { Container } from "./container";
export { CountUp } from "./count-up";
export { CtaBand } from "./cta-band";
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  useInertBackground,
} from "./dialog";
export { EmptyState } from "./empty-state";
export { FaqSection } from "./faq-section";
export { FeatureCard } from "./feature-card";
export { type LogoItem, LogoTile, LogoWall } from "./logo-wall";
export { Marquee } from "./marquee";
export { MediaCard } from "./media-card";
export { PageHero } from "./page-hero";
export { Parallax, ScrollProgress } from "./parallax";
export { PersonCard } from "./person-card";
export { Pill, StatusBadge, Tag } from "./pill";
export { QuoteCard } from "./quote-card";
export { Reveal, type RevealVariant } from "./reveal";
export { Section, type Tone } from "./section";
export { SectionHeader } from "./section-header";
export { SplitWords } from "./split-words";
export { SpotlightCard } from "./spotlight-card";
export { StatGrid, type StatItem } from "./stat";
export { type StepItem, Steps } from "./steps";
export { Tabs, TabsList, TabsPanel, TabsTab } from "./tabs";
export { TextLink } from "./text-link";
export { Timeline, type TimelineItem } from "./timeline";
export { TopBlend } from "./top-blend";
export {
  Display,
  Eyebrow,
  Heading,
  Highlight,
  Prose,
  Text,
} from "./typography";
