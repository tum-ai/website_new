import {
  Container,
  LogoTile,
  QuoteCard,
  Reveal,
  Section,
  SectionHeader,
} from "@tum.ai/ui-kit";
import { isUnoptimizedRemoteImage } from "@/lib/image-optimization";
import type { ELabCopy, FounderRow } from "./data/copy";
import type { Gate } from "./data/selection";
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
 * it went next. Below it, the ventures' funding and the founders of past
 * batches as a table, with the figures each venture reported. Ventures,
 * quotes and the trace come from the venture slice, the table from the page
 * copy; the section hides when the traced venture or its founder quote is
 * missing.
 * `gates` are the cohort's gates as the page draws them; `fundingText` is
 * the ventures' funding as the site facts state it ("€8M+").
 */
export async function VentureTrace({
  copy,
  gates,
  fundingText,
}: {
  copy: ELabCopy["ventures"];
  gates: readonly Gate[];
  fundingText: string;
}) {
  const [startups, cards, trace] = await Promise.all([
    getNotableStartups(),
    getTestimonialCards(),
    getTracedVenture(),
  ]);
  const venture = startups.find((startup) => startup.id === trace.startupId);
  const founder = cards.find((card) => card.id === trace.testimonialId);
  if (!venture || !founder) return null;
  return (
    <Section tone="ink" spacing="lg" aria-labelledby="venture-trace-title">
      <Container>
        <SectionHeader
          id="venture-trace-title"
          title={copy.title}
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
              portrait={{
                unoptimized: isUnoptimizedRemoteImage(founder.portraitSrc),
                src: founder.portraitSrc,
                position: founder.portraitPosition,
              }}
            />
          </Reveal>
          <Reveal delay={120} className="lg:col-span-4 lg:col-start-9">
            <Trail venture={venture} trace={trace} gates={gates} />
          </Reveal>
        </div>

        <div className="mt-20 border-hairline-strong border-t pt-10 md:mt-28">
          <h3 className="grid gap-4 lg:grid-cols-12 lg:items-end lg:gap-12">
            <span className="tabular text-display-2xl text-highlight lg:col-span-5">
              {fundingText}
            </span>
            <span className="max-w-md text-fg text-heading-lg lg:col-span-7 lg:justify-self-end lg:pb-3 lg:text-right">
              {copy.fundingNote}
            </span>
          </h3>
          {copy.founders.length > 0 ? (
            <FoundersTable
              title={copy.foundersTitle}
              founders={copy.founders}
            />
          ) : null}
        </div>
      </Container>
    </Section>
  );
}

/**
 * "Founders from past batches": one row per venture, its name, cohort and
 * line on the left, up to four figures in a row, and who backs it. From lg a
 * table on hairlines; on phones each venture stacks, its figures two by two.
 */
function FoundersTable({
  title,
  founders,
}: {
  title: string;
  founders: readonly FounderRow[];
}) {
  return (
    <div className="mt-16 md:mt-20">
      <h3 id="founders-title" className="text-display-md text-fg">
        {title}
      </h3>
      <ul aria-labelledby="founders-title" className="mt-8 md:mt-10">
        {founders.map((row) => (
          <li
            key={row.key}
            className="grid gap-6 border-hairline-strong border-t py-7 lg:grid-cols-12 lg:gap-x-8 lg:py-8"
          >
            <div className="lg:col-span-3">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {row.href ? (
                  <a
                    href={row.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fg text-heading-md underline-offset-4 hover:underline"
                  >
                    {row.name}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <span className="text-fg text-heading-md">{row.name}</span>
                )}
                {row.edition ? (
                  <span className="rounded-md bg-highlight/15 px-2 py-0.5 font-medium text-highlight text-meta">
                    {row.edition}
                  </span>
                ) : null}
              </p>
              <p className="mt-2 max-w-xs text-fg-muted text-small">
                {row.summary}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4 lg:col-span-6">
              {row.metrics.map((metric) => (
                <div key={metric.label} className="flex flex-col">
                  <dt className="order-last mt-1 text-fg-subtle text-meta">
                    {metric.label}
                  </dt>
                  <dd className="tabular text-fg text-heading-md">
                    {metric.value}
                  </dd>
                </div>
              ))}
            </dl>
            {row.backedBy ? (
              <div className="lg:col-span-3">
                <p className="text-fg-subtle text-meta">Backed by</p>
                <p className="mt-1 font-medium text-body text-fg">
                  {row.backedBy.name}
                </p>
                {row.backedBy.note ? (
                  <p className="mt-1 text-fg-muted text-meta">
                    {row.backedBy.note}
                  </p>
                ) : null}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
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
  gates,
}: {
  venture: NotableStartup;
  trace: TracedVenture;
  gates: readonly Gate[];
}) {
  return (
    <div>
      <div className="border-hairline-strong border-b pb-5">
        <LogoTile
          variant="chip"
          name={venture.name}
          src={venture.logoSrc}
          unoptimized={isUnoptimizedRemoteImage(venture.logoSrc ?? "")}
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
