import {
  Actions,
  BrandMark,
  ButtonLink,
  Container,
  Reveal,
  Section,
  TextLink,
} from "@tum.ai/ui-kit";
import Image from "next/image";
import { callToActionLabels } from "@/config/calls-to-action";
import type { MemberStory } from "@/features/community";
import { MembershipApplyButton } from "@/features/community/server";
import { ConstructionLines } from "./construction-lines";
import type { HomeCopy } from "./data/homepage";

/**
 * The member call to action on ink, the page's bookend to the hero: the
 * logomark and its construction sheet in the background, running on into
 * the footer, a large invitation, a
 * member's own words and the faces of the people who run TUM.ai, beside the
 * steps of a recruiting round (a real sequence, so these are the page's
 * only numbered items; their dates are the membership config's, through the
 * copy's placeholders). The apply button follows the dated application
 * window (`MembershipApplyButton`). `stories` are the member stories
 * (`getMemberStories()`): the quote's name picks its author.
 */
export function JoinSection({
  join,
  stories,
}: {
  join: HomeCopy["join"];
  stories: readonly MemberStory[];
}) {
  const { quote } = join;
  const quoted = stories.find((story) => story.key === quote.key);
  return (
    <Section
      tone="ink"
      spacing="xl"
      aria-labelledby="join-title"
      className="overflow-clip"
    >
      {/* Runs past the band's bottom edge; the footer's mark continues it
          (home.css, `data-footer-bleed`). */}
      <div
        aria-hidden="true"
        data-footer-bleed=""
        className="home-join-mark absolute -z-10 aspect-[477/406] opacity-60 lg:opacity-100"
      >
        <BrandMark
          drift={false}
          intensity="medium"
          className="absolute inset-0 size-full"
        />
        <ConstructionLines
          reach="long"
          className="absolute inset-0 hidden size-full text-violet-300 lg:block"
        />
      </div>

      <Container>
        <div className="max-w-[46rem]">
          <Reveal>
            <h2
              id="join-title"
              className="max-w-[9em] text-display-xl text-highlight"
            >
              {join.title}
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-8 max-w-xl text-fg-muted text-lead md:mt-10">
              {join.lead}
            </p>
            <Actions className="mt-10 md:mt-12">
              <MembershipApplyButton />
              <ButtonLink href="/qanda" size="lg" variant="outline">
                {callToActionLabels.questions}
              </ButtonLink>
            </Actions>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-16 text-fg-muted text-meta md:mt-20">
              {join.stepsTitle}
            </p>
            <ol className="mt-5 grid border-hairline-strong border-t sm:grid-cols-3">
              {join.steps.map((step, index) => (
                <li
                  key={step.title}
                  className="grid grid-cols-[3rem_minmax(0,1fr)] items-baseline border-hairline border-b py-5 last:border-b-0 sm:block sm:border-b-0 sm:py-8 sm:pr-8"
                >
                  <span
                    aria-hidden="true"
                    className="tabular block text-heading-lg text-highlight sm:text-stat-md"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="sm:mt-4">
                    <p className="text-fg text-heading-md">{step.title}</p>
                    <p className="mt-1 text-fg-muted text-small">
                      {step.dates}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>

          {quoted ? (
            <Reveal delay={160}>
              <figure className="mt-12 max-w-xl border-hairline border-t pt-8 md:mt-16">
                <blockquote className="text-fg text-heading-sm sm:text-heading-md">
                  “{quote.excerpt}”
                </blockquote>
                <figcaption className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <div className="flex -space-x-3">
                    {stories.map((story) => (
                      <Image
                        key={story.key}
                        src={story.image}
                        alt=""
                        width={48}
                        height={48}
                        className="size-9 rounded-full object-cover ring-2 ring-canvas sm:size-11"
                        style={{ objectPosition: story.imagePosition }}
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
