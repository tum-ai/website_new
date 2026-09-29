import {
  Container,
  Photo,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/ds";
import { mission, type Point, qualities, values } from "./data/apply";

/** A titled list of points on hairlines: the name, then its sentence. */
function PointList({
  title,
  points,
  id,
}: {
  title: string;
  points: Point[];
  id: string;
}) {
  return (
    <Reveal>
      <h3 id={id} className="font-medium text-fg-muted text-small">
        {title}
      </h3>
      <dl aria-labelledby={id} className="mt-5 border-hairline-strong border-t">
        {points.map((point) => (
          <div key={point.title} className="border-hairline border-b py-6">
            <dt className="text-fg text-heading-md">{point.title}</dt>
            <dd className="mt-2 max-w-xl text-body text-fg-muted">
              {point.text}
            </dd>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}

/**
 * The call's scope: the mission as the reason to apply, then what we look
 * for in applicants beside how members work together, and a batch photo.
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
          lead={mission}
        />
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-16">
          <PointList
            id="apply-qualities"
            title="What we look for"
            points={qualities}
          />
          <PointList
            id="apply-values"
            title="How we work together"
            points={values}
          />
        </div>
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
