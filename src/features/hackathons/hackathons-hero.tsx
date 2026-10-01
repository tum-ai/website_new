import { Eyebrow, Section, TopBlend } from "@/components/ds";
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

/**
 * The page's opening and its one bold element: every TUM.ai hackathon on
 * one time axis, to scale, full bleed under the heading. On wide screens
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
          <div className="max-w-3xl">
            <Eyebrow className="motion-safe:animate-rise-sm">
              {hero.eyebrow}
            </Eyebrow>
            <h1
              id="hackathons-hero-title"
              className="mt-6 text-display-lg text-fg [animation-delay:80ms] motion-safe:animate-rise-sm"
            >
              {hero.title}
            </h1>
            <p className="mt-7 max-w-2xl text-fg-muted text-lead [animation-delay:240ms] motion-safe:animate-rise-sm">
              {hero.lead}
            </p>
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
