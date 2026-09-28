import { useId } from "react";
import { cn } from "@/lib/cn";
import {
  constructionCircles,
  edgeGuides,
  horizontalGuides,
  verticalGuides,
} from "./logomark-construction";

const guides = [...edgeGuides(), ...horizontalGuides(), ...verticalGuides()];

/** Room around the viewBox for the mask; covers every guide's overshoot. */
const OVERSHOOT_BOX = 120;

/**
 * The fade ellipse: centred on the mark, reaching the guides' ends (90 units
 * past the viewBox), so every guide is solid over the mark and gone by its end.
 */
const GUIDE_BOX = { cx: 238.5, cy: 203, rx: 330, ry: 295 };
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
export function ConstructionLines({ className }: { className?: string }) {
  // Unique per instance: the hero and the join band each draw one.
  const id = useId().replace(/:/g, "");
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
          cx={GUIDE_BOX.cx}
          cy={GUIDE_BOX.cy}
          r={GUIDE_BOX.rx}
          gradientTransform={`translate(${GUIDE_BOX.cx} ${GUIDE_BOX.cy}) scale(1 ${GUIDE_BOX.ry / GUIDE_BOX.rx}) translate(${-GUIDE_BOX.cx} ${-GUIDE_BOX.cy})`}
        >
          <stop offset="0.62" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask
          id={`${id}-mask`}
          maskUnits="userSpaceOnUse"
          x={-OVERSHOOT_BOX}
          y={-OVERSHOOT_BOX}
          width={477 + 2 * OVERSHOOT_BOX}
          height={406 + 2 * OVERSHOOT_BOX}
        >
          <rect
            x={-OVERSHOOT_BOX}
            y={-OVERSHOOT_BOX}
            width={477 + 2 * OVERSHOOT_BOX}
            height={406 + 2 * OVERSHOOT_BOX}
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
