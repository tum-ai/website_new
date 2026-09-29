import {
  Container,
  LogoTile,
  LogoWall,
  QuoteCard,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/ds";
import { eLabCompletedIterations, eLabConfig } from "@/config/e-lab";
import { gates } from "./data/selection";
import {
  type NotableStartup,
  type TracedVenture,
  tracedVentureLead,
} from "./data/venture-page";
import {
  getNotableStartups,
  getTestimonialCards,
  getTracedVenture,
} from "./venture-content";

/**
 * One venture followed through the gates (the page's bold element, in
 * miniature): the founder's words beside the gates the team passed and where
 * it went next. Below it, the other alumni ventures, each linked. Ventures,
 * quotes and the trace come from the venture slice (the CMS or the code);
 * the section hides when the traced venture or its founder quote is missing.
 */
export async function VentureTrace() {
  const [startups, cards, trace] = await Promise.all([
    getNotableStartups(),
    getTestimonialCards(),
    getTracedVenture(),
  ]);
  const venture = startups.find((startup) => startup.id === trace.startupId);
  const founder = cards.find((card) => card.id === trace.testimonialId);
  const otherVentures = startups.filter(
    (startup) => startup.id !== trace.startupId,
  );
  if (!venture || !founder) return null;
  return (
    <Section tone="ink" spacing="lg" aria-labelledby="venture-trace-title">
      <Container>
        <SectionHeader
          id="venture-trace-title"
          title="One team, all the way through."
          size="lg"
          layout="stack"
          lead={tracedVentureLead(venture.name, trace)}
        />
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-7 lg:self-start">
            <QuoteCard
              variant="editorial"
              quote={founder.quote}
              name={founder.name}
              byline={founder.role}
              portrait={{ src: founder.portraitSrc }}
            />
          </Reveal>
          <Reveal delay={120} className="lg:col-span-4 lg:col-start-9">
            <Trail venture={venture} trace={trace} />
          </Reveal>
        </div>

        <div className="mt-20 border-hairline-strong border-t pt-10 md:mt-28">
          <h3 className="grid gap-4 lg:grid-cols-12 lg:items-end lg:gap-12">
            <span className="tabular text-display-2xl text-highlight lg:col-span-5">
              €{eLabConfig.ventureFundingMillions}M
            </span>
            <span className="max-w-md text-fg text-heading-lg lg:col-span-7 lg:justify-self-end lg:pb-3 lg:text-right">
              raised so far by ventures from {eLabCompletedIterations} E-Lab
              cohorts, including these.
            </span>
          </h3>
          <LogoWall
            logos={otherVentures.map((startup) => ({
              name: startup.name,
              src: startup.logoSrc,
              alt: startup.logoAlt,
              href: startup.href,
              wordmark: startup.wordmarkLabel,
            }))}
            columns={6}
            size="md"
            label="Ventures from the E-Lab"
            className="mt-10"
          />
        </div>
      </Container>
    </Section>
  );
}

/**
 * The team's way through the gates, on a rail: every gate it passed (filled
 * markers), then what it did after the E-Lab (open markers). Local rather than ds `Steps`, whose
 * rail is horizontal and whose `rows` layout has no markers; a vertical
 * dot-rail variant of `Steps` is a ds handoff.
 */
function Trail({
  venture,
  trace,
}: {
  venture: NotableStartup;
  trace: TracedVenture;
}) {
  return (
    <div>
      <div className="border-hairline-strong border-b pb-5">
        <LogoTile
          variant="chip"
          name={venture.name}
          src={venture.logoSrc}
          alt={venture.logoAlt}
          href={venture.href}
          wordmark={venture.wordmarkLabel}
        />
      </div>
      <ol className="relative mt-6 space-y-5 pl-7 before:absolute before:top-2 before:bottom-2 before:left-1.25 before:w-0.5 before:bg-highlight">
        {gates.map((gate) => (
          <li key={gate.id} className="relative text-body text-fg-muted">
            <span
              aria-hidden="true"
              className="absolute top-3.5 -left-7 size-3 -translate-y-1/2 rounded-full bg-highlight ring-4 ring-canvas"
            />
            {gate.name}
          </li>
        ))}
        {trace.after.map((milestone, index) => (
          <li
            key={milestone.text}
            className={
              index === 0
                ? "relative mt-8! text-fg text-heading-md"
                : "relative text-body text-fg"
            }
          >
            <span
              aria-hidden="true"
              className="absolute top-3.5 -left-7 size-3 -translate-y-1/2 rounded-full border-2 border-highlight bg-canvas"
            />
            {milestone.text}
          </li>
        ))}
      </ol>
    </div>
  );
}
