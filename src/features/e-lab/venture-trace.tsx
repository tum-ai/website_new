import {
  Container,
  LogoTile,
  QuoteCard,
  Reveal,
  Section,
  SectionHeader,
  TextLink,
} from "@/components/ds";
import { eLabCompletedIterations, eLabConfig } from "@/config/e-lab";
import { gates } from "./data/selection";
import {
  notableStartups,
  testimonialCards,
  tracedVenture,
} from "./data/venture-page";

const venture = notableStartups.find(
  (startup) => startup.id === tracedVenture.startupId,
);
const founder = testimonialCards.find(
  (card) => card.id === tracedVenture.testimonialId,
);
const otherVentures = notableStartups.filter(
  (startup) => startup.id !== tracedVenture.startupId,
);

/** "tenmin.ai" from "https://tenmin.ai/". */
const hostOf = (href: string) => new URL(href).hostname.replace(/^www\./, "");

/**
 * One venture followed through the gates (the page's bold element, in
 * miniature): the founder's words beside the gates the team passed and where
 * it went next. Below it, the other alumni ventures, each linked.
 */
export function VentureTrace() {
  if (!venture || !founder) return null;
  return (
    <Section tone="ink" spacing="lg" aria-labelledby="venture-trace-title">
      <Container>
        <SectionHeader
          id="venture-trace-title"
          title="One team, all the way through."
          size="lg"
          layout="stack"
          lead={`${venture.name} came out of ${tracedVenture.cohort} and went on to ${tracedVenture.next}.`}
        />
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-7">
            <QuoteCard
              variant="editorial"
              quote={founder.quote}
              name={founder.name}
              byline={founder.role}
              portrait={{ src: founder.portraitSrc }}
            />
          </Reveal>
          <Reveal delay={120} className="lg:col-span-4 lg:col-start-9">
            <Trail />
          </Reveal>
        </div>

        <div className="mt-20 border-hairline-strong border-t pt-10 md:mt-28">
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-12">
            <h3 className="text-fg text-heading-lg lg:col-span-4">
              Also built in the E-Lab
            </h3>
            <p className="max-w-xl text-body text-fg-muted lg:col-span-8">
              Ventures from {eLabCompletedIterations} cohorts have raised €
              {eLabConfig.ventureFundingMillions}M so far.
            </p>
          </div>
          <ul className="mt-10 grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
            {otherVentures.map((startup) => (
              <li
                key={startup.id}
                className="flex items-center justify-between gap-4 border-hairline border-t py-5"
              >
                <LogoTile
                  variant="chip"
                  name={startup.name}
                  src={startup.logoSrc}
                  alt={startup.logoAlt}
                  wordmark={startup.wordmarkLabel}
                />
                <TextLink href={startup.href} arrow className="text-small">
                  {hostOf(startup.href)}
                </TextLink>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}

/**
 * The team's way through the gates, on a rail: every gate it passed, then
 * where it went after the Final Pitch.
 */
function Trail() {
  if (!venture) return null;
  return (
    <div>
      <div className="flex items-center justify-between gap-4 border-hairline-strong border-b pb-5">
        <LogoTile
          variant="chip"
          name={venture.name}
          src={venture.logoSrc}
          alt={venture.logoAlt}
          wordmark={venture.wordmarkLabel}
        />
        <TextLink href={venture.href} arrow className="text-small">
          {hostOf(venture.href)}
        </TextLink>
      </div>
      <ol className="relative mt-6 space-y-5 pl-7">
        <span
          aria-hidden="true"
          className="absolute top-2 bottom-2 left-1.25 w-0.5 bg-highlight"
        />
        {gates.map((gate) => (
          <li key={gate.id} className="relative text-body text-fg-muted">
            <span
              aria-hidden="true"
              className="absolute top-1/2 -left-7 size-3 -translate-y-1/2 rounded-full bg-highlight ring-4 ring-canvas"
            />
            {gate.name}
          </li>
        ))}
        <li className="relative pt-3 text-fg text-heading-md">
          <span
            aria-hidden="true"
            className="absolute top-[calc(50%+0.375rem)] -left-7 size-3 -translate-y-1/2 rounded-full border-2 border-highlight bg-canvas"
          />
          {tracedVenture.next}
        </li>
      </ol>
    </div>
  );
}
