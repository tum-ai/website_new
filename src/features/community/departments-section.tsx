import {
  Container,
  Photo,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/ds";
import type { Department } from "@/lib/community-model";
import type { CommunityCopy } from "./data/copy";

/**
 * The departments behind the initiative track, as a hairline-ruled roster:
 * the name, what the team does in its own words, and a photo of the team or
 * its work where we have a real one. No cards and no counters: the roster
 * has no order to encode.
 */
export function DepartmentsSection({
  copy,
  departments,
}: {
  copy: CommunityCopy["departments"];
  departments: readonly Department[];
}) {
  return (
    <Section
      tone="mist"
      spacing="lg"
      id="departments"
      aria-labelledby="departments-title"
    >
      <Container>
        <SectionHeader
          id="departments-title"
          title={copy.title}
          size="lg"
          layout="stack"
          lead={copy.lead}
        />
        <ul className="border-hairline-strong border-t">
          {departments.map((department) => (
            <Reveal
              as="li"
              key={department.name}
              className="grid gap-x-12 gap-y-5 border-hairline border-b py-10 md:grid-cols-12 lg:py-12"
            >
              <h3 className="text-fg text-heading-lg md:col-span-4">
                {department.name}
              </h3>
              <p className="max-w-xl text-body text-fg-muted md:col-span-8 lg:col-span-5">
                {department.description}
              </p>
              {department.photo ? (
                <Photo
                  src={department.photo.src}
                  alt={department.photo.alt}
                  caption={department.photoCaption}
                  position={department.photo.objectPosition}
                  aspect="4/3"
                  sizes="(min-width: 1024px) 22vw, (min-width: 768px) 60vw, 100vw"
                  className="mt-2 md:col-span-8 md:col-start-5 lg:col-span-3 lg:mt-0"
                />
              ) : null}
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
