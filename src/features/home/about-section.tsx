import Image from "next/image";
import { Fragment } from "react";
import {
  Actions,
  ButtonLink,
  Container,
  Eyebrow,
  Highlight,
  Reveal,
  Section,
  StatGrid,
  type StatItem,
} from "@/components/ds";
import { organizationFacts } from "@/config/organization";
import { aboutText } from "./data/homepage";
import { DeferredPhotoRail } from "./deferred-home-sections";

const PRIMARY_KEYWORDS = new Set([
  "members",
  "partnerships",
  "collaboration",
  "mentorship",
  "opportunities",
  "solutions",
  "entrepreneurial",
  "tumai",
  "ai",
  "research",
  "projects",
  "startups",
  "workshops",
]);

const STATS: StatItem[] = [
  { value: organizationFacts.alumni, suffix: "+", label: "Alumni Members" },
  { value: String(organizationFacts.foundingYear), label: "Founding Year" },
  {
    value: organizationFacts.nationalities,
    suffix: "+",
    label: "Nationalities",
  },
  { value: organizationFacts.majors, suffix: "+", label: "Majors" },
];

const aboutWords = aboutText.trim().split(" ");

/**
 * "What is TUM.ai?": an editorial split (headline beside the intro), the
 * team panorama with the stats beneath it, then a mist band
 * where the statement lights up line by line as it scrolls in beside the
 * onboarding photo, followed by the deferred photo rail.
 */
export function AboutSection() {
  return (
    <>
      <Section
        tone="paper"
        spacing="lg"
        id="about"
        aria-labelledby="about-title"
      >
        <Container>
          <Reveal>
            <Eyebrow index={1}>About</Eyebrow>
          </Reveal>
          {/* Headline and intro share one grid row, bottom-aligned: the last
              headline line sits on the same line as the buttons. */}
          <div className="mt-5 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-16">
            <Reveal delay={60} className="lg:col-span-6">
              <h2 id="about-title" className="text-display-xl text-fg">
                What is <Highlight>TUM.ai</Highlight>?
              </h2>
            </Reveal>
            <Reveal delay={140} className="lg:col-span-6">
              <p className="text-fg-muted text-lead">
                With over {organizationFacts.activeMembers} active members,
                TUM.ai empowers the next generation of AI innovators. Founded in{" "}
                {organizationFacts.foundingYear}, our mission is to create{" "}
                <strong className="font-semibold text-highlight">
                  a community of students who innovate, research, and build at
                  the forefront of AI
                </strong>
                , fostering both groundbreaking research and entrepreneurial
                ventures across diverse industries.
              </p>
              <Actions className="mt-8">
                <ButtonLink href="/community#memberStories" arrow>
                  Meet our Members
                </ButtonLink>
                <ButtonLink href="/qanda" variant="outline">
                  More on our Mission
                </ButtonLink>
              </Actions>
            </Reveal>
          </div>

          <Reveal variant="scale" className="mt-14 md:mt-20">
            <div className="group/pano relative aspect-[4/3] overflow-hidden rounded-4xl bg-sunken sm:aspect-[16/8] lg:aspect-[1920/620]">
              <Image
                src="/assets/apply/new_section_photo_1.webp"
                alt="TUM.ai members"
                fill
                sizes="(min-width: 1280px) 80rem, 100vw"
                className="object-cover transition-transform duration-[1.6s] ease-brand group-hover/pano:scale-[1.03] motion-reduce:transition-none"
              />
            </div>
          </Reveal>

          <Reveal delay={120} className="mt-4 md:mt-5">
            <StatGrid
              items={STATS}
              className="grid-cols-2 max-sm:[&>div]:p-5 max-sm:[&_dd]:text-[clamp(2rem,10vw,2.75rem)]"
            />
          </Reveal>
        </Container>
      </Section>

      <Section as="div" tone="mist" spacing="lg" className="overflow-clip">
        <Container className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <p className="font-medium text-[clamp(1.5rem,1.02rem+1.55vw,2.45rem)] text-fg leading-[1.22] tracking-[-0.032em] lg:col-span-6 xl:col-span-5">
            {aboutWords.map((word, index) => {
              const keyword = PRIMARY_KEYWORDS.has(
                word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase(),
              );
              // Inline-block so each word gets its own view timeline; the
              // space sits outside so lines still wrap between words.
              return (
                <Fragment key={index}>
                  <span
                    className={
                      keyword
                        ? "home-lit-word inline-block font-semibold text-highlight"
                        : "home-lit-word inline-block"
                    }
                  >
                    {word}
                  </span>
                  {index < aboutWords.length - 1 ? " " : null}
                </Fragment>
              );
            })}
          </p>
          <Reveal
            variant="scale"
            delay={120}
            className="lg:col-span-6 xl:col-span-7"
          >
            <div className="group/onboarding relative aspect-[3/2] overflow-hidden rounded-4xl bg-sunken lg:aspect-[5/4] xl:aspect-[3/2]">
              <Image
                src="/assets/homepage/Onboarding25.webp"
                alt="TUM.ai onboarding"
                fill
                sizes="(min-width: 1280px) 46rem, (min-width: 1024px) 48vw, 100vw"
                className="object-cover transition-transform duration-[1.6s] ease-brand group-hover/onboarding:scale-[1.04] motion-reduce:transition-none"
              />
            </div>
          </Reveal>
        </Container>
        <div className="mt-16 md:mt-24">
          <DeferredPhotoRail />
        </div>
      </Section>
    </>
  );
}
