import { ButtonLink, Eyebrow, Section, TopBlend } from "@tum.ai/ui-kit";
import { Fragment } from "react";
import { cn } from "@/lib/cn";
import type { hackathonsView } from "./hackathons-view";
import type { MarkKind } from "./marks";
import { RibbonReplay } from "./ribbon-replay";
import { RibbonTrack, RibbonYears } from "./ribbon-track";

type View = ReturnType<typeof hackathonsView>;

/** The key's swatch for each kind, as the track draws it. */
const swatches: Record<MarkKind, string> = {
  makeathon: "h-4 bg-highlight",
  league: "h-2.5 bg-highlight",
  partner: "h-2.5 bg-fg/40",
};

/** "We run X. We founded Y." as its sentences, one line each. */
const sentencesOf = (text: string) => text.split(/(?<=[.!?])\s+/);

/**
 * The page's opening: the two flagships claimed in the headline, a way to
 * each one's own site, a line on the league's Grand Finale (its date
 * until it ends, then its champion), and
 * every TUM.ai hackathon on one time axis, to scale, full bleed under the
 * heading. On wide screens
 * with motion allowed, scrolling replays the record (`RibbonReplay`); phones
 * get one row per year on the same scale. Screen readers get the list, each
 * hackathon with its kind and dates.
 */
export function HackathonsHero({ hero }: { hero: View["hero"] }) {
  const { entries, continuous, byYear } = hero.ribbon;
  const placed = new Map(continuous.marks.map((mark) => [mark.id, mark]));
  const nextIndex = entries.findIndex(({ next }) => next);
  const defaultIndex = nextIndex === -1 ? entries.length - 1 : nextIndex;
  const labelOf = (entry: (typeof entries)[number]) =>
    entry.next ? hero.nextLabel : hero.legend[entry.kind];

  return (
    <Section
      tone="night"
      spacing="none"
      aria-labelledby="hackathons-hero-title"
      className="overflow-clip"
    >
      <TopBlend />
      <figure className="sr-only" aria-labelledby="hackathons-ribbon-label">
        <figcaption id="hackathons-ribbon-label">{hero.ribbonLabel}</figcaption>
        <ol>
          {entries.map((entry) => (
            <li key={entry.id}>
              {entry.title}, {hero.legend[entry.kind]}, {entry.dates}
              {entry.next
                ? ` (${hero.nextLabel.toLowerCase()})`
                : entry.upcoming
                  ? " (upcoming)"
                  : ""}
            </li>
          ))}
        </ol>
      </figure>
      <RibbonReplay
        label={hero.sliderLabel}
        defaultIndex={defaultIndex}
        entries={entries.map((entry) => ({
          id: entry.id,
          title: entry.title,
          dates: entry.dates,
          label: labelOf(entry),
          x: placed.get(entry.id)?.x ?? 0,
          w: placed.get(entry.id)?.w ?? 0,
        }))}
        intro={
          <div className="max-w-4xl">
            <Eyebrow className="motion-safe:animate-rise-sm">
              {hero.eyebrow}
            </Eyebrow>
            <h1
              id="hackathons-hero-title"
              className="mt-6 text-balance text-display-lg text-fg [animation-delay:80ms] motion-safe:animate-rise-sm"
            >
              {sentencesOf(hero.title).map((sentence, position) => (
                <Fragment key={sentence}>
                  {/* Between the lines, so the heading's name keeps its spaces. */}
                  {position > 0 ? " " : null}
                  <span className="block">{sentence}</span>
                </Fragment>
              ))}
            </h1>
            <p className="mt-7 max-w-2xl text-fg-muted text-lead [animation-delay:240ms] motion-safe:animate-rise-sm">
              {hero.lead}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3 [animation-delay:320ms] motion-safe:animate-rise-sm">
              <ButtonLink href={hero.leagueUrl} size="lg" arrow="external">
                {hero.leagueAction}
              </ButtonLink>
              <ButtonLink
                href={hero.makeathonUrl}
                size="lg"
                variant="inverse"
                arrow="external"
              >
                {hero.makeathonAction}
              </ButtonLink>
            </div>
            {hero.line ? (
              <a
                href="#league"
                className="group mt-7 inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-sm text-small [animation-delay:400ms] motion-safe:animate-rise-sm"
              >
                <span
                  aria-hidden="true"
                  className="size-2 translate-y-[-0.1em] self-center rounded-full bg-highlight"
                />
                <span className="font-semibold text-highlight text-label-sm">
                  {hero.line.label}
                </span>
                <span className="text-fg underline-offset-4 group-hover:underline">
                  {"dateTime" in hero.line ? (
                    <time dateTime={hero.line.dateTime}>{hero.line.text}</time>
                  ) : (
                    hero.line.text
                  )}
                </span>
                {"meta" in hero.line && hero.line.meta ? (
                  <span className="tabular text-fg-muted">
                    {hero.line.meta}
                  </span>
                ) : null}
              </a>
            ) : null}
          </div>
        }
        track={
          <>
            <RibbonTrack
              size="hero"
              animate
              marks={continuous.marks}
              lanes={continuous.lanes}
              years={continuous.years}
            />
            <RibbonYears years={continuous.years} className="mt-3" />
          </>
        }
        compact={
          <div className="hk-animate grid gap-5">
            {byYear.map((row) => (
              <div
                key={row.year}
                className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-start gap-3"
              >
                <span
                  aria-hidden="true"
                  className="tabular pt-9 text-fg-subtle text-meta"
                >
                  {row.year}
                </span>
                <RibbonTrack size="year" marks={row.marks} lanes={row.lanes} />
              </div>
            ))}
          </div>
        }
        legend={
          <ul
            aria-hidden="true"
            className="flex flex-wrap gap-x-6 gap-y-2 text-fg-muted text-meta"
          >
            {(Object.keys(swatches) as MarkKind[]).map((kind) => (
              <li key={kind} className="flex items-center gap-2">
                <span className={cn("w-1 rounded-xs", swatches[kind])} />
                {hero.legend[kind]}
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-1 rounded-xs outline-1 outline-highlight -outline-offset-1" />
              {hero.nextLabel}
            </li>
          </ul>
        }
      />
    </Section>
  );
}
