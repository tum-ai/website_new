import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  Actions,
  Anchor,
  Aurora,
  BrandMark,
  BrandPanel,
  BulletList,
  ButtonLink,
  buttonStyles,
  Container,
  CountUp,
  CtaBand,
  DayRuler,
  Display,
  EmptyState,
  Eyebrow,
  FallbackImage,
  FaqList,
  FaqSection,
  formatFigure,
  Heading,
  Highlight,
  IconBadge,
  IndexList,
  KeyDates,
  Ledger,
  LogoTile,
  LogoWall,
  PageHero,
  PersonCard,
  Photo,
  Pill,
  Prose,
  parseFigure,
  QuoteCard,
  QuoteMark,
  Reveal,
  type RevealVariant,
  Section,
  SectionHeader,
  SplitWords,
  SpotlightCard,
  StatGrid,
  StatusBadge,
  Steps,
  Tag,
  Text,
  TextLink,
  type Tone,
  TopBlend,
} from "@tum.ai/ui-kit";
import { Brain, Handshake, Inbox, Rocket, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { DesignSystemInteractive } from "./design-system-interactive";

/*
 * Every runtime export of @tum.ai/ui-kit appears on this page at least once, and
 * every variant a component offers is shown side by side. `MotionProvider`
 * has no visuals: the site layout renders it.
 */

const tones: { tone: Tone; name: string; hex: string }[] = [
  { tone: "paper", name: "Paper", hex: "#FFFFFF" },
  { tone: "mist", name: "Mist · Minimal Grey", hex: "#EFEFEF" },
  { tone: "lavender", name: "Lavender Tint", hex: "#F5EFFF" },
  { tone: "violet", name: "Electric Lavender", hex: "#9A64D9" },
  { tone: "ink", name: "Dark Indigo", hex: "#1B0049" },
  { tone: "night", name: "Black", hex: "#0D0214" },
];

// Standalone component examples, independent of published CMS facts and copy.
const demoPhoto = "/assets/fixtures/photo.svg";
const demoLogo = "/assets/fixtures/logo.svg";
const demoExternalUrl = "https://example.com";
const logos = [
  { name: "Example studio", src: demoLogo },
  { name: "Example lab", src: demoLogo },
  { name: "Example team", src: demoLogo },
  { name: "Example group", src: demoLogo },
  { name: "Example collective", src: demoLogo },
  { name: "Example workshop", src: demoLogo },
  { name: "Text-only example" },
];
const faqs = [
  {
    question: "How does this accordion open?",
    answer: "Activate a question with a pointer, Enter or Space.",
  },
  {
    question: "Can an answer contain several lines?",
    answer:
      "The panel grows with its content while the question remains visible.",
  },
  {
    question: "Can a question have an anchor?",
    answer: "An item id lets a link open the matching answer.",
  },
  {
    question: "How does the section heading behave?",
    answer: "The heading stays beside the questions on wide screens.",
  },
  {
    question: "How are the examples styled?",
    answer: "Each component inherits the surrounding tone tokens.",
  },
  {
    question: "Can the first answer start open?",
    answer: "Pass the question as the default accordion value.",
  },
];

const revealVariants: RevealVariant[] = [
  "up",
  "fade",
  "scale",
  "left",
  "right",
];

const figures = ["1.2M+", "18k+", "3.8%", "~500", "1,250+", "24/7"];

/** CountUp's first frame for a figure, or a note when it stays as text. */
function startFrame(figure: string) {
  const parsed = parseFigure(figure);
  return parsed ? `starts at ${formatFigure(0, parsed)}` : "shown as text";
}

function Block({
  id,
  title,
  tone = "paper",
  lead,
  children,
}: {
  id: string;
  title: string;
  tone?: Tone;
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Section tone={tone} spacing="md" aria-labelledby={id}>
      <Container>
        <SectionHeader id={id} eyebrow="Component" title={title} lead={lead} />
        {children}
      </Container>
    </Section>
  );
}

/** Small caption above a demo. */
function Label({ children }: { children: ReactNode }) {
  return <p className="mb-4 text-eyebrow text-fg-subtle">{children}</p>;
}

export function DesignSystemPage() {
  return (
    <main>
      <PageHero
        titleId="ds-hero-title"
        eyebrow="Living reference"
        title="Precise, calm, alive."
        emphasis="highlight"
        lead="Every component on this page is the one used on the site. Tones, type, motion and interaction come from @tum.ai/ui-kit 0.2.0."
        actions={
          <>
            <ButtonLink href="#tones" arrow>
              Primary action
            </ButtonLink>
            <ButtonLink href="#buttons" variant="inverse">
              Inverse
            </ButtonLink>
            <ButtonLink href="#cards" variant="outline" arrow="down">
              Outline
            </ButtonLink>
          </>
        }
        media={
          <figure className="group/zoom relative isolate min-h-72 overflow-hidden rounded-signature bg-sunken">
            <FallbackImage
              src={demoPhoto}
              alt="Geometric illustration used to demonstrate a media frame"
              fill
              preload
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="zoom-media object-cover"
              fallback={<BrandPanel />}
            />
            <figcaption className="absolute inset-x-6 bottom-6 z-[1] font-medium text-white">
              PageHero `media` slot, `classNames.grid` override
            </figcaption>
          </figure>
        }
        classNames={{ grid: "lg:items-stretch" }}
      >
        <Actions>
          <StatusBadge>Example open state</StatusBadge>
          <StatusBadge status="idle">Example idle state</StatusBadge>
          <StatusBadge status="closed">Applications closed</StatusBadge>
        </Actions>
      </PageHero>

      <Section spacing="md" id="tones" aria-labelledby="tones-title">
        <Container>
          <SectionHeader
            id="tones-title"
            eyebrow="Foundations"
            index={1}
            title="Tones"
            lead="Bands set semantic tokens (canvas, fg, fg-muted, hairline, highlight) so components adapt automatically."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tones.map(({ tone, name, hex }, index) => (
              <Reveal key={tone} delay={index * 70}>
                <div
                  data-tone={tone}
                  className="flex h-44 flex-col justify-between rounded-3xl border border-hairline p-6"
                >
                  <p className="text-fg text-heading-md">{name}</p>
                  <div>
                    <p className="text-fg-muted text-small">Muted body text</p>
                    <p className="text-highlight text-meta">
                      {hex} · highlight
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="mist" spacing="md" aria-labelledby="type-title">
        <Container>
          <SectionHeader
            id="type-title"
            eyebrow="Foundations"
            index={2}
            title="Typography"
            layout="stack"
          />
          <div className="space-y-6">
            <Display as="p" size="2xl">
              Display 2xl
            </Display>
            <Display as="p" size="xl">
              Display xl
            </Display>
            <Display as="p">Display lg</Display>
            <Display as="p" size="md">
              Display md
            </Display>
            <Heading as="p" size="lg">
              Heading lg
            </Heading>
            <Heading as="p">Heading md</Heading>
            <Heading as="p" size="sm">
              Heading sm
            </Heading>
            <Text size="lead">
              Lead: a larger opening paragraph introduces a section and gives
              the reader a clear starting point.
            </Text>
            <Text className="max-w-2xl">
              Body (muted): longer paragraphs use a comfortable reading size and
              the surrounding tone’s muted foreground.
            </Text>
            <Text size="small" emphasis="default">
              Small, default emphasis.
            </Text>
            <Text size="meta" emphasis="subtle">
              Meta, subtle emphasis.
            </Text>
            <p className="text-fg text-label">Label (15px UI text)</p>
            <p className="text-fg text-label-sm">
              Label sm (13px: sm buttons and badges, logo chips)
            </p>
            <Display as="p" size="md">
              Accent <Highlight>highlight</Highlight> and{" "}
              <Highlight variant="fade">Electric Fade</Highlight>
            </Display>
            <Display as="p" size="md">
              <SplitWords>SplitWords rises word by word</SplitWords>
            </Display>
            <div className="flex flex-wrap items-center gap-3">
              <Pill size="sm">Small</Pill>
              <Pill>Mission</Pill>
              <Pill size="lg">Vision</Pill>
              <Tag>Robotics</Tag>
              <Tag>NLP</Tag>
              <Eyebrow>Eyebrow</Eyebrow>
              <Eyebrow index={4}>With counter</Eyebrow>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <TextLink href="/events" arrow>
                Accent text link
              </TextLink>
              <TextLink href="/research" emphasis="muted">
                Muted text link
              </TextLink>
              <TextLink href={demoExternalUrl} arrow>
                External text link
              </TextLink>
              <Anchor
                href={demoExternalUrl}
                className="text-fg text-small underline underline-offset-4"
              >
                Anchor: unstyled, route-aware
              </Anchor>
            </div>
            <SectionHeader
              headingAs="h3"
              layout="stack"
              title="SectionHeader with a count"
              count={4}
              className="mb-0 md:mb-0"
            />
            <SectionHeader
              headingAs="h3"
              layout="stack"
              size="xl"
              title="SectionHeader xl"
              className="mb-0 md:mb-0"
            />
            <BulletList
              className="max-w-2xl"
              items={[
                "BulletList: raised rows with an accent dot.",
                "For the options an answer introduces.",
              ]}
            />
            <Prose className="max-w-2xl">
              <h3>Prose</h3>
              <p>
                Long-form content such as the legal pages. Links like{" "}
                <a href="#type-title">this one</a> use the tone accent.
              </p>
              <ul>
                <li>Lists get violet markers.</li>
                <li>
                  <strong>Strong</strong> text uses the full foreground.
                </li>
              </ul>
            </Prose>
          </div>
        </Container>
      </Section>

      <Section
        tone="ink"
        spacing="md"
        grain
        id="buttons"
        aria-labelledby="buttons-title"
      >
        <Aurora intensity="subtle" />
        <BrandMark
          intensity="subtle"
          className="absolute -right-[12%] -bottom-[40%] -z-10 w-[min(50rem,80%)]"
        />
        <Container>
          <SectionHeader
            id="buttons-title"
            eyebrow="Actions"
            index={3}
            title="Buttons on dark"
            lead="Aurora (subtle), grain and a BrandMark (intensity subtle) behind; Actions lays out the rows."
          />
          <Actions>
            <ButtonLink href="#buttons" arrow>
              Primary
            </ButtonLink>
            <ButtonLink href="#buttons" variant="inverse">
              Inverse
            </ButtonLink>
            <ButtonLink href="#buttons" variant="secondary">
              Secondary
            </ButtonLink>
            <ButtonLink href="#buttons" variant="outline">
              Outline
            </ButtonLink>
            <ButtonLink href="#buttons" variant="ghost">
              Ghost
            </ButtonLink>
            <ButtonLink href="#buttons" variant="link" arrow>
              Link
            </ButtonLink>
            <ButtonLink href={demoExternalUrl} arrow="external">
              External
            </ButtonLink>
          </Actions>
          <Actions className="mt-6">
            <ButtonLink href="#buttons" size="sm">
              Small
            </ButtonLink>
            <StatusBadge size="sm">Badge beside small</StatusBadge>
            <ButtonLink href="#buttons" size="lg" arrow>
              Large
            </ButtonLink>
            <StatusBadge size="lg" status="closed">
              Badge beside large
            </StatusBadge>
            <span className={buttonStyles({ variant: "outline" })}>
              buttonStyles on a span
            </span>
          </Actions>
        </Container>
      </Section>

      <Block id="cards" title="Cards">
        <div className="grid gap-4 md:grid-cols-3">
          <SpotlightCard>
            <Label>SpotlightCard · raised</Label>
            <Heading>Light follows the pointer</Heading>
          </SpotlightCard>
          <SpotlightCard variant="outline" interactive>
            <Label>SpotlightCard · outline, interactive</Label>
            <Heading>Lifts on hover</Heading>
          </SpotlightCard>
          <SpotlightCard variant="glass" padding="sm">
            <Label>SpotlightCard · glass, padding sm</Label>
            <Heading>Frosted panel</Heading>
          </SpotlightCard>
        </div>
        <div className="mt-10">
          <Label>
            IconBadge · tint, soft, outline · sm, md, lg · square, circle
          </Label>
          <div className="flex flex-wrap items-center gap-4">
            <IconBadge icon={Sparkles} size="sm" />
            <IconBadge icon={Sparkles} />
            <IconBadge icon={Sparkles} size="lg" />
            <IconBadge icon={Inbox} variant="soft" shape="circle" size="lg" />
            <IconBadge icon={Brain} variant="outline" shape="circle" />
            <a
              href="#cards"
              className="inline-flex items-center gap-3 font-semibold text-fg text-small"
            >
              <IconBadge icon={Rocket} size="sm" interactive />
              Interactive: tilts while the link is hovered
            </a>
          </div>
        </div>
        <div className="mt-12 grid items-start gap-6 md:grid-cols-3">
          <Label>Photo · rounded 3/2, 4/5, 4/3, 1/1, bleed 16/10</Label>
          <Photo
            className="md:col-start-1"
            src={demoPhoto}
            alt="Geometric illustration in the default photo frame"
            caption="Caption: what, where and when"
            sizes="(min-width: 768px) 30vw, 100vw"
          />
          <Photo
            aspect="4/5"
            src={demoPhoto}
            alt="Geometric illustration in a portrait frame"
            caption="aspect 4/5, position 50% 60%"
            position="50% 60%"
            sizes="(min-width: 768px) 30vw, 100vw"
          />
          <Photo
            shape="bleed"
            aspect="16/10"
            src={demoPhoto}
            alt="Geometric illustration in a wide frame"
            sizes="(min-width: 768px) 30vw, 100vw"
          />
          <Photo
            aspect="4/3"
            src={demoPhoto}
            alt="Geometric illustration in a four-by-three frame"
            sizes="(min-width: 768px) 30vw, 100vw"
          />
          <Photo
            aspect="1/1"
            src={demoPhoto}
            alt="Geometric illustration in a square frame"
            sizes="(min-width: 768px) 30vw, 100vw"
          />
        </div>
        <div className="mt-6">
          <Label>Photo · panorama (4/3, 2/1 from sm, 24/7 from lg)</Label>
          <Photo
            aspect="panorama"
            src={demoPhoto}
            alt="Geometric illustration in a panoramic frame"
            caption="aspect panorama, position 50% 45%"
            position="50% 45%"
          />
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <QuoteCard
            quote="A short example quote shows the default card and its attribution."
            name="Example speaker"
            byline="Role at an example studio"
            logo={{
              src: demoLogo,
              alt: "Example logo",
            }}
          />
          <QuoteCard
            variant="ruled"
            quote="Ruled: a list of quotes under hairlines, without a card."
            name="Example contributor"
            byline="Role at an example team"
            portrait={{ src: demoPhoto }}
          />
          <PersonCard
            name="Example participant"
            byline="Example role · unoptimized, object position"
            image={{
              src: demoPhoto,
              position: "50% 20%",
            }}
            unoptimized
          />
          <div className="grid gap-4">
            <Label>BrandPanel · three compositions</Label>
            {[0, 1, 2].map((seed) => (
              <div
                key={seed}
                className="group/zoom relative h-24 overflow-hidden rounded-2xl"
              >
                <BrandPanel seed={seed} />
              </div>
            ))}
          </div>
        </div>
      </Block>

      <Section
        tone="ink"
        spacing="md"
        grain
        className="overflow-clip"
        aria-labelledby="glass-title"
      >
        <BrandMark
          variant="gradient"
          className="absolute -right-[10%] -bottom-[30%] -z-10 w-[min(40rem,70%)] opacity-20"
        />
        <Container>
          <SectionHeader
            id="glass-title"
            eyebrow="On dark"
            title="Glass quotes and logo chips"
            lead="BrandMark (gradient variant) in the corner; fixed-width chips and bare logos for dark bands."
          />
          <div className="grid gap-6 md:grid-cols-2">
            <QuoteCard
              variant="glass"
              quote="The glass variant brings a quote and its portrait onto a dark band."
              name="Example participant"
              byline="Example role"
              portrait={{ src: demoPhoto }}
              context={<Tag>Example context</Tag>}
              footer={
                <div className="mt-6 flex items-center gap-3 border-hairline border-t pt-5">
                  <LogoTile
                    variant="chip"
                    name="TUM.ai"
                    src="/assets/favicon.svg"
                    wordmark="TUM.ai"
                  />
                  <span className="font-medium text-fg-subtle text-meta">
                    Alumni
                  </span>
                </div>
              }
            />
            <div className="flex flex-col justify-center gap-6">
              <QuoteMark className="h-12 w-16" />
              <div className="flex flex-wrap gap-3">
                <LogoTile
                  variant="chip"
                  fixed
                  name="Example studio"
                  src={demoLogo}
                />
                <LogoTile
                  variant="chip"
                  name="Example lab"
                  src={demoLogo}
                  href={demoExternalUrl}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <LogoTile
                  variant="bare"
                  name="Bare: the name on a dark band"
                  className="h-12"
                />
                <LogoTile
                  variant="bare"
                  name="TUM.ai"
                  src="/assets/favicon.svg"
                  wordmark="TUM.ai"
                  className="h-12"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="violet" spacing="md" aria-labelledby="stats-title">
        <Container>
          <h2 id="stats-title" className="sr-only">
            Stats
          </h2>
          <StatGrid
            items={[
              {
                value: 320,
                suffix: "+",
                label: "Example count",
              },
              {
                value: String(2024),
                label: "Example year",
              },
              {
                value: 12,
                suffix: "+",
                label: "Example categories",
              },
              {
                value: 1.5,
                prefix: "€",
                suffix: "M",
                label: "Example amount",
              },
            ]}
          />
        </Container>
      </Section>

      <Block
        id="figures"
        title="Figures"
        lead="StatGrid sizes (sm to xl), the Ledger (md and lg) and CountUp parsing copy figures."
      >
        <div className="grid gap-6">
          <StatGrid
            size="sm"
            columns={3}
            items={[
              { value: "1.2M+", count: true, label: "Reach (sm, counted)" },
              { value: "3.8%", count: true, label: "Conversion" },
              { value: "24/7", label: "Not a single number" },
            ]}
          />
          <StatGrid
            size="xl"
            columns={2}
            items={[
              { value: "1,250+", count: true, label: "Example total (xl)" },
              { value: 40, suffix: "+", label: "Example categories" },
            ]}
          />
          <div className="grid gap-10 lg:grid-cols-2">
            <Ledger
              items={[
                {
                  label: "Example year",
                  value: String(2024),
                  note: "Ledger md: a string figure",
                },
                {
                  label: "Example categories",
                  value: 12,
                  suffix: "+",
                  note: "Counted up on scroll",
                },
              ]}
            />
            <Ledger
              size="lg"
              items={[
                {
                  label: "Example amount",
                  value: 1.5,
                  prefix: "€",
                  suffix: "M",
                  note: "Ledger lg",
                },
                { label: "Without a note", value: "48h" },
              ]}
            />
          </div>
          <dl className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {figures.map((figure) => (
              <div key={figure} className="rounded-2xl bg-sunken p-4">
                <dt className="text-fg text-stat-sm">
                  <CountUp value={figure} />
                </dt>
                <dd className="mt-2 text-fg-subtle text-meta">
                  {startFrame(figure)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Block>

      <Block
        id="index"
        title="Index and editorial quote"
        lead="IndexList: hover or focus a row to swap the preview (from lg). QuoteCard editorial: one quote that carries a section."
      >
        <div className="grid gap-16">
          <IndexList
            items={[
              {
                id: "research",
                title: "Research",
                description: "Projects with universities and labs.",
                href: "/research",
                image: { src: demoPhoto },
              },
              {
                id: "events",
                title: "Events",
                description: "Talks, workshops and hackathons.",
                detail: "With a detail",
                href: "/events",
                image: { src: demoPhoto },
              },
              {
                id: "no-image",
                title: "Without a photo",
                description: "Rows without a photo leave the preview empty.",
                href: "/qanda",
              },
            ]}
          />
          <QuoteCard
            variant="editorial"
            quote="The editorial variant gives a longer example quote room to lead a section."
            name="Editorial variant"
            byline="Role @ Organization"
            portrait={{ src: demoPhoto }}
            className="max-w-3xl"
          />
        </div>
      </Block>

      <Block id="interactive" title="Interactive" tone="lavender">
        <DesignSystemInteractive />
        <FaqList
          className="mt-16"
          items={faqs.slice(0, 3).map((faq, index) => ({
            ...faq,
            id: `ds-faq-${index + 1}`,
          }))}
          defaultValue={faqs[0] ? [faqs[0].question] : undefined}
        />
        <p className="mt-6 text-fg-muted text-small">
          Items with an <code>id</code> are deep-linkable:{" "}
          <TextLink href="#ds-faq-3">open the third question</TextLink>.
        </p>
        <Accordion className="mt-10">
          <AccordionItem value="parts">
            <AccordionTrigger headingAs="h4">
              Composed from Accordion parts
            </AccordionTrigger>
            <AccordionPanel>
              AccordionItem, AccordionTrigger and AccordionPanel directly.
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Block>

      <Block
        id="key-dates"
        title="Key dates and day ruler"
        lead="KeyDates sets a round's important dates as a call for papers does: passed dates struck through, the next in the accent. DayRuler shows how much of a window of days is gone."
      >
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <Label>KeyDates md, drawIn · DayRuler md</Label>
            <KeyDates
              drawIn
              items={[
                {
                  id: "opens",
                  label: "Applications open",
                  date: "28 Sep",
                  state: "past",
                },
                {
                  id: "deadline",
                  label: "Application deadline",
                  detail: "23:59, Munich time",
                  date: "27 Oct",
                  state: "next",
                  note: "26 days left",
                },
                { id: "interviews", label: "Interviews", date: "2 - 8 Nov" },
              ]}
            />
            <DayRuler
              className="mt-8"
              days={29}
              elapsed={3}
              startLabel="Opened 28 Sep"
              endLabel="Deadline 27 Oct"
              markLabel="Today"
            />
          </div>
          <div>
            <Label>KeyDates lg, one row · DayRuler lg</Label>
            <KeyDates
              size="lg"
              items={[
                {
                  id: "deadline",
                  label: "Application deadline",
                  date: "27 Oct",
                  state: "next",
                  note: "in 26 days",
                },
              ]}
            />
            <DayRuler
              className="mt-8"
              size="lg"
              days={29}
              elapsed={22}
              markLabel="7 days left"
            />
          </div>
        </div>
      </Block>

      <Block id="process" title="Steps">
        <div>
          <Label>Steps · badge markers, solid rail</Label>
          <Steps
            items={[
              {
                title: "Apply",
                description: "Tell us what you want to build.",
              },
              { title: "Interview", description: "Meet the team." },
              { title: "Onboard", description: "Join a department." },
              { title: "Build", description: "Ship real projects." },
            ]}
          />
        </div>
        <div className="mt-24">
          <Label>Steps · icons, dashed rail</Label>
          <Steps
            columns={3}
            rail="dashed"
            items={[
              { title: "Discover", icon: Sparkles },
              { title: "Match", icon: Handshake },
              { title: "Launch", icon: Rocket },
            ]}
          />
        </div>
        <div className="mt-24">
          <Label>Steps · rows, for steps that are sentences</Label>
          <Steps
            layout="rows"
            items={[
              { title: "Collect research projects from our partner labs" },
              { title: "Preselect applicants on their research experience" },
              {
                title: "Help them settle abroad",
                description: "An optional line under a step.",
              },
            ]}
          />
        </div>
        <div className="mt-24">
          <Label>Steps · dot markers, no rail</Label>
          <Steps
            columns={3}
            marker="dot"
            rail="none"
            items={[
              { title: "Submit", number: "01A" },
              { title: "Review" },
              { title: "Decide" },
            ]}
          />
        </div>
      </Block>

      <Block id="logos" title="Logos" tone="mist">
        <LogoWall
          label="Logo wall"
          logos={[
            ...logos,
            {
              name: "TUM.ai",
              src: "/assets/favicon.svg",
              wordmark: "TUM.ai",
              href: "/",
            },
          ]}
          columns={6}
        />
        <div className="mt-12">
          <Label>LogoWall · strip, equal area from each aspect ratio</Label>
          <LogoWall
            layout="strip"
            label="Logo strip"
            logos={[
              ...logos.map((logo) => ({
                ...logo,
                ...(logo.src ? { aspectRatio: 200 / 80 } : {}),
              })),
              {
                name: "TUM.ai",
                src: "/assets/favicon.svg",
                aspectRatio: 1,
                wordmark: "TUM.ai",
              },
            ]}
          />
        </div>
        <div className="mt-12 grid gap-3 sm:grid-cols-4">
          <LogoTile
            name="Example studio"
            src={demoLogo}
            href={demoExternalUrl}
            size="xl"
            responsive
          />
          <LogoTile name="Example lab" src={demoLogo} size="lg" />
          <LogoTile name="Missing artwork" src="/missing/logo.png" />
          <LogoTile name="No artwork" size="sm" />
        </div>
        <EmptyState
          className="mt-16"
          icon={Inbox}
          title="No events found"
          action={
            <ButtonLink href="#logos" variant="outline" size="sm">
              Clear filters
            </ButtonLink>
          }
        >
          Try a different category or city.
        </EmptyState>
      </Block>

      <Block id="motion" title="Motion" tone="lavender">
        <div className="grid gap-4 sm:grid-cols-5">
          {revealVariants.map((variant, index) => (
            <Reveal
              key={variant}
              variant={variant}
              delay={index * 80}
              className="rounded-2xl bg-raised p-6 text-center text-fg"
            >
              {variant}
            </Reveal>
          ))}
        </div>
        <Reveal
          variant="line"
          className="mt-8 h-px bg-violet-500"
          aria-hidden="true"
        />
      </Block>

      <Section
        tone="night"
        spacing="md"
        className="overflow-clip"
        aria-labelledby="blend-title"
      >
        <Aurora intensity="vivid" />
        <TopBlend />
        <TopBlend edge="bottom" />
        <Container>
          <SectionHeader
            id="blend-title"
            eyebrow="Edges"
            title="TopBlend, top and bottom"
            layout="center"
            lead="A vivid aurora fading into the root canvas at both edges."
          />
        </Container>
      </Section>

      <FaqSection
        id="ds-faq"
        tone="mist"
        items={faqs.slice(3, 6)}
        defaultValue={faqs[3] ? [faqs[3].question] : undefined}
        lead="FaqSection: sticky heading column beside the accordion, with the first answer open."
      />

      <CtaBand
        variant="band"
        mark={false}
        titleId="ds-cta-band"
        visual={
          <span aria-hidden="true" className="inline-block text-highlight">
            <Sparkles className="size-14" strokeWidth={1} />
          </span>
        }
        title="Band variant with a visual."
        lead="Full-bleed flat ink; `mark={false}` leaves the visual as the only artwork, and `children` brings its own layout."
      >
        <Actions align="center">
          <ButtonLink href="/partners" variant="inverse">
            Custom row in children
          </ButtonLink>
        </Actions>
      </CtaBand>

      <CtaBand
        titleId="ds-cta"
        eyebrow="Join us"
        title="Build the future of AI with us."
        lead="Closing call to action, panel variant."
        actions={
          <>
            <ButtonLink href="/apply" arrow>
              Become a Member
            </ButtonLink>
            <ButtonLink href="/partners" variant="inverse">
              Partner with us
            </ButtonLink>
          </>
        }
      />
    </main>
  );
}
