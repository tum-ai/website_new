import {
  ButtonLink,
  Container,
  Eyebrow,
  KeyDates,
  LogoTile,
  Photo,
  Reveal,
  Section,
} from "@tum.ai/ui-kit";
import { isUnoptimizedRemoteImage } from "@/lib/image-optimization";
import { formatList } from "@/lib/words";
import type { hackathonsView } from "./hackathons-view";
import { SeasonRoute } from "./season-route";

type View = ReturnType<typeof hackathonsView>;

/** The area each partner logo gets, in rem² (a 7rem × 1.75rem wordmark). */
const LOGO_AREA = 12.25;

/** A logo's box at {@link LOGO_AREA}, so wordmarks and marks weigh the same. */
const logoBox = (aspect: number) => {
  const ratio = Math.min(6, Math.max(1, aspect));
  const height = Math.sqrt(LOGO_AREA / ratio);
  return { width: `${height * ratio}rem`, height: `${height}rem` };
};

/**
 * The league on ink, right after the hero: the band claims it (founded by
 * TUM.ai) and sets its name as large as the page goes, then shows the
 * season as a route lit up to today, the Grand Finale (its poster and
 * countdown, then once it is over its champion and recap photo, see
 * `finaleView`), and the season's partners. The standings and rules live on
 * the league's own site, which the band links to rather than repeats.
 */
export function LeagueSection({ league }: { league: View["league"] }) {
  const { finale, partners } = league;
  return (
    <Section
      tone="ink"
      spacing="xl"
      id="league"
      aria-labelledby="league-title"
      className="scroll-mt-header overflow-clip"
    >
      <Container>
        <Reveal>
          <Eyebrow>{league.eyebrow}</Eyebrow>
          <h2
            id="league-title"
            className="mt-6 max-w-[10em] text-balance text-display-2xl text-highlight"
          >
            {league.name}
          </h2>
          <p className="mt-8 text-display-md text-fg md:mt-10">
            {league.tagline}
          </p>
        </Reveal>
        <Reveal
          delay={100}
          className="mt-10 grid gap-8 md:mt-12 lg:grid-cols-12 lg:items-end lg:gap-16"
        >
          <p className="max-w-2xl text-fg-muted text-lead lg:col-span-7">
            {league.lead}
          </p>
          <div className="lg:col-span-5 lg:justify-self-end">
            <ButtonLink
              href={league.url}
              size="lg"
              arrow="external"
              aria-label={`${league.linkLabel}: ${league.name} (opens in a new tab)`}
            >
              {league.linkLabel}
            </ButtonLink>
          </div>
        </Reveal>

        <Reveal delay={120} className="mt-20 md:mt-28">
          <SeasonRoute
            stops={league.season}
            progress={league.progress}
            label={league.routeLabel}
            className="max-md:hidden"
          />
          <KeyDates items={league.dates} size="lg" className="md:hidden" />
        </Reveal>

        {finale ? (
          <div className="mt-20 grid items-center gap-10 md:mt-32 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <Photo
                src={finale.image.src}
                unoptimized={isUnoptimizedRemoteImage(finale.image.src)}
                alt={finale.image.alt}
                position={finale.image.objectPosition}
                caption={finale.caption}
                aspect="1/1"
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            </Reveal>
            <Reveal delay={100} className="lg:col-span-7">
              <p className="font-semibold text-highlight text-label">
                {finale.label}
              </p>
              <h3 className="mt-4 text-display-lg text-fg">
                {finale.city},{" "}
                <time dateTime={finale.dateTime}>{finale.dates}</time>
              </h3>
              {finale.countdown ? (
                <p className="tabular mt-5 text-display-md text-highlight">
                  {finale.countdown}
                </p>
              ) : null}
              {finale.result ? (
                <div className="mt-10 border-hairline-strong border-t pt-8">
                  <p className="font-semibold text-fg-muted text-label">
                    {finale.result.label}
                  </p>
                  <p className="mt-3 text-balance text-display-lg text-highlight">
                    {finale.result.champion}
                  </p>
                  {finale.result.runnersUp.length > 0 ? (
                    <p className="mt-5 text-fg-muted text-lead">
                      {finale.result.runnersUpLabel}:{" "}
                      <span className="text-fg">
                        {formatList(finale.result.runnersUp)}
                      </span>
                    </p>
                  ) : null}
                </div>
              ) : null}
              {finale.text ? (
                <p className="mt-6 max-w-xl text-fg-muted text-lead">
                  {finale.text}
                </p>
              ) : null}
              <div className="mt-10">
                <ButtonLink
                  href={league.url}
                  size="lg"
                  variant="inverse"
                  arrow="external"
                >
                  {finale.actionLabel}
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        ) : null}

        {partners.length > 0 ? (
          <Reveal className="mt-20 border-hairline-strong border-t pt-10 md:mt-32 md:pt-12">
            <h3 className="font-semibold text-fg text-small">
              {league.partnersTitle}
            </h3>
            <ul className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-8 lg:justify-between lg:gap-x-8">
              {partners.map((partner) => (
                <li
                  key={partner.name}
                  className="flex"
                  style={logoBox(partner.aspect)}
                >
                  <LogoTile
                    variant="bare"
                    name={partner.name}
                    src={partner.src}
                    unoptimized={isUnoptimizedRemoteImage(partner.src ?? "")}
                    href={partner.href}
                    className="size-full"
                  />
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}
      </Container>
    </Section>
  );
}
