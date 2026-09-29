import {
  Container,
  Photo,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/ds";
import { brandMission } from "@/config/organization";
import { notRequired, qualities, values } from "./data/apply";

/**
 * The call's scope, as a call for papers states it: what is in scope (the
 * four qualities, set large) beside what is not required, then how members
 * work together in one line per value, and a batch photo.
 */
export function WhoShouldApply() {
  return (
    <Section tone="paper" spacing="lg" aria-labelledby="apply-scope-title">
      <Container>
        <SectionHeader
          id="apply-scope-title"
          title="Who should apply"
          size="lg"
          layout="stack"
          lead={brandMission}
        />

        <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-7">
            <h3
              id="apply-in-scope"
              className="font-medium text-fg-muted text-small"
            >
              In scope
            </h3>
            <dl
              aria-labelledby="apply-in-scope"
              className="mt-5 border-hairline-strong border-t"
            >
              {qualities.map((quality) => (
                <div
                  key={quality.title}
                  className="border-hairline border-b py-5 md:py-6"
                >
                  <dt className="text-display-md text-fg">{quality.title}</dt>
                  <dd className="mt-2 text-fg-muted text-small">
                    {quality.text}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-4 lg:col-start-9">
            <h3
              id="apply-not-required"
              className="font-medium text-fg-muted text-small"
            >
              Not required
            </h3>
            <dl
              aria-labelledby="apply-not-required"
              className="mt-5 border-hairline-strong border-t"
            >
              {notRequired.map((point) => (
                <div
                  key={point.title}
                  className="border-hairline border-b py-5 md:py-6"
                >
                  <dt className="text-fg-muted text-heading-lg">
                    {point.title}
                  </dt>
                  <dd className="mt-2 text-fg-subtle text-small">
                    {point.text}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal className="mt-16 md:mt-24">
          <h3
            id="apply-values"
            className="font-medium text-fg-muted text-small"
          >
            How we work together
          </h3>
          <dl
            aria-labelledby="apply-values"
            className="mt-5 grid gap-x-10 gap-y-8 border-hairline-strong border-t pt-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {values.map((value) => (
              <div key={value.title}>
                <dt className="text-fg text-heading-sm">{value.title}</dt>
                <dd className="mt-2 text-fg-muted text-small">{value.text}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal variant="fade" className="mt-16 md:mt-24">
          <Photo
            aspect="panorama"
            src="/assets/apply/new_section_photo_1.webp"
            alt="A large group of TUM.ai members in winter jackets, gathered in front of a baroque building"
            // TODO(content): caption. Which batch or event is this, where,
            // and when?
            position="50% 45%"
            sizes="(min-width: 80rem) 80rem, 100vw"
          />
        </Reveal>
      </Container>
    </Section>
  );
}
