import { Brain, Handshake, Rocket, Users } from "lucide-react";
import type { ReactNode } from "react";
import {
  ButtonLink,
  Carousel,
  Container,
  CtaBand,
  EmptyState,
  FaqList,
  FeatureCard,
  Highlight,
  LogoTile,
  LogoWall,
  Marquee,
  MediaCard,
  PageHero,
  PersonCard,
  Pill,
  QuoteCard,
  Reveal,
  Section,
  SectionHeader,
  StatGrid,
  StatusBadge,
  Steps,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Tag,
  Timeline,
  type Tone,
} from "@/components/ds";
import { faqs } from "@/data/qanda";
import { DesignSystemInteractive } from "./DesignSystemInteractive";

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

function Block({
  id,
  title,
  tone = "paper",
  children,
}: {
  id: string;
  title: string;
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <Section tone={tone} spacing="md" aria-labelledby={id}>
      <Container>
        <SectionHeader id={id} eyebrow="Component" title={title} />
        {children}
      </Container>
    </Section>
  );
}

export function DesignSystemShowcase() {
  return (
    <main>
      <PageHero
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
            <ButtonLink href="#cards" variant="outline">
              Outline
            </ButtonLink>
          </>
        }
      >
        <StatusBadge>Applications open until 26.09.2026</StatusBadge>
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
                  <p className="text-heading-md text-fg">{name}</p>
                  <div>
                    <p className="text-small text-fg-muted">Muted body text</p>
                    <p className="text-meta text-highlight">
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
          />
          <div className="space-y-6">
            <p className="text-display-2xl text-fg">Display 2xl</p>
            <p className="text-display-xl text-fg">Display xl</p>
            <p className="text-display-lg text-fg">Display lg</p>
            <p className="text-display-md text-fg">Display md</p>
            <p className="text-heading-lg text-fg">Heading lg</p>
            <p className="text-heading-md text-fg">Heading md</p>
            <p className="text-lead text-fg-muted">
              Lead: To bridge the gap between theory and practice by empowering
              students to build the future of AI.
            </p>
            <p className="max-w-2xl text-body text-fg-muted">
              Body: We combine academic rigor with a make-it-happen mindset to
              solve real-world challenges.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Pill>Mission</Pill>
              <Pill>Vision</Pill>
              <Tag>Robotics</Tag>
              <Tag>NLP</Tag>
              <p className="text-eyebrow text-highlight uppercase">Eyebrow</p>
            </div>
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
        <Container>
          <SectionHeader
            id="buttons-title"
            eyebrow="Actions"
            index={3}
            title="Buttons on dark"
          />
          <div className="flex flex-wrap items-center gap-3">
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
            <ButtonLink href="https://github.com/tum-ai/" arrow="external">
              External
            </ButtonLink>
            <ButtonLink href="#buttons" size="sm">
              Small
            </ButtonLink>
            <ButtonLink href="#buttons" size="lg" arrow>
              Large
            </ButtonLink>
          </div>
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
            400+ alumni across 33 nationalities.
          </FeatureCard>
          <FeatureCard icon={Handshake} title="Industry" index="04">
            Projects and hackathons with partners.
          </FeatureCard>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {photos.map((photo) => (
            <MediaCard
              key={photo.title}
              href="/design-system"
              image={{ src: photo.src, alt: "" }}
              eyebrow="Explore"
              title={photo.title}
              meta="Munich · 2026"
            />
          ))}
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <QuoteCard
            quote="Truly impressive what the team has built. 🚀 We’re just getting started"
            name="Axel Täubert"
            role="Head of Startups @ Google Cloud"
          />
          <PersonCard
            name="Leonie Freisinger"
            role="Co-Founder & CTO"
            image={{ src: "/assets/partners/people/leonie-portrait.webp" }}
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
      </Block>

      <Section tone="violet" spacing="md" aria-labelledby="stats-title">
        <Container>
          <h2 id="stats-title" className="sr-only">
            Stats
          </h2>
          <StatGrid
            items={[
              { value: 400, suffix: "+", label: "Alumni Members" },
              { value: "2020", label: "Founding Year" },
              { value: 33, suffix: "+", label: "Nationalities" },
              { value: 8, prefix: "€", suffix: "M", label: "Raised" },
            ]}
          />
        </Container>
      </Section>

      <Block id="interactive" title="Interactive" tone="lavender">
        <DesignSystemInteractive />
        <div className="mt-16">
          <Tabs defaultValue="projects">
            <TabsList>
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
        <FaqList className="mt-16" items={faqs.slice(0, 4)} />
      </Block>

      <Block id="process" title="Timeline and steps">
        <Timeline
          alternate
          items={[
            { label: "Week 1", title: "Kickoff", description: "Onboarding." },
            { label: "Week 4", title: "Phase I", description: "Build." },
            { label: "Week 8", title: "Midterm", description: "MVP gate." },
            { label: "Week 12", title: "Demo Day", description: "Pitch." },
          ]}
        />
        <Steps
          className="mt-24"
          items={[
            { title: "Apply", description: "Tell us what you want to build." },
            { title: "Interview", description: "Meet the team." },
            { title: "Onboard", description: "Join a department." },
            { title: "Build", description: "Ship real projects." },
          ]}
        />
      </Block>

      <Block id="logos" title="Logos and rails" tone="mist">
        <Marquee label="Partners" duration={40}>
          {logos.map((logo) => (
            <LogoTile key={logo.name} {...logo} size="sm" className="w-44" />
          ))}
        </Marquee>
        <LogoWall className="mt-8" logos={logos} columns={6} />
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
        <EmptyState className="mt-16" title="No events found">
          Try a different category or city.
        </EmptyState>
      </Block>

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
