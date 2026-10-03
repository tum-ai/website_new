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
import { MakeathonDawn } from "./makeathon-dawn";
import { formatDayRange } from "./ribbon";

type View = ReturnType<typeof hackathonsView>;

/**
 * The flagship in two bands. The opener on night is the hour before the
 * Makeathon site's sunrise (`MakeathonDawn`): its dots gather above a
 * horizon, its sun waits below it, and above them the name set as large as
 * the league's, what the Makeathon is, its figures, and the way to its own
 * site, where the sun rises. Then on paper every
 * edition as a ledger, newest first, the year set large like a figure (the
 * ribbon's top lane, read as a record), beside a photo that stays in view.
 */
export function MakeathonSection({
  makeathon,
}: {
  makeathon: View["makeathon"];
}) {
  return (
    <>
      <Section
        tone="night"
        spacing="none"
        id="makeathon"
        aria-labelledby="makeathon-title"
        className="scroll-mt-header overflow-clip"
      >
        <MakeathonDawn>
          <Container className="pt-40 pb-24 md:pt-56 md:pb-32">
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
                    aria-label={`${makeathon.linkLabel}: ${makeathon.title} (opens in a new tab)`}
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
          </Container>
        </MakeathonDawn>
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
