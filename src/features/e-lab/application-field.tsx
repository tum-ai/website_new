import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { applicationField } from "./data/field";
import { gates } from "./data/selection";

/** Dots per row; the rows follow from the applications in eLabConfig.selection. */
const COLUMNS = 25;
/**
 * Grid pitch and dot radii, in SVG units. The teams still lit are drawn a
 * little larger on the same centres, so they read at phone width too.
 */
const PITCH = 10;
const RADIUS = 2.2;
const LIT_RADIUS = 3.2;

const field = applicationField(gates, COLUMNS);
const finalGate = gates.length - 1;
const finalists = gates[finalGate]?.teams ?? 0;

/**
 * The hero's field: one dot per team application of a round, in an exact
 * grid. On load the dots go out gate by gate (`.elab-field-out` in
 * e-lab.css, opacity only), until only the teams that reach the Final Pitch
 * stay lit; with reduced motion it renders in that end state. Server markup
 * only. The drawing is decorative: the caption says the same in words.
 */
export function ApplicationField({ className }: { className?: string }) {
  return (
    <figure className={className}>
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox={`0 0 ${field.columns * PITCH} ${field.rows * PITCH}`}
        className="block h-auto w-full text-highlight"
      >
        {field.groups.map((group) => (
          <g
            key={group.gateIndex}
            fill="currentColor"
            className={cn(group.gateIndex < finalGate && "elab-field-out")}
            style={{ "--gate": group.gateIndex } as CSSProperties}
          >
            {group.dots.map((dot) => (
              <circle
                key={`${dot.column}:${dot.row}`}
                cx={dot.column * PITCH + PITCH / 2}
                cy={dot.row * PITCH + PITCH / 2}
                r={group.gateIndex === finalGate ? LIT_RADIUS : RADIUS}
              />
            ))}
          </g>
        ))}
      </svg>
      <figcaption className="mt-5 max-w-sm text-fg-subtle text-meta">
        Each dot is one team application in a round. The {finalists} still lit
        pitch at the Final Pitch.
      </figcaption>
    </figure>
  );
}
