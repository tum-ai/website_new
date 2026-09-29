import { Container, Section, SectionHeader, Steps } from "@/components/ds";
import { spellCountCapitalized } from "@/lib/words";
import { type StageTiming, selectionStages } from "./data/apply";
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
export function Selection({ call }: { call: RecruitingCall }) {
  return (
    <Section tone="paper" spacing="lg" aria-labelledby="apply-selection-title">
      <Container>
        <SectionHeader
          id="apply-selection-title"
          title="How selection works"
          size="lg"
          layout="stack"
          lead={`${spellCountCapitalized(selectionStages.length)} stages, from your application to your first weekend as a member.`}
        />
        <Steps
          layout="rows"
          items={selectionStages.map((stage) => ({
            title: stage.title,
            detail: when(stage.when, call),
            description: stage.text,
          }))}
        />
      </Container>
    </Section>
  );
}
