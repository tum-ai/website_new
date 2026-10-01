import { cn } from "@/lib/cn";
import type { HackathonsCopy } from "./data/copy";
import type { hackathonsView } from "./hackathons-view";
import type { MarkKind } from "./marks";
import { RibbonScrubber } from "./ribbon-scrubber";
import { RibbonTrack, RibbonYears } from "./ribbon-track";

type View = ReturnType<typeof hackathonsView>;

/** The key's swatch for each kind, as the track draws it. */
const swatches: Record<MarkKind, string> = {
  makeathon: "h-4 bg-highlight",
  league: "h-2.5 bg-highlight",
  partner: "h-2.5 bg-fg/40",
};

/** A fraction as a CSS percentage. */
const percent = (fraction: number) => `${fraction * 100}%`;

/**
 * The page's figure: every TUM.ai hackathon on one time axis, to scale.
 * Wide screens get one continuous ribbon with a slider over it; phones get
 * one row per year on the same scale. Screen readers get the list.
 */
export function HackathonRibbon({
  ribbon,
  copy,
}: {
  ribbon: View["ribbon"];
  copy: Pick<
    HackathonsCopy["hero"],
    "ribbonLabel" | "sliderLabel" | "nextLabel" | "legend"
  >;
}) {
  const { entries, continuous, byYear, recent } = ribbon;
  const placed = new Map(continuous.marks.map((mark) => [mark.id, mark]));
  const nextIndex = entries.findIndex(({ next }) => next);
  const defaultIndex = nextIndex === -1 ? entries.length - 1 : nextIndex;

  return (
    <figure>
      <ol aria-label={copy.ribbonLabel} className="sr-only">
        {entries.map((entry) => (
          <li key={entry.id}>
            {entry.title}, {entry.dates}
            {entry.next ? ` (${copy.nextLabel.toLowerCase()})` : ""}
          </li>
        ))}
      </ol>
      <RibbonScrubber
        label={copy.sliderLabel}
        defaultIndex={defaultIndex}
        entries={entries.map((entry) => ({
          id: entry.id,
          title: entry.title,
          dates: entry.dates,
          label: entry.next ? copy.nextLabel : copy.legend[entry.kind],
          x: placed.get(entry.id)?.x ?? 0,
          w: placed.get(entry.id)?.w ?? 0,
        }))}
        track={
          <>
            {recent.to > recent.from ? (
              <div className="relative mb-5 h-12">
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 h-2 border-hairline-strong border-x border-t"
                  style={{
                    left: percent(recent.from),
                    width: percent(recent.to - recent.from),
                  }}
                />
                <p
                  className="absolute bottom-4 whitespace-nowrap text-fg-muted text-meta"
                  style={{ right: percent(1 - recent.to) }}
                >
                  {recent.label}
                </p>
              </div>
            ) : null}
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
                  className="tabular pt-8 text-fg-subtle text-meta"
                >
                  {row.year}
                </span>
                <RibbonTrack size="year" marks={row.marks} lanes={row.lanes} />
              </div>
            ))}
          </div>
        }
      />
      <ul
        aria-hidden="true"
        className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-fg-muted text-meta"
      >
        {(Object.keys(swatches) as MarkKind[]).map((kind) => (
          <li key={kind} className="flex items-center gap-2">
            <span className={cn("w-1 rounded-xs", swatches[kind])} />
            {copy.legend[kind]}
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-1 rounded-xs outline-1 outline-highlight -outline-offset-1" />
          {copy.nextLabel}
        </li>
      </ul>
    </figure>
  );
}
