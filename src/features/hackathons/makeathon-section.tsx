import {
  ButtonLink,
  Container,
  Ledger,
  Photo,
  Reveal,
  Section,
  SectionHeader,
  TextLink,
} from "@/components/ds";
import type { hackathonsView } from "./hackathons-view";
import { formatDayRange } from "./ribbon";

type View = ReturnType<typeof hackathonsView>;

/**
 * The flagship on paper: what the Makeathon is, a photo of its team, and
 * every edition as a ledger, newest first, the year set large like a
 * figure. The editions are the ribbon's top lane, read as a record.
 */
export function MakeathonSection({
  makeathon,
}: {
  makeathon: View["makeathon"];
}) {
  return (
    <Section
      tone="paper"
      spacing="lg"
      id="makeathon"
      aria-labelledby="makeathon-title"
      className="scroll-mt-header"
    >
      <Container>
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeader
              id="makeathon-title"
              layout="stack"
              title={makeathon.title}
              lead={makeathon.lead}
              actions={
                <ButtonLink
                  href={makeathon.url}
                  variant="outline"
                  arrow="external"
                >
                  {makeathon.linkLabel}
                </ButtonLink>
              }
            />
            <Reveal className="mt-12 md:mt-16">
              <Photo
                src={makeathon.photo.src}
                alt={makeathon.photo.alt}
                position={makeathon.photo.objectPosition}
                caption={makeathon.photoCaption}
                aspect="4/3"
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            </Reveal>
          </div>
          <Reveal className="lg:col-span-7 lg:pt-2">
            <Ledger
              items={makeathon.editions.map((edition) => ({
                label: edition.name,
                value: edition.start.slice(0, 4),
                note: (
                  <>
                    {formatDayRange(edition.start, edition.end)}. {edition.note}
                    {edition.link ? (
                      <>
                        {" "}
                        <TextLink href={edition.link.href} external>
                          {edition.link.label}
                        </TextLink>
                      </>
                    ) : null}
                  </>
                ),
              }))}
            />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
