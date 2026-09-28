import Image from "next/image";
import {
  Actions,
  BrandMark,
  ButtonLink,
  Container,
  Reveal,
  Section,
  TextLink,
} from "@/components/ds";
import { membershipConfig } from "@/config/membership";
import { organizationFacts } from "@/config/organization";
import { memberStories } from "@/features/community";
import { ConstructionLines } from "./construction-lines";
import { memberQuote } from "./data/homepage";

/**
 * The recruiting round from the membership config, in order. A real
 * sequence, so these are the page's only numbered items.
 */
const recruitingSteps = [
  { title: "Apply", dates: membershipConfig.timeline.application },
  { title: "Interview", dates: membershipConfig.timeline.interview },
  { title: "Onboarding", dates: membershipConfig.timeline.onboarding },
];

const quoted = memberStories.find((story) => story.name === memberQuote.name);

/**
 * The member call to action on ink, the page's bookend to the hero: the
 * logomark's construction sheet in the background, a large invitation, a
 * member's own words and the faces of the people who run TUM.ai, beside the
 * steps of a recruiting round. The apply button follows
 * `membershipConfig.applicationsOpen`.
 */
export function JoinSection() {
  const { applicationsOpen, applicationUrl } = membershipConfig;
  return (
    <Section
      tone="ink"
      spacing="xl"
      aria-labelledby="join-title"
      className="overflow-clip"
    >
      <div
        aria-hidden="true"
        className="absolute -right-[40%] -bottom-[8%] -z-10 aspect-[477/406] w-[140%] opacity-60 sm:-right-[24%] sm:w-[85%] lg:top-1/2 lg:-right-[7%] lg:bottom-auto lg:w-[min(50vw,56rem)] lg:-translate-y-1/2 lg:opacity-100"
      >
        <BrandMark
          drift={false}
          intensity="medium"
          className="absolute inset-0 size-full"
        />
        <ConstructionLines className="absolute inset-0 size-full text-violet-300" />
      </div>

      <Container>
        <div className="max-w-[46rem]">
          <Reveal>
            <h2
              id="join-title"
              className="max-w-[9em] text-display-xl text-highlight"
            >
              Build the future of AI with us.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-8 max-w-xl text-fg-muted text-lead md:mt-10">
              We recruit new members every semester, from every major. Join{" "}
              {organizationFacts.activeMembers}+ students who run research,
              startups and hackathons themselves.
            </p>
            <Actions className="mt-10 md:mt-12">
              {applicationsOpen ? (
                <ButtonLink href={applicationUrl} size="lg" arrow="external">
                  Apply now
                </ButtonLink>
              ) : (
                <ButtonLink href="/apply" size="lg" arrow>
                  Become a Member
                </ButtonLink>
              )}
              <ButtonLink href="/qanda" size="lg" variant="outline">
                Questions and answers
              </ButtonLink>
            </Actions>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-16 text-fg-muted text-meta md:mt-20">
              How a recruiting round runs
            </p>
            <ol className="mt-5 grid border-hairline-strong border-t sm:grid-cols-3">
              {recruitingSteps.map((step, index) => (
                <li
                  key={step.title}
                  className="border-hairline border-b py-6 sm:border-b-0 sm:py-8 sm:pr-8"
                >
                  <span
                    aria-hidden="true"
                    className="tabular block text-highlight text-stat-md"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-4 text-fg text-heading-md">{step.title}</p>
                  <p className="mt-1 text-fg-muted text-small">{step.dates}</p>
                </li>
              ))}
            </ol>
          </Reveal>

          {quoted ? (
            <Reveal delay={160}>
              <figure className="mt-12 max-w-xl border-hairline border-t pt-8 md:mt-16">
                <blockquote className="text-fg text-heading-md">
                  “{memberQuote.excerpt}”
                </blockquote>
                <figcaption className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <div className="flex -space-x-3">
                    {memberStories.map((story) => (
                      <Image
                        key={story.name}
                        src={story.image}
                        alt=""
                        width={48}
                        height={48}
                        className="size-11 rounded-full object-cover ring-2 ring-canvas"
                      />
                    ))}
                  </div>
                  <div>
                    <p className="font-medium text-fg text-small">
                      {quoted.name}
                    </p>
                    <p className="text-fg-muted text-meta">{quoted.role}</p>
                  </div>
                  <TextLink
                    href="/community#memberStories"
                    arrow
                    className="text-small"
                  >
                    Meet our members
                  </TextLink>
                </figcaption>
              </figure>
            </Reveal>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
