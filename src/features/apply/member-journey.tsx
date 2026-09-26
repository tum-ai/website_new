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
} from "@/components/ds";
import { WidePhoto } from "./wide-photo";

/** Inline emphasis inside journey copy. */
function Em({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-fg">{children}</strong>;
}

type JourneyStep = { title: string; body: ReactNode };

const journey: JourneyStep[] = [
  {
    title: "Initial Onboarding",
    body: (
      <p>
        Dive right into an onboarding weekend where you'll get acquainted with
        your batch, familiarize yourself with the internal TUM.ai frameworks,
        hone your ideation skills, and discover various opportunities TUM.ai
        offers.
      </p>
    ),
  },
  {
    title: "Research or Initiative Track: Choose Your Path at TUM.ai",
    body: (
      <>
        <p>
          In your first semester, you can choose{" "}
          <Em>either the Research Track</Em> or <Em>the Initiative Track</Em> -
          two distinct ways to leave your mark at <Em>TUM.ai</Em>.
        </p>
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <li className="rounded-3xl border border-hairline bg-raised p-6 shadow-soft">
            <h4 className="text-fg text-heading-sm">Research Track</h4>
            <p className="mt-2 text-small">
              You'll join a dedicated team working on an <Em>Impact Project</Em>
              , aligned with your skill set. These projects are designed to
              contribute to the broader research community, with the goal of
              achieving tangible outcomes such as <Em>publications</Em>.
            </p>
          </li>
          <li className="rounded-3xl border border-hairline bg-raised p-6 shadow-soft">
            <h4 className="text-fg text-heading-sm">Initiative Track</h4>
            <p className="mt-2 text-small">
              Join one of our <Em>core departments</Em> and become a driving
              force behind everything that makes TUM.ai stand out. In this
              track, you'll dive into exciting projects, collaborate with
              motivated peers, and help shape the future of our community.
              Whether it's launching new ideas, strengthening our network, or
              making the day-to-day magic happen - you'll be at the heart of it
              all, growing your skills while making TUM.ai better for everyone.
            </p>
          </li>
        </ul>
        <p>
          Regardless of your track, your first semester is not just about
          completing tasks. You'll have the chance to engage deeply with our
          vibrant community, develop new skills, and participate in learning
          opportunities, trips, and special events.
        </p>
        <div>
          <ButtonLink href="/community" variant="outline" arrow>
            Learn more
          </ButtonLink>
        </div>
      </>
    ),
  },
  {
    title: "Growth Opportunities",
    body: (
      <p>
        After your first semester, your journey at TUM.ai doesn't end with your
        initial project. You'll have the opportunity to further shape the
        initiative by{" "}
        <Em>
          founding a strategic task force, joining a department or task force
          that's new to you
        </Em>{" "}
        or <Em>continuing in your current department</Em>, potentially taking on
        a <Em>Team Lead</Em> role.
      </p>
    ),
  },
  {
    title: "Research Exchange",
    body: (
      <p>
        After one semester, we can send you off to conduct research at
        prestigious institutions such as <Em>MIT, Harvard,</Em> or{" "}
        <Em>Berkeley</Em> as part of the Research Exchange (REX) Program.
        Through our network of alumni, we will not only help you find the right
        topic but also support you with the bureaucracy.
      </p>
    ),
  },
  {
    title: "Alumni Program",
    body: (
      <p>
        Once you've been with us for two semesters, you're eligible to join the{" "}
        <Em>TUM.ai Alumni Program</Em>, marking an important milestone in your
        journey and opening up further opportunities for collaboration and
        networking.
      </p>
    ),
  },
];

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

/**
 * The member journey: numbered steps as editorial rows (the step title stays
 * pinned beside long copy on wide screens), then the three kinds of work as a
 * bento with the lecture-hall photo.
 */
export function MemberJourney() {
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

        <ol className="mt-16 border-hairline-strong border-t md:mt-24">
          {journey.map((step, index) => (
            <Reveal
              as="li"
              key={step.title}
              className="grid gap-x-8 gap-y-5 border-hairline border-b py-10 md:grid-cols-[3.5rem_minmax(0,1fr)] md:py-12 lg:grid-cols-[3.5rem_minmax(0,0.85fr)_minmax(0,1.4fr)] lg:gap-x-12 lg:py-14"
            >
              <span
                aria-hidden
                className="tabular grid size-12 place-items-center rounded-full border border-hairline-strong bg-raised font-semibold text-fg text-small md:row-span-2 lg:sticky lg:top-32 lg:row-span-1 lg:self-start"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-fg text-heading-lg md:col-start-2 lg:sticky lg:top-32 lg:self-start">
                {step.title}
              </h3>
              <div className="flex flex-col gap-5 text-body text-fg-muted md:col-start-2 lg:col-start-3 lg:row-start-1">
                {step.body}
              </div>
            </Reveal>
          ))}
        </ol>

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
                In just 4.5 years, TUM.ai has experienced exponential growth,
                primarily fuelled by our dedicated members' brilliant ideas and
                ventures. We envision TUM.ai as a playground for your innovative
                ideas. Whether connecting with high schools and giving AI
                lessons there, organizing hackathons and summits, trips,
                participating in RnD projects, or collaborating with other
                initiatives, TUM.ai is about turning your visions into reality.
                Your dedication and drive are what make TUM.ai truly special.
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
