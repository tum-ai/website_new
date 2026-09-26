import { Brain, Handshake, Inbox, Rocket, Sparkles, Users } from "lucide-react";
import type { ReactNode } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  Actions,
  Aurora,
  BrandMark,
  BrandPanel,
  ButtonLink,
  buttonStyles,
  Card,
  Carousel,
  Container,
  CountUp,
  CtaBand,
  cardStyles,
  Display,
  EmptyState,
  Eyebrow,
  FallbackImage,
  FaqList,
  FaqSection,
  FeatureCard,
  formatFigure,
  Heading,
  Highlight,
  IconBadge,
  LogoTile,
  LogoWall,
  Marquee,
  MediaCard,
  PageHero,
  PersonCard,
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
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Tag,
  Text,
  TextLink,
  Timeline,
  type Tone,
  TopBlend,
} from "@/components/ds";
import { socialLinks } from "@/config/contact";
import { eLabConfig } from "@/config/e-lab";
import { organizationFacts } from "@/config/organization";
import { faqs } from "@/features/qanda";
import {
  DesignSystemInteractive,
  DesignSystemScrollDemo,
} from "./design-system-interactive";

/*
 * Every export of src/components/ds appears on this page at least once, and
 * every variant a component offers is shown side by side. `MotionProvider`
 * and `useInertBackground` have no visuals: the site layout renders the
 * provider, and every <Dialog> below uses the hook.
 */

const tones: { tone: Tone; name: string; hex: string }[] = [
  { tone: "paper", name: "Paper", hex: "#FFFFFF" },
  { tone: "mist", name: "Mist · Minimal Grey", hex: "#EFEFEF" },
  { tone: "lavender", name: "Lavender Tint", hex: "#F5EFFF" },
  { tone: "violet", name: "Electric Lavender", hex: "#9A64D9" },
  { tone: "ink", name: "Dark Indigo", hex: "#1B0049" },
  { tone: "night", name: "Black", hex: "#0D0214" },
];

const photos = [
  { src: "/assets/open_ai_speaker_event.webp", title: "Events" },
  { src: "/assets/innovation/robotics_discussion.webp", title: "Research" },
  { src: "/assets/innovation/robotics_writing.webp", title: "Projects" },
  { src: "/assets/home_img4.webp", title: "E-Lab" },
];

const logos = [
  { name: "NVIDIA", src: "/assets/partners/logos/nvidia.webp" },
  { name: "Google", src: "/assets/partners/logos/google.webp" },
  { name: "IBM", src: "/assets/partners/logos/ibm.png" },
  { name: "Meta", src: "/assets/partners/logos/meta.svg" },
  { name: "Databricks", src: "/assets/partners/logos/databricks.svg" },
  { name: "BMW", src: "/assets/partners/logos/bmw.svg" },
  { name: "Helmholtz Munich" },
];

const revealVariants: RevealVariant[] = [
  "up",
  "fade",
  "scale",
  "left",
  "right",
];

const figures = ["1.2M+", "20k+", "2.3%", "~500", "2,100+", "24/7"];

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

/** Small uppercase caption above a demo. */
function Label({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 text-eyebrow text-fg-subtle uppercase">{children}</p>
  );
}

export function DesignSystemPage() {
  return (
    <main>
      <PageHero
        titleId="ds-hero-title"
        eyebrow="Living reference"
        title={
          <>
            Precise, calm, <Highlight>alive.</Highlight>
          </>
        }
        lead="Every component on this page is the one used on the site. Tones, type, motion and interaction live in src/components/ds and src/styles/index.css."
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
              src="/assets/open_ai_speaker_event.webp"
              alt="A speaker on stage at a TUM.ai event"
              fill
              priority
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
          <StatusBadge>Applications open until 26.09.2026</StatusBadge>
          <StatusBadge status="idle">Next cohort in spring</StatusBadge>
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
              Lead: To bridge the gap between theory and practice by empowering
              students to build the future of AI.
            </Text>
            <Text className="max-w-2xl">
              Body (muted): We combine academic rigor with a make-it-happen
              mindset to solve real-world challenges.
            </Text>
            <Text size="small" emphasis="default">
              Small, default emphasis.
            </Text>
            <Text size="meta" emphasis="subtle">
              Meta, subtle emphasis.
            </Text>
            <p className="text-fg text-label">Label (15px UI text)</p>
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
              <TextLink href={socialLinks.github} arrow>
                External text link
              </TextLink>
            </div>
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
        <Container>
          <SectionHeader
            id="buttons-title"
            eyebrow="Actions"
            index={3}
            title="Buttons on dark"
            lead="Aurora (subtle) and grain behind; Actions lays out the rows."
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
            <ButtonLink href={socialLinks.github} arrow="external">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={Brain} title="Research" index="01">
            Applied AI research with leading labs and universities.
          </FeatureCard>
          <FeatureCard icon={Rocket} title="Ventures" index="02">
            From first idea to funded startup in the E-Lab.
          </FeatureCard>
          <FeatureCard icon={Users} title="Community" index="03">
            {organizationFacts.alumni}+ alumni across{" "}
            {organizationFacts.nationalities} nationalities.
          </FeatureCard>
          <FeatureCard
            icon={Handshake}
            title="Industry"
            index="04"
            variant="outline"
          >
            Projects and hackathons with partners (outline).
          </FeatureCard>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Card>
            <Label>Card · raised</Label>
            <Heading>Base surface</Heading>
          </Card>
          <Card variant="outline" interactive as="article">
            <Label>Card · outline, interactive</Label>
            <Heading>Lifts on hover</Heading>
          </Card>
          <SpotlightCard>
            <Label>SpotlightCard</Label>
            <Heading>Light follows the pointer</Heading>
          </SpotlightCard>
        </div>
        <div
          className={cardStyles({
            variant: "outline",
            padding: "sm",
            className: "mt-4",
          })}
        >
          <Label>cardStyles on a plain div</Label>
          <Text>For surfaces that are another component&apos;s root.</Text>
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
          </div>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {photos.map((photo, index) => (
            <MediaCard
              key={photo.title}
              href="/design-system"
              image={{ src: photo.src, alt: "" }}
              eyebrow="Explore"
              title={photo.title}
              meta="Munich · 2026"
              scrim={index % 2 === 1 ? "strong" : "default"}
            />
          ))}
        </div>
        <div className="mt-4 grid items-start gap-4 md:grid-cols-3">
          <MediaCard
            image={{ alt: "" }}
            title="No photo: BrandPanel fallback"
            meta="`fallback` default"
            aspect="4/3"
          />
          <MediaCard
            href="/design-system"
            image={{ src: "/missing/photo.webp", alt: "" }}
            title="Broken photo: custom fallback"
            aspect="4/3"
            fallback={<BrandPanel seed={2} />}
            cornerHint={<Tag className="bg-white/90 text-violet-950">New</Tag>}
          />
          <MediaCard
            layout="stacked"
            aspect="4/3"
            href="/design-system"
            image={{ src: "/assets/homepage/Makeathon.webp", alt: "" }}
            eyebrow="Hackathon"
            title="Stacked media card"
            description="Image on top, text on the band."
          />
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <QuoteCard
            quote="Truly impressive what the team has built. We’re just getting started."
            name="Axel Täubert"
            byline="Head of Startups @ Google Cloud"
            logo={{
              src: "/assets/partners/logos/google.webp",
              alt: "Google",
            }}
          />
          <PersonCard
            name="Leonie Freisinger"
            byline="Co-Founder & CTO"
            image={{ src: "/assets/partners/people/leonie-portrait.webp" }}
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
            lead="BrandMark (gradient variant) in the corner."
          />
          <div className="grid gap-6 md:grid-cols-2">
            <QuoteCard
              variant="glass"
              quote="The E-Lab put us in front of the right people, fast."
              name="Leonie Freisinger"
              byline="Co-Founder & CTO"
              portrait={{ src: "/assets/partners/people/leonie.webp" }}
              context={<Tag>E-Lab 4</Tag>}
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
                  name="Google"
                  src="/assets/partners/logos/google.webp"
                />
                <LogoTile
                  variant="chip"
                  name="NVIDIA"
                  src="/assets/partners/logos/nvidia.webp"
                  href="https://www.nvidia.com"
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
                value: organizationFacts.alumni,
                suffix: "+",
                label: "Alumni Members",
              },
              {
                value: String(organizationFacts.foundingYear),
                label: "Founding Year",
              },
              {
                value: organizationFacts.nationalities,
                suffix: "+",
                label: "Nationalities",
              },
              {
                value: eLabConfig.ventureFundingMillions,
                prefix: "€",
                suffix: "M",
                label: "Raised",
              },
            ]}
          />
        </Container>
      </Section>

      <Block
        id="figures"
        title="Figures"
        lead="StatGrid sizes (sm to xl) and CountUp parsing copy figures."
      >
        <div className="grid gap-6">
          <StatGrid
            size="sm"
            columns={3}
            items={[
              { value: "1.2M+", count: true, label: "Reach (sm, counted)" },
              { value: "2.3%", count: true, label: "Conversion" },
              { value: "24/7", label: "Not a single number" },
            ]}
          />
          <StatGrid
            size="xl"
            columns={2}
            items={[
              { value: "2,100+", count: true, label: "Members (xl)" },
              { value: 40, suffix: "+", label: "Nationalities" },
            ]}
          />
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

      <Block id="interactive" title="Interactive" tone="lavender">
        <DesignSystemInteractive />
        <div className="mt-16">
          <Tabs defaultValue="projects">
            <TabsList aria-label="Demo tabs">
              <TabsTab value="projects">Projects</TabsTab>
              <TabsTab value="exchange">Research Exchange Program</TabsTab>
            </TabsList>
            <TabsPanel
              value="projects"
              className="mt-8 text-body text-fg-muted"
            >
              Tab panel one.
            </TabsPanel>
            <TabsPanel
              value="exchange"
              className="mt-8 text-body text-fg-muted"
            >
              Tab panel two.
            </TabsPanel>
          </Tabs>
        </div>
        <FaqList className="mt-16" items={faqs.slice(0, 3)} />
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

      <Block id="process" title="Timeline and steps">
        <Label>Timeline · alternate, progress rail, dot markers</Label>
        <Timeline
          alternate
          items={[
            { label: "Week 1", title: "Kickoff", description: "Onboarding." },
            { label: "Week 4", title: "Phase I", description: "Build." },
            { label: "Week 8", title: "Midterm", description: "MVP gate." },
            { label: "Week 12", title: "Demo Day", description: "Pitch." },
          ]}
        />
        <div className="mt-24">
          <Label>Timeline · dashed rail, number markers, continuation</Label>
          <Timeline
            rail="dashed"
            marker="number"
            continuation="Your journey continues..."
            items={[
              { title: "Apply", description: "Tell us about your idea." },
              { title: "Pitch", description: "Meet the jury." },
              { title: "Build", description: "Twelve weeks of sprints." },
            ]}
          />
        </div>
        <div className="mt-24">
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

      <Block id="logos" title="Logos and rails" tone="mist">
        <Marquee label="Partners" duration={40}>
          {logos.map((logo) => (
            <LogoTile key={logo.name} {...logo} size="sm" className="w-44" />
          ))}
        </Marquee>
        <Marquee className="mt-4" label="Partners, reversed" reverse>
          {logos.map((logo) => (
            <LogoTile key={logo.name} {...logo} variant="chip" />
          ))}
        </Marquee>
        <LogoWall
          className="mt-8"
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
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <LogoTile
            name="Google"
            src="/assets/partners/logos/google.webp"
            href="https://about.google"
            size="lg"
          />
          <LogoTile name="Missing artwork" src="/missing/logo.png" />
          <LogoTile name="No artwork" size="sm" />
        </div>
        <Carousel className="mt-16" label="Highlights">
          {photos.map((photo) => (
            <MediaCard
              key={photo.title}
              image={{ src: photo.src, alt: "" }}
              title={photo.title}
              aspect="16/10"
            />
          ))}
        </Carousel>
        <div className="mt-16 aspect-[16/9] overflow-hidden rounded-4xl">
          <Carousel
            variant="overlay"
            label="Photo frame"
            classNames={{ slide: "basis-full" }}
          >
            {photos.map((photo) => (
              <div key={photo.title} className="relative h-full">
                <FallbackImage
                  src={photo.src}
                  alt={photo.title}
                  fill
                  sizes="(min-width: 1024px) 80vw, 100vw"
                  className="object-cover"
                  fallback={<BrandPanel />}
                />
              </div>
            ))}
          </Carousel>
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
        <div className="mt-10">
          <DesignSystemScrollDemo />
        </div>
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
        lead="FaqSection: sticky heading column beside the accordion."
      />

      <CtaBand
        variant="band"
        titleId="ds-cta-band"
        visual={
          <span aria-hidden="true" className="inline-block text-highlight">
            <Sparkles className="size-14" strokeWidth={1} />
          </span>
        }
        title="Band variant with a visual."
        lead="Full-bleed dark band; `children` brings its own layout."
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
