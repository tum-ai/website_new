import {
  Handshake,
  type LucideIcon,
  Monitor,
  Rocket,
  Users,
} from "lucide-react";

import {
  BrandMark,
  Container,
  FeatureCard,
  Reveal,
  Section,
  SectionHeader,
  StatGrid,
} from "@/components/ds";
import { eLabMetrics, type Metric } from "@/data/e-lab/venture-page";

const features: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: "Your own workspace",
    body: "Desks, monitors, whiteboards; work from TUM.ai's headquarters.",
    icon: Monitor,
  },
  {
    title: "Operator sessions",
    body: "Weekly sessions with builders and founders who've done it before.",
    icon: Users,
  },
  {
    title: "VC access",
    body: "Warm intros and real feedback from top European funds.",
    icon: Handshake,
  },
  {
    title: "Build > Talk",
    body: "Fast paced, builder-driven environment. Accountability through community.",
    icon: Rocket,
  },
];

/**
 * "What to expect": a bento of four spotlight feature cards beside an ink
 * manifesto panel, followed by a violet band with the E-Lab proof points
 * counting up.
 */
export function ExpectationELab() {
  return (
    <>
      <Section tone="paper" spacing="lg" aria-labelledby="elab-expect-title">
        <Container>
          <SectionHeader
            id="elab-expect-title"
            eyebrow="Why E-Lab"
            index={1}
            title="What to expect"
            lead="Built by founders, for founders - 3 month's optimized for speed, learning, and real traction."
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.15fr)] lg:grid-rows-2">
            {features.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 80} className="h-full">
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  index={String(index + 1).padStart(2, "0")}
                >
                  {feature.body}
                </FeatureCard>
              </Reveal>
            ))}
            <Reveal
              delay={200}
              className="md:col-span-2 lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:row-start-1"
            >
              <div
                data-tone="ink"
                className="relative isolate flex h-full flex-col justify-between gap-10 overflow-clip rounded-3xl p-8 md:p-10"
              >
                <div aria-hidden className="grain -z-10" />
                <div
                  aria-hidden
                  className="absolute -top-1/3 -left-1/4 -z-10 h-full w-full rounded-full bg-[radial-gradient(closest-side,rgb(154_100_217/0.4),transparent)]"
                />
                <BrandMark className="absolute -right-[18%] -bottom-[16%] -z-10 w-[80%] text-white/[0.05]" />
                <p className="text-heading-lg text-fg">
                  Have an idea, a prototype, or just relentless drive, and are
                  ready to build?{" "}
                  <span className="text-highlight">
                    Build it here. No equity. No theory.
                  </span>
                </p>
                <p className="border-t border-hairline pt-6 text-small font-medium text-fg-muted">
                  Backed by TUM.ai and supported by leading VCs.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section
        tone="violet"
        spacing="sm"
        aria-labelledby="elab-numbers-title"
        className="overflow-clip"
      >
        <BrandMark className="absolute -right-[4%] -bottom-[55%] -z-10 w-[min(40rem,70%)] text-white/[0.1]" />
        <Container className="grid gap-8 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1.45fr)] lg:items-end lg:gap-16">
          <Reveal className="lg:pb-8">
            <h2
              id="elab-numbers-title"
              className="max-w-[9ch] text-heading-lg text-fg"
            >
              E-Lab in numbers
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <StatGrid
              columns={3}
              items={eLabMetrics.map((metric: Metric) => ({
                value: metric.to,
                prefix: metric.prefix,
                suffix: metric.suffix,
                label: metric.label,
              }))}
            />
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
