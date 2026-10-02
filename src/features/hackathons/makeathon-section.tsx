import Image from "next/image";
import {
  ButtonLink,
  Container,
  Eyebrow,
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
 * The flagship in two bands. The opener on night is the team on stage,
 * full bleed: the name set as large as the league's, what the Makeathon
 * is, its figures, and the way to its own site. Then on paper every
 * edition as a ledger, newest first, the year set large like a figure (the
 * ribbon's top lane, read as a record), beside a photo that stays in view.
 */
export function MakeathonSection({
  makeathon,
}: {
  makeathon: View["makeathon"];
}) {
  const { photo } = makeathon;
  return (
    <>
      <Section
        tone="night"
        spacing="none"
        id="makeathon"
        aria-labelledby="makeathon-title"
        className="scroll-mt-header overflow-clip"
      >
        <div className="relative flex min-h-[88svh] flex-col justify-end">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="100vw"
            className="-z-10 object-cover"
            style={{ objectPosition: photo.objectPosition }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-t from-canvas via-canvas/80 to-canvas/10 lg:bg-linear-to-r lg:via-canvas/65 lg:to-canvas/45"
          />
          <Container className="pt-48 pb-16 md:pt-64 md:pb-20">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-16">
              <div className="lg:col-span-7">
                <Reveal>
                  <Eyebrow>{makeathon.eyebrow}</Eyebrow>
                  <h2
                    id="makeathon-title"
                    className="mt-6 text-display-2xl text-highlight"
                  >
                    {makeathon.title}
                  </h2>
                </Reveal>
                <Reveal delay={80}>
                  <p className="mt-8 max-w-xl text-fg text-lead md:mt-10">
                    {makeathon.lead}
                  </p>
                </Reveal>
                <Reveal delay={120} className="mt-10">
                  <ButtonLink
                    href={makeathon.url}
                    size="lg"
                    arrow="external"
                    aria-label={`${makeathon.linkLabel}: ${makeathon.title}`}
                  >
                    {makeathon.linkLabel}
                  </ButtonLink>
                </Reveal>
              </div>
              <Reveal delay={160} className="lg:col-span-5">
                <Ledger
                  size="lg"
                  items={makeathon.figures.map(({ value, label }) => ({
                    label,
                    value,
                  }))}
                />
              </Reveal>
            </div>
            <p className="mt-12 text-fg-muted text-meta md:mt-16">
              {makeathon.photoCaption}
            </p>
          </Container>
        </div>
      </Section>

      <Section
        tone="paper"
        spacing="lg"
        aria-labelledby="makeathon-editions-title"
      >
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-[calc(var(--header-height)+2rem)]">
                <SectionHeader
                  id="makeathon-editions-title"
                  layout="stack"
                  title={makeathon.editionsTitle}
                />
                <Reveal className="mt-12 md:mt-16">
                  <Photo
                    src={makeathon.editionsPhoto.src}
                    alt={makeathon.editionsPhoto.alt}
                    position={makeathon.editionsPhoto.objectPosition}
                    caption={makeathon.editionsPhotoCaption}
                    aspect="4/3"
                    sizes="(min-width: 1024px) 40vw, 100vw"
                  />
                </Reveal>
              </div>
            </div>
            <Reveal className="lg:col-span-7 lg:pt-2">
              <Ledger
                items={makeathon.editions.map((edition) => ({
                  label: edition.name,
                  value: edition.start.slice(0, 4),
                  note: (
                    <>
                      {formatDayRange(edition.start, edition.end, {
                        year: false,
                      })}
                      . {edition.note}
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
    </>
  );
}
