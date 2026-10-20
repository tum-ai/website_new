import { cn } from "@/lib/cn";
import type { SeasonStopView } from "./hackathons-view";

/**
 * The league's season as one route: each match a node in an even column,
 * its name and dates under it, and one line through the nodes, lit as far
 * as today (`layoutSeason`). Played matches are filled, the next one is
 * ringed in the accent, and the Grand Finale's node is the largest. Screen
 * readers get the matches as a list; the line and nodes are decoration.
 */
export function SeasonRoute({
  stops,
  progress,
  label,
  className,
}: {
  stops: readonly SeasonStopView[];
  /** How far the season has come along the line (see `layoutSeason`). */
  progress: number;
  /** The accessible name of the list of matches. */
  label: string;
  className?: string;
}) {
  // The line runs from the first column's centre to the last one's.
  const inset = 50 / stops.length;
  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden="true"
        className="absolute top-3 h-px -translate-y-1/2 bg-hairline-strong"
        style={{ left: `${inset}%`, right: `${inset}%` }}
      >
        <span
          className="absolute inset-y-0 left-0 bg-highlight"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <ol
        aria-label={label}
        className="relative grid"
        style={{
          gridTemplateColumns: `repeat(${stops.length}, minmax(0, 1fr))`,
        }}
      >
        {stops.map((stop) => (
          <li
            key={stop.key}
            className="grid content-start justify-items-center gap-1 px-2 text-center"
          >
            <span
              aria-hidden="true"
              className="mb-6 grid size-6 place-items-center"
            >
              <span
                className={cn(
                  "block rounded-full",
                  stop.state === "past" && "size-2.5 bg-highlight",
                  stop.state === "next" &&
                    "size-3 bg-highlight ring-2 ring-highlight ring-offset-4 ring-offset-canvas",
                  stop.state === "upcoming" &&
                    "size-3 bg-canvas ring-1 ring-highlight",
                  stop.finale && stop.state !== "past" && "size-4",
                )}
              />
            </span>
            <span
              className={cn(
                "font-semibold text-label-sm",
                stop.state === "past" ? "text-fg-subtle" : "text-highlight",
              )}
            >
              {stop.label}
            </span>
            <span
              className={cn(
                "text-heading-lg",
                stop.state === "past" ? "text-fg-muted" : "text-fg",
              )}
            >
              {stop.city}
            </span>
            <time dateTime={stop.dateTime} className="text-fg-muted text-small">
              {stop.dates}
            </time>
            {stop.note ? (
              <span className="tabular font-semibold text-highlight text-small">
                {stop.note}
              </span>
            ) : null}
            {stop.detail ? (
              <span className="text-fg-subtle text-meta">{stop.detail}</span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
