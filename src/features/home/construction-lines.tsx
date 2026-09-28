import { useId } from "react";
import { cn } from "@/lib/cn";
import {
  constructionCircles,
  edgeGuides,
  horizontalGuides,
  verticalGuides,
} from "./logomark-construction";

/**
 * How far the guides reach past the mark (viewBox units) and the ellipse
 * they fade out in, centred on the mark: solid over the mark, gone by the
 * guides' ends. `short` suits a mark behind copy (phones); `long` runs out
 * across a wide band like a full construction sheet.
 */
const REACH = {
  short: { overshoot: 90, rx: 330, ry: 295, solidUntil: 0.62 },
  long: { overshoot: 280, rx: 540, ry: 500, solidUntil: 0.42 },
} as const;

/** Centre of the mark's viewBox. */
const CENTRE = { x: 238.5, y: 203 };

const circles = constructionCircles();

/**
 * The logomark's construction sheet, as on the brand guide's logo page:
 * faint guides along every stroke edge and through the cap tops, centres and
 * baseline, the cap and counter circles, and a centre mark on each circle.
 * Drawn in the mark's own 477 x 406 viewBox, so it lines up with any
 * logomark placed in the same box. The guides overshoot the box and fade out
 * towards their ends (an elliptical mask around the mark), so they never stop
 * with a hard edge wherever the mark is placed. Hairlines stay 1px at any
 * size. Decorative; colour it with a text colour.
 */
export function ConstructionLines({
  reach = "short",
  className,
}: {
  /** How far the guides run past the mark; see REACH. */
  reach?: keyof typeof REACH;
  className?: string;
}) {
  // Unique per instance: the hero and the join band each draw one.
  const id = useId().replace(/:/g, "");
  const { overshoot, rx, ry, solidUntil } = REACH[reach];
  const box = overshoot + 30;
  const guides = [
    ...edgeGuides(overshoot),
    ...horizontalGuides(overshoot),
    ...verticalGuides(overshoot),
  ];
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 477 406"
      focusable="false"
      className={cn(
        "overflow-visible [&_*]:[vector-effect:non-scaling-stroke]",
        className,
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <defs>
        <radialGradient
          id={`${id}-fade`}
          gradientUnits="userSpaceOnUse"
          cx={CENTRE.x}
          cy={CENTRE.y}
          r={rx}
          gradientTransform={`translate(${CENTRE.x} ${CENTRE.y}) scale(1 ${ry / rx}) translate(${-CENTRE.x} ${-CENTRE.y})`}
        >
          <stop offset={solidUntil} stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask
          id={`${id}-mask`}
          maskUnits="userSpaceOnUse"
          x={-box}
          y={-box}
          width={477 + 2 * box}
          height={406 + 2 * box}
        >
          <rect
            x={-box}
            y={-box}
            width={477 + 2 * box}
            height={406 + 2 * box}
            fill={`url(#${id}-fade)`}
          />
        </mask>
      </defs>
      <g strokeOpacity="0.14" mask={`url(#${id}-mask)`}>
        {guides.map((line) => (
          <line key={`${line.x1},${line.y1},${line.x2},${line.y2}`} {...line} />
        ))}
      </g>
      <g strokeOpacity="0.34">
        {circles.map((circle) => (
          <circle
            key={`${circle.x},${circle.y}`}
            cx={circle.x}
            cy={circle.y}
            r={circle.r}
          />
        ))}
      </g>
      <g strokeOpacity="0.6">
        {circles.map(({ x, y }) => (
          <path key={`${x},${y}`} d={`M${x - 4} ${y}h8M${x} ${y - 4}v8`} />
        ))}
      </g>
    </svg>
  );
}
