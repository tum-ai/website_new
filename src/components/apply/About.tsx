import {
  Container,
  Eyebrow,
  Highlight,
  Reveal,
  Section,
  StatGrid,
} from "@/components/ds";

/** Figures quoted in this page's own copy (About and Values). */
const figures = [
  { value: 90, suffix: "+", label: "Active members" },
  { value: 20, suffix: "+", label: "Majors" },
  { value: 35, suffix: "+", label: "Nationalities" },
];

export default function About() {
  return (
    <Section tone="paper" spacing="lg" aria-labelledby="apply-about-title">
      <Container>
        <Reveal>
          <Eyebrow index={1}>About us</Eyebrow>
        </Reveal>
        {/* Headline and copy share one top line. */}
        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-20">
          <Reveal delay={60}>
            <h2 id="apply-about-title" className="text-display-lg text-fg">
              We are <Highlight>TUM.ai</Highlight>
            </h2>
          </Reveal>
          <Reveal delay={140} className="lg:pt-2">
            <p className="text-lead text-fg md:text-[1.375rem] md:leading-[1.55]">
              As a leading student initiative focused on AI, we bring together a
              diverse group of over 90 active members, each with technical
              skills and cultural backgrounds. Our community consists of
              passionate AI enthusiasts who are determined to make an impact on
              the AI landscape worldwide. The journey towards shaping the future
              of AI is open to everyone – including you!
            </p>
          </Reveal>
        </div>
        <Reveal delay={100} className="mt-14 md:mt-20">
          <StatGrid items={figures} columns={3} />
        </Reveal>
      </Container>
    </Section>
  );
}
