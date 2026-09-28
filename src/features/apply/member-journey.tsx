import { Briefcase, GraduationCap, Users } from "lucide-react";
import type { ReactNode } from "react";
import {
  ButtonLink,
  Container,
  FeatureCard,
  Highlight,
  Reveal,
  Section,
  SectionHeader,
  type StepItem,
  Steps,
} from "@/components/ds";
import { yearsSinceFounding } from "@/config/community";
import { journeySteps } from "@/features/community";
import { WidePhoto } from "./wide-photo";

/** Inline emphasis inside journey copy. */
function Em({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-fg">{children}</strong>;
}

/** The member journey from its single source (features/community). */
const steps: StepItem[] = journeySteps.map((step) => ({
  id: step.step,
  number: step.step,
  title: step.name,
  description: step.description,
  icon: step.icon,
}));

const offerings = [
  {
    label: "ML Discussion Groups:",
    text: "Deep-tech sessions around Machine Learning, where we focus on specific papers, discuss implementations, mathematical background, and much more.",
  },
  {
    label: "AI Academy:",
    text: "Contribute to our AI Academy or partake in its offerings.",
  },
  {
    label: "Exclusive Workshops:",
    text: "From soft skills development to visits to industry giants like Google, Nvidia, and QuantCo, we offer a diverse range of workshops tailored to your interests.",
  },
];

type MemberJourneyProps = {
  /** The server's "now", for the initiative's age in the copy. */
  now: Date;
};

/**
 * The member journey as numbered steps (the full path lives on /community),
 * then the three kinds of work as a bento with the lecture-hall photo.
 */
export function MemberJourney({ now }: MemberJourneyProps) {
  return (
    <Section tone="lavender" spacing="lg" aria-labelledby="apply-journey-title">
      <Container>
        <SectionHeader
          id="apply-journey-title"
          eyebrow="Member journey"
          index={5}
          title={
            <>
              How our <Highlight>Community</Highlight> Works
            </>
          }
          lead={
            <>
              The <Em>member journey</Em> at TUM.ai spans across semesters, each
              lasting 6 whole months. When you join the TUM.ai community, here's
              what you can expect:
            </>
          }
        />

        <WidePhoto
          src="/assets/apply/new_section_photo_3.webp"
          alt="TUM.ai members together on stage at an event"
          aspectClassName="aspect-[16/10] sm:aspect-[2/1] lg:aspect-[1920/560]"
          positionClassName="object-[50%_35%]"
        />

        <Steps
          items={steps}
          columns={3}
          rail="none"
          className="mt-16 md:mt-24"
        />
        <div className="mt-12">
          <ButtonLink href="/community" variant="outline" arrow>
            Learn more
          </ButtonLink>
        </div>

        <div className="mt-16 grid gap-4 md:mt-24 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
          <Reveal className="lg:col-start-1 lg:row-start-1">
            <FeatureCard icon={Briefcase} title="Project work">
              <p>
                Depending on your expertise and capabilities, we aim for you to
                gain the proficiency needed to oversee a machine learning
                project from its inception to completion, whether in a research
                or industrial context. This is an opportunity to leverage your
                existing skills while cultivating new ones. You'll work on
                everything from communication and tech skills to teamwork and
                time management here.
              </p>
            </FeatureCard>
          </Reveal>
          <Reveal delay={90} className="lg:col-start-2 lg:row-start-1">
            <FeatureCard icon={Users} title="Organizational work">
              <p>
                In just {yearsSinceFounding(now)} years, TUM.ai has experienced
                exponential growth, primarily fuelled by our dedicated members'
                brilliant ideas and ventures. We envision TUM.ai as a playground
                for your innovative ideas. Whether connecting with high schools
                and giving AI lessons there, organizing hackathons and summits,
                trips, participating in RnD projects, or collaborating with
                other initiatives, TUM.ai is about turning your visions into
                reality. Your dedication and drive are what make TUM.ai truly
                special.
              </p>
            </FeatureCard>
          </Reveal>
          <Reveal
            delay={180}
            className="md:col-span-2 lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:row-start-1"
          >
            <FeatureCard icon={GraduationCap} title="Education offerings">
              <p>
                There's so much happening at TUM.ai that sometimes it's hard to
                keep up! Our aim is to help you grow, both personally and in
                your knowledge. Here's just a glimpse of what we offer:
              </p>
              <ul className="mt-5 divide-y divide-hairline border-hairline border-y">
                {offerings.map((offering) => (
                  <li key={offering.label} className="py-4">
                    <strong className="font-semibold text-fg">
                      {offering.label}
                    </strong>{" "}
                    {offering.text}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-fg">
                If you ever feel like something&apos;s missing, together with
                the TUM.ai family, you can make it happen.
              </p>
            </FeatureCard>
          </Reveal>
          <WidePhoto
            className="md:col-span-2 lg:col-start-1 lg:row-start-2"
            src="/assets/apply/new_section_photo_4.webp"
            alt="A packed lecture hall during a TUM.ai presentation"
            aspectClassName="aspect-[4/3] sm:aspect-[2/1] lg:aspect-auto lg:h-full lg:min-h-80"
            positionClassName="object-[60%_50%]"
            radiusClassName="rounded-3xl"
            sizes="(min-width: 80rem) 54rem, (min-width: 1024px) 66vw, 100vw"
          />
        </div>
      </Container>
    </Section>
  );
}
