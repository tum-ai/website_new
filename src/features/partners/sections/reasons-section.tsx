import { BriefcaseBusiness, Network, Users } from "lucide-react";
import {
  Container,
  IconBadge,
  Reveal,
  Section,
  SectionHeader,
  SpotlightCard,
} from "@/components/ds";
import { partnerReasons } from "../data/partners";
import { ContactRow } from "./contact-row";

const reasonIcons = [Users, BriefcaseBusiness, Network];

/** Why partner: talent, decision makers and reach, then a contact row. */
export function ReasonsSection() {
  return (
    <Section tone="night" grain aria-labelledby="partner-reasons-title">
      <Container>
        <SectionHeader
          id="partner-reasons-title"
          title={
            <>
              Your next advantage
              <br />
              is already here.
            </>
          }
          lead="Exceptional talent. Tomorrow’s decision makers. A community moving AI forward."
        />
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
          {partnerReasons.map((reason, index) => (
            <Reveal
              as="article"
              key={reason.name}
              delay={index * 90}
              className="h-full"
            >
              <SpotlightCard
                padding="lg"
                className="flex h-full flex-col md:max-lg:grid md:max-lg:grid-cols-[12rem_minmax(0,1fr)] md:max-lg:gap-x-10"
              >
                <div className="flex items-center gap-3 self-start font-semibold text-highlight text-small">
                  <IconBadge icon={reasonIcons[index]} interactive />
                  <span>{reason.name}</span>
                </div>
                <div className="mt-10 md:max-lg:mt-0 lg:mt-14">
                  <h3 className="text-fg text-heading-md lg:text-heading-lg">
                    {reason.title}
                  </h3>
                  <p className="mt-4 text-fg-muted text-small">
                    {reason.description}
                  </p>
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
        <ContactRow title="Let’s talk." />
      </Container>
    </Section>
  );
}
