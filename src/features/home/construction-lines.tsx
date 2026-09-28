import { cn } from "@/lib/cn";
import {
  constructionCircles,
  edgeGuides,
  horizontalGuides,
  verticalGuides,
} from "./logomark-construction";

const guides = [...edgeGuides(), ...horizontalGuides(), ...verticalGuides()];
const circles = constructionCircles();

/**
 * The logomark's construction sheet, as on the brand guide's logo page:
 * faint guides along every stroke edge and through the cap tops, centres and
 * baseline, the cap and counter circles, and a centre mark on each circle.
 * Drawn in the mark's own 477 x 406 viewBox, so it lines up with any
 * logomark placed in the same box; the guides overshoot the box. Hairlines
 * stay 1px at any size. Decorative; colour it with a text colour.
 */
export function ConstructionLines({ className }: { className?: string }) {
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
      <g strokeOpacity="0.14">
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
