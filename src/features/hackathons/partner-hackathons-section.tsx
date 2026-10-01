import {
  Container,
  Photo,
  QuoteCard,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/ds";
import { Lockup, SignUpAction } from "@/features/events";
import { formatList } from "@/lib/words";
import type { hackathonsView } from "./hackathons-view";

type View = ReturnType<typeof hackathonsView>;

/** A partner's voice on one of these hackathons, with its photo. */
export type HackathonVoice = {
  quote: string;
  name: string;
  byline?: string;
  image: { src: string; alt: string; position?: string };
};

/**
 * The hackathons between Makeathons on mist: a hairline register of the
 * CMS events, newest first, beside a partner's own words about one of
 * them. Each row is a fact (title, dates, place, co-hosts), no cards.
 */
export function PartnerHackathonsSection({
  partners,
  voice,
}: {
  partners: View["partners"];
  voice?: HackathonVoice;
}) {
  if (partners.rows.length === 0) return null;
  return (
    <Section
      tone="mist"
      spacing="lg"
      aria-labelledby="partner-hackathons-title"
    >
      <Container>
        <SectionHeader
          id="partner-hackathons-title"
          title={partners.title}
          lead={partners.lead}
        />
        <div className="mt-14 grid gap-14 md:mt-20 lg:grid-cols-12 lg:gap-16">
          <ol className="border-hairline-strong border-t lg:col-span-7">
            {partners.rows.map((row) => (
              <li
                key={row.id}
                className="grid gap-x-8 gap-y-2 border-hairline border-b py-6 sm:grid-cols-[minmax(0,1fr)_auto] md:py-7"
              >
                <div className="min-w-0">
                  <h3 className="text-fg text-heading-sm">
                    <Lockup title={row.title} />
                  </h3>
                  {row.place || row.hosts.length > 0 ? (
                    <p className="mt-1.5 text-fg-muted text-meta">
                      {[
                        row.place,
                        row.hosts.length > 0
                          ? `with ${formatList(row.hosts)}`
                          : "",
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-baseline gap-4 sm:flex-col sm:items-end sm:gap-3">
                  <time
                    dateTime={row.dateTime}
                    className="tabular text-fg-muted text-small sm:text-right"
                  >
                    {row.dates}
                  </time>
                  {row.signUp ? (
                    <SignUpAction title={row.title} signUp={row.signUp} />
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
          {voice ? (
            <Reveal className="lg:col-span-5">
              <Photo
                src={voice.image.src}
                alt={voice.image.alt}
                position={voice.image.position}
                aspect="4/3"
                sizes="(min-width: 1024px) 36vw, 100vw"
              />
              <QuoteCard
                variant="ruled"
                className="mt-10"
                quote={voice.quote}
                name={voice.name}
                byline={voice.byline}
              />
            </Reveal>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
