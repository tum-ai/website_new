import {
  Container,
  Highlight,
  Section,
  SectionHeader,
  Timeline,
  type TimelineItem,
} from "@/components/ds";
import { communityFacts } from "@/config/community";
import { organizationFacts } from "@/config/organization";

const steps = [
  {
    year: "2020",
    content: [
      "Official Accreditation as a Student Initiative at TUM",
      "Development of a first concept for the initiative at the BusinessPlan-Seminar at UnternehmerTUM",
      "First Application Phase",
    ],
  },
  {
    year: "2021",
    content: [
      "TUM.ai officially a non-profit organization",
      "Launch of the first TUM.ai Makeathon",
      "Launch of the first Industry Phase",
      "Launch of the first AI Academy",
      "First Participation in ETH AI Center Summit",
    ],
  },
  {
    year: "2022",
    content: [
      "First Start-Up tour in Berlin",
      "First AI Bootcamp in collaboration with KNUST",
      "Launch of the AI Entrepreneur-Lab 1.0",
    ],
  },
  {
    year: "2023",
    content: [
      "Launch of the AI.Summit (2-day conference)",
      "Speaker at the TUM Dies Academicus",
    ],
  },
  {
    year: "2024",
    content: [
      "Launch of the Impact Projects with 10 cooperation partners (MIT, Unite, MI4People, Allianz, IBM Research, Flower)",
      "First paper publications at NeurIPS '24",
      "Launch of new Taskforces (Med.ai, TUM.ai Build, TUM.ai Robotics)",
    ],
  },
  {
    year: "2025",
    content: [
      "First Smaller-sized Hackathon with Aleph Alpha",
      "Launch of TUM.ai Expansion Berlin",
      "First ever event together with OpenAI after their office launch in Munich (1200+ signups)",
      "ICML main track paper, ICLR publication",
      `Biggest Makeathon yet with ${communityFacts.makeathonSize}+ registrations`,
      "TUM.ai Hackathon Summer with AWS, Lovable, ElevenLabs, Google, Anthropic, etc.",
    ],
  },
];

const items: TimelineItem[] = steps.map((step) => ({
  title: (
    <span className="tabular font-medium text-display-md tracking-[-0.05em]">
      {step.year}
    </span>
  ),
  description: (
    <ul className="mt-5 divide-y divide-hairline border-hairline border-t">
      {step.content.map((item) => (
        <li key={item} className="flex gap-4 py-3.5 text-body text-fg-muted">
          <span
            aria-hidden="true"
            className="mt-[0.7em] h-px w-3 shrink-0 bg-violet-500"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  ),
}));

/**
 * The ds Timeline lights each marker from an IntersectionObserver even under
 * reduced motion, so its static render depended on scroll timing (a flaky
 * visual baseline). Under `prefers-reduced-motion` every marker shows its
 * final, lit state instead.
 * TODO(W3): drop once the ds Timeline renders a static final state under
 * reduced motion (handoff in the Apply+Community PR).
 */
const staticMarkers =
  "motion-reduce:[&_[data-index]>span>span]:scale-100 motion-reduce:[&_[data-index]>span>span]:bg-violet-500 motion-reduce:[&_[data-index]>span]:border-violet-500 motion-reduce:[&_[data-index]>span]:shadow-halo";

/** Sticky heading beside a timeline whose rail fills as the years scroll by. */
export function Milestones() {
  return (
    <Section tone="paper" spacing="lg" aria-labelledby="apply-milestones-title">
      <Container className="grid gap-14 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-20">
        <SectionHeader
          id="apply-milestones-title"
          eyebrow={`Since ${organizationFacts.foundingYear}`}
          index={3}
          layout="stack"
          title={
            <>
              Our <Highlight>Milestones</Highlight>
            </>
          }
          className="mb-0 md:mb-0 lg:sticky lg:top-32 lg:self-start"
        />
        <Timeline items={items} className={staticMarkers} />
      </Container>
    </Section>
  );
}
