import Image from "next/image";
import { Fragment } from "react";
import {
  ButtonLink,
  Container,
  Highlight,
  Reveal,
  Section,
  SectionHeader,
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

/** The statement's words, keyed by position (the copy is static). */
const aboutWords = aboutText
  .trim()
  .split(" ")
  .map((word, position, words) => ({
    word,
    id: `${position}:${word}`,
    last: position === words.length - 1,
  }));

/**
 * "What is TUM.ai?": the section header (headline beside the intro), the
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
          <SectionHeader
            id="about-title"
            eyebrow="About"
            index={1}
            size="xl"
            // The intro is a full paragraph with two actions, too long for
            // the split layout's default narrow aside.
            classNames={{ aside: "lg:max-w-xl" }}
            title={
              <>
                What is <Highlight>TUM.ai</Highlight>?
              </>
            }
            lead={
              <>
                With over {organizationFacts.activeMembers} active members,
                TUM.ai empowers the next generation of AI innovators. Founded in{" "}
                {organizationFacts.foundingYear}, our mission is to create{" "}
                <strong className="font-semibold text-highlight">
                  a community of students who innovate, research, and build at
                  the forefront of AI
                </strong>
                , fostering both groundbreaking research and entrepreneurial
                ventures across diverse industries.
              </>
            }
            actions={
              <>
                <ButtonLink href="/community#memberStories" arrow>
                  Meet our Members
                </ButtonLink>
                <ButtonLink href="/qanda" variant="outline">
                  More on our Mission
                </ButtonLink>
              </>
            }
          />

          <Reveal variant="scale">
            <div className="group/zoom relative aspect-[4/3] overflow-hidden rounded-4xl bg-sunken sm:aspect-[16/8] lg:aspect-[1920/620]">
              <Image
                src="/assets/apply/new_section_photo_1.webp"
                alt="TUM.ai members"
                fill
                sizes="(min-width: 1280px) 80rem, 100vw"
                className="zoom-media object-cover"
              />
            </div>
          </Reveal>

          <Reveal delay={120} className="mt-4 md:mt-5">
            <StatGrid items={STATS} />
          </Reveal>
        </Container>
      </Section>

      <Section as="div" tone="mist" spacing="lg" className="overflow-clip">
        <Container className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <p className="font-medium text-fg text-heading-lg lg:col-span-6 xl:col-span-5">
            {aboutWords.map(({ word, id, last }) => {
              const keyword = PRIMARY_KEYWORDS.has(
                word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase(),
              );
              // Inline-block so each word gets its own view timeline; the
              // space sits outside so lines still wrap between words.
              return (
                <Fragment key={id}>
                  <span
                    className={
                      keyword
                        ? "home-lit-word inline-block font-semibold text-highlight"
                        : "home-lit-word inline-block"
                    }
                  >
                    {word}
                  </span>
                  {last ? null : " "}
                </Fragment>
              );
            })}
          </p>
          <Reveal
            variant="scale"
            delay={120}
            className="lg:col-span-6 xl:col-span-7"
          >
            <div className="group/zoom relative aspect-[3/2] overflow-hidden rounded-4xl bg-sunken lg:aspect-[5/4] xl:aspect-[3/2]">
              <Image
                src="/assets/homepage/Onboarding25.webp"
                alt="TUM.ai onboarding"
                fill
                sizes="(min-width: 1280px) 46rem, (min-width: 1024px) 48vw, 100vw"
                className="zoom-media object-cover"
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
