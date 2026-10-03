import {
  Actions,
  ButtonLink,
  Container,
  Reveal,
  Section,
  TextLink,
} from "@tum.ai/ui-kit";
import { callToActionLabels } from "@/config/calls-to-action";
import type { MemberStory } from "@/features/community";
import { MembershipApplyButton } from "@/features/community/server";
import type { HomeCopy } from "./data/homepage";
import { JoinMark } from "./join-mark";
import { MemberFaces } from "./member-faces";

/**
 * The member call to action on ink, the page's bookend to the hero: the
 * logomark and its construction sheet in the background, running on into
 * the footer, a large invitation, the
 * members' own words and their faces, beside the
 * steps of a recruiting round (a real sequence, so these are the page's
 * only numbered items; their dates are the membership config's, through the
 * copy's placeholders). The apply button follows the dated application
 * window (`MembershipApplyButton`). `stories` are the member stories
 * (`getMemberStories()`): each quote's stable key picks its member, whose face
 * a visitor picks to read it (`MemberFaces`).
 */
export function JoinSection({
  join,
  stories,
}: {
  join: HomeCopy["join"];
  stories: readonly MemberStory[];
}) {
  const quoted = join.quotes.flatMap(({ key, excerpt }) => {
    const story = stories.find((entry) => entry.key === key);
    return story
      ? [
          {
            key,
            name: story.name,
            excerpt,
            role: story.role,
            image: story.image,
            imagePosition: story.imagePosition,
          },
        ]
      : [];
  });
  return (
    <Section
      tone="ink"
      spacing="xl"
      aria-labelledby="join-title"
      className="overflow-clip"
    >
      {/* Runs past the band's bottom edge; the footer's mark continues it
          (home.css, `data-footer-bleed`). */}
      <JoinMark />

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

          {quoted.length > 0 ? (
            <Reveal delay={160}>
              <MemberFaces
                key={JSON.stringify(quoted.map(({ key }) => key))}
                members={quoted}
                link={
                  <TextLink
                    href="/community#memberStories"
                    arrow
                    className="text-small"
                  >
                    Meet our members
                  </TextLink>
                }
              />
            </Reveal>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
