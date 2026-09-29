/**
 * How long a stretch of a program runs, as a number and a unit, so the page
 * text ("4 weeks") and the arithmetic (do the E-Lab phases fill the
 * program?) come from one value. Isomorphic: the /e-lab page, its content
 * slice and the Studio validation (`schemas/content/e-lab-copy.ts`) use it.
 */

/** The units a duration is written in. */
export const durationUnits = ["days", "weeks"] as const;

type DurationUnit = (typeof durationUnits)[number];

/** A whole number of days or weeks, at least one. */
export type Duration = { amount: number; unit: DurationUnit };

/** Whether `value` is a {@link Duration}: a positive whole amount and a known unit. */
export function isDuration(value: unknown): value is Duration {
  const { amount, unit } = (value ?? {}) as Partial<Duration>;
  return (
    Number.isInteger(amount) &&
    (amount as number) > 0 &&
    durationUnits.includes(unit as DurationUnit)
  );
}

/** The duration as the page shows it: "3 days", "1 week". */
export function formatDuration({ amount, unit }: Duration): string {
  return `${amount} ${amount === 1 ? unit.slice(0, -1) : unit}`;
}

/** The duration in weeks, days counted as sevenths of a week. */
export function durationInWeeks({ amount, unit }: Duration): number {
  return unit === "weeks" ? amount : amount / 7;
}
