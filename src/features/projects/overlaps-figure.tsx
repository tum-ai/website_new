import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import {
  AI_RADIUS,
  figureViewBox,
  layoutSeats,
  type Seat,
  seatBox,
  seatViewBox,
} from "./overlaps";

/** What a seat of the figure shows: a task force, or the open seat. */
type FigureSeat = {
  slug: string;
  name: string;
  field: string;
  /** The open seat: drawn dotted until the close claims it. */
  open?: boolean;
};

type OverlapsFigureProps = {
  /** Seats clockwise from the top; the open seat comes last. */
  seats: readonly FigureSeat[];
  /**
   * `index`: the hero, where every seat links to its chapter. `close`: the
   * page's end, where the open seat is drawn solid and lit. Both are the
   * same figure; only the open seat changes.
   */
  variant: "index" | "close";
  /** Accessible name of the list of seat links (`index` only). */
  label?: string;
  className?: string;
};

/**
 * The page's figure: AI in the middle, one circle per field around it, and
 * the lens where each field circle overlaps AI, which is the task force.
 * The circles are an `aria-hidden` SVG; each seat is an HTML element laid
 * exactly over its circle (a link in the `index` variant), so labels keep
 * the type scale at every size and the focus ring follows the circle.
 */
export function OverlapsFigure({
  seats,
  variant,
  label,
  className,
}: OverlapsFigureProps) {
  const layout = layoutSeats(seats.length);
  const isIndex = variant === "index";
  const Seats = isIndex ? "ul" : "div";
  return (
    <div
      className={cn(
        // A size container: the labels follow the figure's width, not the
        // viewport's, since the close draws it smaller than the hero.
        "@container relative aspect-square w-full",
        isIndex && "overlaps-hero",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox={figureViewBox(seats.length)}
        className="absolute inset-0 size-full overflow-visible"
      >
        <circle
          r={AI_RADIUS}
          fill="none"
          className="overlaps-part stroke-hairline-strong"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <p
        aria-hidden="true"
        className="overlaps-part absolute inset-0 flex items-center justify-center font-light text-display-md text-fg"
      >
        AI
      </p>
      <Seats
        // Safari drops the list role (and its name) from an unstyled list.
        role={isIndex ? "list" : undefined}
        aria-label={isIndex ? label : undefined}
        aria-hidden={isIndex ? undefined : true}
      >
        {seats.map((seat, index) => {
          const geometry = layout[index] as Seat;
          return isIndex ? (
            <li key={seat.slug}>
              <SeatShape
                as="a"
                href={`#${seat.slug}`}
                seat={seat}
                geometry={geometry}
                count={seats.length}
                lit={false}
              />
            </li>
          ) : (
            <SeatShape
              key={seat.slug}
              as="div"
              seat={seat}
              geometry={geometry}
              count={seats.length}
              lit={Boolean(seat.open)}
            />
          );
        })}
      </Seats>
    </div>
  );
}

/**
 * One seat: its circle and lens (in the seat's own square of the figure's
 * coordinates) and its label in the crescent beyond the AI circle.
 */
function SeatShape({
  as: Root,
  href,
  seat,
  geometry,
  count,
  lit,
}: {
  as: "a" | "div";
  href?: string;
  seat: FigureSeat;
  geometry: Seat;
  count: number;
  /** Draw the seat solid with its lens filled (the close's open seat). */
  lit: boolean;
}) {
  const dotted = seat.open && !lit;
  const style = {
    ...seatBox(geometry, count),
    "--seat-x": geometry.ux,
    "--seat-y": geometry.uy,
    "--seat-delay": `${260 + geometry.index * 90}ms`,
  } as CSSProperties;
  // The label's place, as shares of the seat's square (side 2r).
  const inSeat = (value: number, origin: number) =>
    `${(((value - origin + geometry.r) / (2 * geometry.r)) * 100).toFixed(3)}%`;
  const labelStyle = {
    left: inSeat(geometry.label.x, geometry.cx),
    top: inSeat(geometry.label.y, geometry.cy),
    width: `${((geometry.label.width / (2 * geometry.r)) * 100).toFixed(3)}%`,
  };

  return (
    <Root
      href={href}
      style={style}
      className={cn(
        "overlaps-part group/seat absolute rounded-full",
        Root === "a" && "focus-visible:outline-offset-4",
      )}
    >
      <svg
        aria-hidden="true"
        viewBox={seatViewBox(geometry)}
        className="absolute inset-0 size-full overflow-visible"
      >
        <path
          d={geometry.lens}
          className={cn(
            "fill-highlight transition-opacity duration-300 ease-brand",
            lit
              ? "opacity-100"
              : dotted
                ? "opacity-0 group-hover/seat:opacity-40 group-focus-visible/seat:opacity-40"
                : "opacity-30 group-hover/seat:opacity-60 group-focus-visible/seat:opacity-60",
          )}
        />
        {Root === "a" && !dotted ? (
          // Hover and focus draw the seat in the accent; only the close's
          // open seat gets the solid lens.
          <circle
            cx={geometry.cx}
            cy={geometry.cy}
            r={geometry.r}
            fill="none"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            className="stroke-highlight opacity-0 transition-opacity duration-300 ease-brand group-hover/seat:opacity-100 group-focus-visible/seat:opacity-100"
          />
        ) : null}
        <circle
          cx={geometry.cx}
          cy={geometry.cy}
          r={geometry.r}
          fill="none"
          strokeWidth={lit || dotted ? 2 : 1}
          strokeDasharray={dotted ? "0 5" : undefined}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className={
            lit || dotted ? "stroke-highlight" : "stroke-hairline-strong"
          }
        />
      </svg>
      <span
        className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
        style={labelStyle}
      >
        <span
          className={cn(
            "text-balance font-medium @lg:text-label text-label-sm",
            seat.open ? "text-highlight" : "text-fg",
          )}
        >
          {seat.name}
        </span>
        <span className="mt-0.5 @lg:block hidden text-balance text-fg-subtle text-meta">
          {seat.field}
        </span>
      </span>
    </Root>
  );
}

/**
 * A task force's place in the figure, for its chapter: the same circles in
 * miniature with its own lens filled and its circle drawn in the accent.
 * Decorative; the chapter says the same in words.
 */
export function OverlapsLocator({
  count,
  index,
  className,
}: {
  /** Seats in the figure, the open one included. */
  count: number;
  /** The task force's seat. */
  index: number;
  className?: string;
}) {
  const layout = layoutSeats(count);
  return (
    <svg
      aria-hidden="true"
      viewBox={figureViewBox(count)}
      className={cn("overflow-visible", className)}
    >
      <circle
        r={AI_RADIUS}
        fill="none"
        className="stroke-hairline-strong"
        vectorEffect="non-scaling-stroke"
      />
      {layout.map((seat) => {
        const own = seat.index === index;
        const open = seat.index === count - 1;
        return (
          <g key={seat.index}>
            {own ? <path d={seat.lens} className="fill-highlight" /> : null}
            <circle
              cx={seat.cx}
              cy={seat.cy}
              r={seat.r}
              fill="none"
              strokeWidth={own ? 2 : open ? 1.5 : 1}
              strokeDasharray={open ? "0 4" : undefined}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className={own ? "stroke-highlight" : "stroke-hairline-strong"}
            />
          </g>
        );
      })}
    </svg>
  );
}
