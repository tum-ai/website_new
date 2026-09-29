import { Container, Reveal, Section, SectionHeader } from "@/components/ds";
import type { RecruitingCall } from "./round";

type Stage = { title: string; when: string; text: string };

/** The round's stages in order, dated from the call. */
function stages(call: RecruitingCall): Stage[] {
  const { words } = call;
  return [
    {
      title: "Application",
      when: `Until ${words.deadline}, ${words.deadlineTime}`,
      text: "Fill out the application form before the deadline.",
    },
    {
      title: "Screening",
      when: "After the deadline",
      text: "The recruiting team screens the applications.",
    },
    {
      title: "Interview",
      when: words.interviews,
      text: "If you pass the screening, we invite you to an interview to get to know you better. Prepare by learning what TUM.ai stands for and by following recent developments in AI.",
    },
    {
      title: "Onboarding weekend",
      when: words.onboarding,
      text: "Accepted applicants join the mandatory onboarding weekend: meet the members, join the social events and get to know TUM.ai.",
    },
  ];
}

/**
 * How the round selects members, as a numbered sequence: the stages are a
 * real order, so they carry numbers, each with its dates from the config.
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
          lead="Four stages, from your application to your first weekend as a member."
        />
        <ol className="border-hairline-strong border-t">
          {stages(call).map((stage, index) => (
            <Reveal
              as="li"
              key={stage.title}
              delay={index * 80}
              className="grid gap-x-10 gap-y-3 border-hairline border-b py-8 md:grid-cols-12 md:py-10"
            >
              <span
                aria-hidden="true"
                className="tabular text-highlight text-stat-sm md:col-span-1"
              >
                {index + 1}
              </span>
              <div className="md:col-span-5">
                <h3 className="text-fg text-heading-lg">{stage.title}</h3>
                <p className="mt-2 text-fg-subtle text-meta">{stage.when}</p>
              </div>
              <p className="max-w-xl text-body text-fg-muted md:col-span-6">
                {stage.text}
              </p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
