import { Container, Section, SectionHeader, Steps } from "@tum.ai/ui-kit";
import { fillPageTokens } from "@/lib/content-copy";
import { spellCountCapitalized } from "@/lib/words";
import type { ApplyCopy, StageTiming } from "./data/apply";
import type { RecruitingCall } from "./round";

/** A stage's timing in words, from the round's dates. */
function when(timing: StageTiming, { words }: RecruitingCall): string {
  switch (timing) {
    case "deadline":
      return `Until ${words.deadline}, ${words.deadlineTime}`;
    case "after-deadline":
      return "After the deadline";
    case "interviews":
      return words.interviews;
    case "onboarding":
      return words.onboarding;
  }
}

/**
 * How the round selects members: the stages are a real order, so they are
 * numbered `Steps` rows, each dated from the config.
 */
export function Selection({
  copy,
  call,
}: {
  copy: ApplyCopy["selection"];
  call: RecruitingCall;
}) {
  const { stages } = copy;
  return (
    <Section tone="paper" spacing="lg" aria-labelledby="apply-selection-title">
      <Container>
        <SectionHeader
          id="apply-selection-title"
          title={copy.title}
          size="lg"
          layout="stack"
          lead={fillPageTokens(copy.lead, {
            count: spellCountCapitalized(stages.length),
          })}
        />
        <Steps
          layout="rows"
          items={stages.map((stage) => ({
            title: stage.title,
            detail: when(stage.when, call),
            description: stage.text,
          }))}
        />
      </Container>
    </Section>
  );
}
