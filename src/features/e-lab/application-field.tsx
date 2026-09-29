import type { CSSProperties } from "react";
import { applicationField, type FieldGroup } from "./data/field";
import { gates } from "./data/selection";

/** Dot radius in lattice units (the pitch between neighbours is 1). */
const RADIUS = 0.3;

/**
 * When each gate's dots start going out and how long the group takes, in
 * ms after load. Dots fade one by one within their group's span, so the
 * field visibly thins: the first gate removes most of the field slowly,
 * the later gates take a few dots each.
 */
const START = 700;
const FIRST_SPAN = 2600;
const LATER_SPAN = 700;
const PAUSE = 450;

const field = applicationField(gates);
const finalGate = gates.length - 1;
const finalists = gates[finalGate]?.teams ?? 0;
const extent = round(field.radius + RADIUS);

/** Three decimals are enough for the drawing and keep the markup short. */
function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

/** Start of each gate's group, in ms: after the previous group and a pause. */
const groupStarts = field.groups.reduce<number[]>((starts, _, index) => {
  const previous = starts[index - 1];
  starts.push(
    previous === undefined
      ? START
      : previous + (index === 1 ? FIRST_SPAN : LATER_SPAN) + PAUSE,
  );
  return starts;
}, []);

/** The dot's fade delay: its place within its group's span. */
function delayOf(group: FieldGroup, index: number) {
  const span = group.gateIndex === 0 ? FIRST_SPAN : LATER_SPAN;
  const start = groupStarts[group.gateIndex] ?? START;
  return Math.round(start + (index / Math.max(1, group.dots.length)) * span);
}

/**
 * The hero's field: one dot per team application of a round, evenly spaced
 * in a round field. On load the dots go out one by one, gate after gate
 * (`.elab-field-out` in e-lab.css, opacity only), until only the teams that
 * reach the Final Pitch stay lit; with reduced motion it renders in that end
 * state. Server markup only. The drawing is decorative: the caption says
 * the same in words.
 */
export function ApplicationField({ className }: { className?: string }) {
  return (
    <figure className={className}>
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox={`${-extent} ${-extent} ${extent * 2} ${extent * 2}`}
        className="mx-auto block aspect-square h-auto w-full max-w-xl text-highlight"
      >
        {field.groups.map((group) => (
          <g key={group.gateIndex} fill="currentColor">
            {group.dots.map((dot, index) => (
              <circle
                key={`${dot.x}:${dot.y}`}
                cx={round(dot.x)}
                cy={round(dot.y)}
                r={RADIUS}
                className={
                  group.gateIndex < finalGate ? "elab-field-out" : undefined
                }
                style={
                  group.gateIndex < finalGate
                    ? ({
                        "--delay": `${delayOf(group, index)}ms`,
                      } as CSSProperties)
                    : undefined
                }
              />
            ))}
          </g>
        ))}
      </svg>
      <figcaption className="mx-auto mt-6 max-w-xl text-fg-subtle text-meta">
        Each dot is one team application in a round. The {finalists} still lit
        pitch at the Final Pitch.
      </figcaption>
    </figure>
  );
}
