import { eLabApplicationCopy } from "@/config/e-lab";
import { applicationField, type FieldGroup } from "./data/field";
import { gates } from "./data/selection";
import type { NotableStartup } from "./data/venture-page";
import { type FieldDotData, FieldDots } from "./field-dots";
import { getNotableStartups } from "./venture-content";

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
const { minX, maxX, minY, maxY } = field.bounds;
const viewBox = [
  minX - RADIUS,
  minY - RADIUS,
  maxX - minX + RADIUS * 2,
  maxY - minY + RADIUS * 2,
]
  .map(round)
  .join(" ");

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
 * Every dot with its fade delay. The dots that stay lit carry the alumni
 * ventures, one each, in the list's order; once the ventures run out, the
 * remaining lit dots open as places for a new team in the current cohort.
 */
const fieldDots = (ventures: readonly NotableStartup[]): FieldDotData[] =>
  field.groups.flatMap((group) =>
    group.dots.map((dot, index) => {
      const lit = group.gateIndex === finalGate;
      const venture = lit ? ventures[index] : undefined;
      return {
        x: round(dot.x),
        y: round(dot.y),
        delay: lit ? undefined : delayOf(group, index),
        invite:
          lit && !venture
            ? (["Your team", eLabApplicationCopy.cohortName] as [
                string,
                string,
              ])
            : undefined,
        venture: venture && {
          name: venture.name,
          href: venture.href,
          logoSrc: venture.logoSrc,
          wordmark: venture.wordmarkLabel,
        },
      };
    }),
  );

/**
 * The hero's field: one dot per team application of a round, evenly spaced
 * in an irregular outline. On load the dots go out one by one, gate after
 * gate (`.elab-field-out` in e-lab.css, opacity only), until only the teams
 * that reach the Final Pitch stay lit; with reduced motion it renders in
 * that end state. Pointing at a dot pushes the field aside (see FieldDots),
 * and lit dots open into ventures that came out of the E-Lab (the venture
 * slice: the CMS list or the code list).
 */
export async function ApplicationField({ className }: { className?: string }) {
  const dots = fieldDots(await getNotableStartups());
  const ventureCount = dots.filter((dot) => dot.venture).length;
  return (
    <figure className={className}>
      <FieldDots
        dots={dots}
        viewBox={viewBox}
        radius={RADIUS}
        className="mx-auto block h-auto max-h-[34rem] w-full max-w-xl touch-manipulation overflow-visible text-highlight"
      />
      <figcaption className="mx-auto mt-6 max-w-xl text-fg-subtle text-meta">
        Each dot is one team application in a round. The {finalists} still lit
        pitch at the Final Pitch: {ventureCount} open into ventures from earlier
        cohorts, and {finalists - ventureCount} are left for new teams.
      </figcaption>
    </figure>
  );
}
