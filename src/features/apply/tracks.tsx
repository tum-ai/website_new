import Image from "next/image";
import {
  Container,
  Photo,
  Reveal,
  Section,
  SectionHeader,
  TextLink,
} from "@/components/ds";
import {
  type JourneyStep,
  memberJourney,
  memberStories,
} from "@/features/community";
import { offerings } from "./data/apply";

/** The fork of the member journey: the two tracks a new member picks from. */
const tracks: JourneyStep[] =
  memberJourney.find((stage) => stage.kind === "fork")?.steps ?? [];

/** One track: what it is, and a member who took it, in their own words. */
function Track({ step }: { step: JourneyStep }) {
  const story = memberStories.find(
    (entry) => entry.name === step.evidence?.name,
  );
  return (
    <article className="border-hairline-strong border-t pt-8">
      <h3 className="text-display-md text-fg">{step.name}</h3>
      <p className="mt-5 max-w-xl text-body text-fg-muted">
        {step.description}
      </p>
      {step.evidence && story ? (
        <figure className="mt-8 border-highlight border-l-2 pl-5">
          <blockquote className="text-fg text-lead">
            <p>“{step.evidence.excerpt}”</p>
          </blockquote>
          <figcaption className="mt-4 flex items-center gap-3">
            <Image
              src={story.image}
              alt=""
              width={40}
              height={40}
              className="size-9 shrink-0 rounded-full object-cover"
            />
            <span className="text-fg-muted text-meta">
              <span className="font-medium text-fg">{story.name}</span>,{" "}
              {story.role}
            </span>
          </figcaption>
        </figure>
      ) : null}
    </article>
  );
}

/**
 * What a new member works on: the journey's two tracks from /community's
 * single source, each with a member's own words, then what every member can
 * join besides, and the hackathon photo.
 */
export function Tracks() {
  return (
    <Section tone="mist" spacing="lg" aria-labelledby="apply-tracks-title">
      <Container>
        <SectionHeader
          id="apply-tracks-title"
          title="What you'll work on"
          size="lg"
          layout="stack"
          lead="Every member starts at the onboarding weekend. From the first semester, you take one of two tracks."
        />
        <div className="grid gap-14 md:grid-cols-2 md:gap-10 lg:gap-16">
          {tracks.map((step, index) => (
            <Reveal key={step.step} delay={index * 100}>
              <Track step={step} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-20 grid gap-8 md:mt-28 lg:grid-cols-12 lg:gap-16">
          <h3 className="font-medium text-fg-muted text-small lg:col-span-4">
            On either track, you can also join
          </h3>
          <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-3 lg:col-span-8">
            {offerings.map((offering) => (
              <div
                key={offering.title}
                className="border-hairline-strong border-t pt-5"
              >
                <dt className="text-fg text-heading-sm">{offering.title}</dt>
                <dd className="mt-2 text-fg-muted text-small">
                  {offering.text}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal variant="fade" className="mt-16 md:mt-24">
          <Photo
            aspect="panorama"
            src="/assets/apply/new_section_photo_4.webp"
            alt="A packed lecture hall applauding as a team presents an AppliedAI challenge on the big screen"
            // TODO(content): caption. Which hackathon is this, and when?
            position="55% 50%"
            sizes="(min-width: 80rem) 80rem, 100vw"
          />
        </Reveal>
        <p className="mt-10">
          <TextLink href="/community#journey" arrow>
            The full member journey, semester by semester
          </TextLink>
        </p>
      </Container>
    </Section>
  );
}
