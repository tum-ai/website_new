import {
  Container,
  Eyebrow,
  Highlight,
  Reveal,
  Section,
  Timeline,
  type TimelineItem,
} from "@/components/ds";
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
      "Biggest Makeathon yet with 500+ registrations",
      "TUM.ai Hackathon Summer with AWS, Lovable, ElevenLabs, Google, Anthropic, etc.",
    ],
  },
];

const items: TimelineItem[] = steps.map((step) => ({
  title: (
    <span className="tabular text-display-md font-medium tracking-[-0.05em]">
      {step.year}
    </span>
  ),
  description: (
    <ul className="mt-5 divide-y divide-hairline border-t border-hairline">
      {step.content.map((item) => (
        <li key={item} className="flex gap-4 py-3.5 text-body text-fg-muted">
          <span
            aria-hidden
            className="mt-[0.7em] h-px w-3 shrink-0 bg-violet-500"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  ),
}));

/** Sticky heading beside a timeline whose rail fills as the years scroll by. */
export function Milestones() {
  return (
    <Section tone="paper" spacing="lg" aria-labelledby="apply-milestones-title">
      <Container className="grid gap-14 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal>
            <Eyebrow index={3}>Since {organizationFacts.foundingYear}</Eyebrow>
          </Reveal>
          <Reveal delay={60}>
            <h2
              id="apply-milestones-title"
              className="mt-5 text-display-md text-fg"
            >
              Our <Highlight>Milestones</Highlight>
            </h2>
          </Reveal>
        </div>
        <Timeline items={items} />
      </Container>
    </Section>
  );
}
